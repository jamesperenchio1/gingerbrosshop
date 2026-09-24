import { useEffect, useState } from 'react';
import AdminGate from '@/components/AdminGate';
import AdminShell, { type AdminTab } from '@/components/admin/AdminShell';
import OrdersTab from '@/components/admin/OrdersTab';
import SubscriptionsTab from '@/components/admin/SubscriptionsTab';
import CustomersTab from '@/components/admin/CustomersTab';
import ProductsTab from '@/components/admin/ProductsTab';
import CouponsTab from '@/components/admin/CouponsTab';
import InvoicesTab from '@/components/admin/InvoicesTab';
import OpsTab from '@/components/admin/OpsTab';
import ActivityTab from '@/components/admin/ActivityTab';

const TABS: AdminTab[] = [
  { id: 'orders', label: 'Orders' },
  { id: 'subscriptions', label: 'Subscriptions' },
  { id: 'customers', label: 'Customers' },
  { id: 'products', label: 'Products' },
  { id: 'coupons', label: 'Coupons' },
  { id: 'invoices', label: 'Invoices' },
  { id: 'ops', label: 'Ops' },
  { id: 'activity', label: 'Activity' },
];

function initialTab(): string {
  const tab = new URLSearchParams(window.location.search).get('tab');
  return tab && TABS.some((t) => t.id === tab) ? tab : 'orders';
}

export default function AdminOrders() {
  return <AdminGate title="Admin login">{({ email, logout }) => <AdminConsole email={email} onLogout={logout} />}</AdminGate>;
}

function AdminConsole({ email, onLogout }: { email: string; onLogout: () => void }) {
  const [tab, setTab] = useState(initialTab);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (tab === 'orders') url.searchParams.delete('tab');
    else url.searchParams.set('tab', tab);
    window.history.replaceState(null, '', url.toString());
  }, [tab]);

  return (
    <AdminShell title="GingerBros Admin" email={email} onLogout={onLogout} tabs={TABS} activeTab={tab} onTabChange={setTab}>
      {tab === 'orders' && <OrdersTab />}
      {tab === 'subscriptions' && <SubscriptionsTab />}
      {tab === 'customers' && <CustomersTab />}
      {tab === 'products' && <ProductsTab />}
      {tab === 'coupons' && <CouponsTab />}
      {tab === 'invoices' && <InvoicesTab />}
      {tab === 'ops' && <OpsTab />}
      {tab === 'activity' && <ActivityTab />}
    </AdminShell>
  );
}
