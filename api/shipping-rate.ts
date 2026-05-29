import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simple flat-rate shipping calculator for Thailand
const RATES: Record<string, number> = {
  bangkok: 50,
  metro: 50,
  central: 50,
  north: 80,
  northeast: 80,
  south: 80,
  east: 60,
  west: 60,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const province = (req.query.province as string)?.toLowerCase().trim() ?? '';
  const subtotal = Number(req.query.subtotal ?? 0);

  // Free shipping over ฿500
  if (subtotal >= 500) {
    res.status(200).json({ rate: 0, free: true, estimatedDays: '2–4' });
    return;
  }

  // Bangkok & surrounding
  const bangkokProvinces = ['bangkok', 'krung thep maha nakhon', 'nonthaburi', 'samut prakan', 'pathum thani', 'samut sakhon', 'nakhon pathom'];
  if (bangkokProvinces.some((p) => province.includes(p))) {
    res.status(200).json({ rate: 50, free: false, estimatedDays: '1–2' });
    return;
  }

  // Central
  const centralProvinces = ['ayutthaya', 'ang thong', 'chainat', 'lopburi', 'saraburi', 'sing buri', 'suphanburi', 'kanchanaburi', 'ratchaburi', 'samut songkhram', 'phetchaburi', 'prachuap khiri khan'];
  if (centralProvinces.some((p) => province.includes(p))) {
    res.status(200).json({ rate: 50, free: false, estimatedDays: '2–3' });
    return;
  }

  // North
  const northProvinces = ['chiang mai', 'chiang rai', 'lampang', 'lamphun', 'mae hong son', 'nan', 'phayao', 'phrae', 'uttaradit', 'tak', 'sukhothai', 'phitsanulok', 'phichit', 'kamphaeng phet', 'nakhon sawan', 'uthai thani', 'phechabun'];
  if (northProvinces.some((p) => province.includes(p))) {
    res.status(200).json({ rate: 80, free: false, estimatedDays: '3–4' });
    return;
  }

  // Northeast
  const neProvinces = ['kalasin', 'khon kaen', 'chaiyaphum', 'nakhon phanom', 'nakhon ratchasima', 'bueng kan', 'buriram', 'maha sarakham', 'mukdahan', 'yasothon', 'roi et', 'loei', 'sakon nakhon', 'si sa ket', 'surin', 'nong khai', 'nong bua lamphu', 'amnat charoen', 'udon thani', 'ubon ratchathani'];
  if (neProvinces.some((p) => province.includes(p))) {
    res.status(200).json({ rate: 80, free: false, estimatedDays: '3–5' });
    return;
  }

  // South
  const southProvinces = ['chumphon', 'krabi', 'nakhon si thammarat', 'narathiwat', 'pattani', 'phangnga', 'phatthalung', 'phuket', 'ranong', 'satun', 'songkhla', 'surat thani', 'trang', 'yala'];
  if (southProvinces.some((p) => province.includes(p))) {
    res.status(200).json({ rate: 80, free: false, estimatedDays: '3–5' });
    return;
  }

  // Default
  res.status(200).json({ rate: 60, free: false, estimatedDays: '2–4' });
}
