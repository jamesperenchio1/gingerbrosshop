import '@testing-library/jest-dom';

// API env defaults for unit tests
process.env.STRIPE_PRICE_UNPASTEURIZED = 'price_test_unpasteurized';
process.env.STRIPE_SECRET_KEY = 'sk_test_fake';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_fake';

// Simple localStorage mock for cart persistence tests
class LocalStorageMock {
  store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

Object.defineProperty(window, 'localStorage', {
  value: new LocalStorageMock(),
});
