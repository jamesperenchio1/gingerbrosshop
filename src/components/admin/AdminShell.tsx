import type { ReactNode } from 'react';

export interface AdminTab {
  id: string;
  label: string;
}

/**
 * Full-screen admin chrome: a dark sticky header with the console title, a LIVE
 * badge, the signed-in email, optional header actions, a log-out button and a
 * horizontal tab bar. No storefront navigation ever renders around admin pages.
 */
export default function AdminShell({
  title,
  email,
  onLogout,
  tabs,
  activeTab,
  onTabChange,
  actions,
  children,
}: {
  title: string;
  email: string;
  onLogout: () => void;
  tabs: AdminTab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-warm-white font-body">
      <header className="sticky top-0 z-30 bg-deep-brown text-cream shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-display text-lg truncate">{title}</span>
            <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-rust text-cream">
              Live
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden sm:inline text-cream/70 truncate max-w-[220px]">{email}</span>
            {actions}
            <button onClick={onLogout} className="text-cream/80 hover:text-cream px-2 py-1">
              Log out
            </button>
          </div>
        </div>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 pb-2 flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`whitespace-nowrap text-sm px-3 py-1.5 rounded-full transition-colors ${
                activeTab === tab.id
                  ? 'bg-cream text-deep-brown font-semibold'
                  : 'text-cream/70 hover:text-cream'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">{children}</main>
    </div>
  );
}
