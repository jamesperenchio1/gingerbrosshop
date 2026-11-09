import type { VercelRequest, VercelResponse } from '@vercel/node';

// x402 (HTTP 402) paid endpoint. Payments settle in USDC to the shop's wallet.
// Network is Base Sepolia (testnet) because the free facilitator at x402.org
// only supports testnets; switching to Base mainnet needs a mainnet-capable
// facilitator (e.g. Coinbase CDP) plus the USDC address below for `base`.
const PAY_TO = '0x941eb61c0052da28d09e39f7ddc946a9631a5eeb';
const NETWORK = 'base-sepolia';
const USDC_BASE_SEPOLIA = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
const AMOUNT = '10000'; // 0.01 USDC (6 decimals)
const FACILITATOR = 'https://x402.org/facilitator';

const CARD = {
  drink: 'Ginger Fizz',
  serve: 'Pour over plenty of ice and add a wedge of lime.',
  pairing: 'Grilled satay, spicy salads and fried chicken.',
  shop: 'https://gingerbrosshop.com/shop',
};

function requirements(resource: string) {
  return {
    scheme: 'exact',
    network: NETWORK,
    maxAmountRequired: AMOUNT,
    resource,
    description: 'GingerBros Ginger Fizz serving card (demo paid resource, testnet USDC)',
    mimeType: 'application/json',
    payTo: PAY_TO,
    maxTimeoutSeconds: 60,
    asset: USDC_BASE_SEPOLIA,
    extra: { name: 'USDC', version: '2' },
  };
}

async function facilitator(path: 'verify' | 'settle', payload: unknown) {
  const r = await fetch(`${FACILITATOR}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return (await r.json()) as Record<string, any>;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const resource = 'https://gingerbrosshop.com/api/x402';
  const accepts = requirements(resource);
  const header = req.headers['x-payment'];
  const payment = Array.isArray(header) ? header[0] : header;

  // x402 v2 clients read the same terms from a base64 PAYMENT-REQUIRED header
  // (CAIP-2 network id, `amount`); the v1 body below stays for v1 clients.
  const v2 = (error: string) => ({
    x402Version: 2,
    error,
    resource: { url: resource, description: accepts.description, mimeType: accepts.mimeType },
    accepts: [
      {
        scheme: accepts.scheme,
        network: 'eip155:84532',
        amount: accepts.maxAmountRequired,
        asset: accepts.asset,
        payTo: accepts.payTo,
        maxTimeoutSeconds: accepts.maxTimeoutSeconds,
        extra: accepts.extra,
      },
    ],
  });

  const challenge = (error: string) => {
    res.setHeader('PAYMENT-REQUIRED', Buffer.from(JSON.stringify(v2(error))).toString('base64'));
    res.setHeader('Cache-Control', 'no-store');
    res.status(402).json({ x402Version: 1, error, accepts: [accepts] });
  };

  if (!payment) return challenge('X-PAYMENT header is required');

  try {
    const decoded = JSON.parse(Buffer.from(payment, 'base64').toString('utf8'));
    const body = { x402Version: 1, paymentPayload: decoded, paymentRequirements: accepts };
    const verified = await facilitator('verify', body);
    if (!verified.isValid) return challenge(verified.invalidReason || 'Payment invalid');
    const settled = await facilitator('settle', body);
    if (!settled.success) return challenge(settled.errorReason || 'Settlement failed');
    res.setHeader('X-PAYMENT-RESPONSE', Buffer.from(JSON.stringify(settled)).toString('base64'));
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json(CARD);
  } catch {
    challenge('Invalid X-PAYMENT header');
  }
}
