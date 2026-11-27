import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import Newsletter from '@/components/Newsletter';
import { I18nProvider } from '@/context/I18nContext';

const open = (url: string) => {
  window.history.replaceState({}, '', url);
  render(<I18nProvider><Newsletter /></I18nProvider>);
};

describe('"Enter your code" link from the confirmation email', () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
    window.history.replaceState({}, '', '/');
  });

  it('opens the code boxes for the address that signed up on this device', async () => {
    localStorage.setItem('gingerbros-pending-email', 'me@example.com');
    open('/?verify=1#newsletter');
    expect(await screen.findByLabelText('Verification code digit 1')).toBeTruthy();
    expect(screen.getByText('me@example.com')).toBeTruthy();
  });

  it('asks for the address when opened on another device', async () => {
    open('/?verify=1#newsletter');
    expect(await screen.findByLabelText('Verification code digit 1')).toBeTruthy();
    expect(screen.getByLabelText('Email address')).toBeTruthy();
  });

  it('shows the normal signup form otherwise', () => {
    open('/');
    expect(screen.queryByLabelText('Verification code digit 1')).toBeNull();
  });
});
