import { useCallback } from 'react';
import { toast } from 'sonner';
import { useCart } from '@/context/CartContext';
import { bottleCounts, oneTimePrice, defaultPrice, stockStatus, type CatalogProduct } from '@/lib/catalog';
import { thumbUrl } from '@/lib/productImages';

/** Adds one-time units of a catalog product to the cart, with a toast. */
export function useAddProduct() {
  const { addItem } = useCart();
  return useCallback(
    (product: CatalogProduct, quantity = 1) => {
      const price = oneTimePrice(product) ?? defaultPrice(product);
      if (!price || stockStatus(product) === 'out_of_stock') return false;
      addItem({
        id: price.priceId,
        priceId: price.priceId,
        productId: product.id,
        name: product.name,
        variant: product.id,
        price: price.unitAmount ?? 0,
        quantity,
        image: thumbUrl(product.id, product.images[0] ?? ''),
        badge: product.badge ?? '',
        badgeColor: product.badgeColor ?? 'bg-amber',
        ...bottleCounts(product),
      });
      toast.success(`${product.name} added to cart`);
      return true;
    },
    [addItem],
  );
}
