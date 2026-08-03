import { useCallback, useMemo } from 'react';
import { Repeat } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCatalog, defaultPrice } from '@/lib/catalog';
import { toast } from 'sonner';

interface OrderItem {
  description: string;
  quantity: number;
  amountTotal: number;
}

interface ReorderButtonProps {
  items: OrderItem[];
  className?: string;
}

export default function ReorderButton({ items, className = '' }: ReorderButtonProps) {
  const { products } = useCatalog();
  const { addItem, openCart } = useCart();

  const matches = useMemo(() => {
    return items
      .map((item) => {
        const product = products.find((p) => p.name === item.description || p.name.includes(item.description));
        if (!product) return null;
        const price = defaultPrice(product);
        if (!price) return null;
        return { product, price, quantity: item.quantity };
      })
      .filter((m): m is NonNullable<typeof m> => m !== null);
  }, [items, products]);

  const handleReorder = useCallback(() => {
    if (matches.length === 0) {
      toast.error('These items are no longer available');
      return;
    }

    matches.forEach(({ product, price, quantity }) => {
      addItem({
        id: price.priceId,
        priceId: price.priceId,
        productId: product.id,
        name: product.name,
        variant: product.id,
        price: price.unitAmount ?? 0,
        quantity,
        image: product.images[0] ?? '',
        badge: product.badge ?? '',
        badgeColor: product.badgeColor ?? 'bg-sky-500',
      });
    });

    const totalQuantity = matches.reduce((sum, m) => sum + m.quantity, 0);
    toast.success(`Added ${totalQuantity} item${totalQuantity !== 1 ? 's' : ''} to cart`);
    openCart();
  }, [matches, addItem, openCart]);

  if (matches.length === 0) return null;

  return (
    <button
      onClick={handleReorder}
      className={`inline-flex items-center justify-center gap-2 bg-white border border-soft-peach rounded-full py-3 font-body font-medium text-[14px] text-deep-brown hover:border-amber transition-colors ${className}`}
    >
      <Repeat className="w-4 h-4" /> Reorder
    </button>
  );
}
