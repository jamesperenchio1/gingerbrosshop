"use client"

import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import GbBottle from "@modules/common/components/gb-bottle"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

const CartDropdown = ({ cart: cartState }: { cart?: HttpTypes.StoreCart | null }) => {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const totalItems =
    cartState?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0

  const subtotal = cartState?.subtotal ?? 0
  const currencyCode = cartState?.currency_code ?? "thb"
  const itemRef = useRef<number>(totalItems || 0)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-open when items added (except on cart/checkout) — only after initial mount
  useEffect(() => {
    if (!mounted) return
    if (
      itemRef.current !== totalItems &&
      itemRef.current < totalItems &&
      !pathname.includes("/cart") &&
      !pathname.includes("/checkout")
    ) {
      setOpen(true)
      const timer = setTimeout(() => setOpen(false), 4000)
      itemRef.current = totalItems
      return () => clearTimeout(timer)
    }
    itemRef.current = totalItems
  }, [totalItems, pathname, mounted])

  // Close drawer on route change
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Lock body scroll while open
  useEffect(() => {
    if (!mounted) return
    if (open) {
      const prev = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [open, mounted])

  const freeShipThreshold = 500
  const freeShipProgress = Math.min(100, (subtotal / (freeShipThreshold * 100)) * 100)
  const remaining = Math.max(0, freeShipThreshold * 100 - subtotal)

  const drawerBody = (
    <>
      {/* Header */}
      <header className="px-6 py-5 border-b border-dark/[0.08] bg-white flex justify-between items-center flex-shrink-0">
        <div>
          <h3 className="font-display text-[22px] font-bold text-dark">Your cart</h3>
          <div className="font-sans text-xs text-dark/55 mt-0.5">
            {totalItems} {totalItems === 1 ? "item" : "items"}
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="text-dark hover:text-primary transition-colors"
          aria-label="Close cart"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </header>

      {totalItems === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-10 gap-[18px]">
          <div className="w-[76px] h-[76px] rounded-full bg-light flex items-center justify-center text-primary">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 7h12l-1 13H7L6 7Z" /><path d="M9 7a3 3 0 1 1 6 0" />
            </svg>
          </div>
          <div className="text-center">
            <div className="font-display text-[22px] font-semibold text-dark">Your cart is empty</div>
            <p className="font-sans text-dark/60 mt-2 text-sm">Let&apos;s fix that. The ale is very popular.</p>
          </div>
          <LocalizedClientLink
            href="/store"
            onClick={() => setOpen(false)}
            className="gb-btn gb-btn--primary"
          >
            Shop the range
          </LocalizedClientLink>
        </div>
      ) : (
        <>
          {/* Free shipping progress */}
          <div className="px-6 py-4 bg-white border-b border-dark/[0.06] flex-shrink-0">
            <div className="flex justify-between mb-2 font-sans text-xs">
              {remaining === 0 ? (
                <span className="text-accent font-bold">✓ Free shipping unlocked</span>
              ) : (
                <span className="text-dark">
                  Add <strong>{convertToLocale({ amount: remaining, currency_code: currencyCode })}</strong> more for free shipping
                </span>
              )}
              <span className="text-dark/50">
                {convertToLocale({ amount: subtotal, currency_code: currencyCode })} /{" "}
                {convertToLocale({ amount: freeShipThreshold * 100, currency_code: currencyCode })}
              </span>
            </div>
            <div className="h-1.5 bg-light rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-400"
                style={{
                  width: `${freeShipProgress}%`,
                  background: "linear-gradient(90deg, #C8893C, #4A7C3F)",
                }}
              />
            </div>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-6 no-scrollbar">
            {(cartState?.items ?? [])
              .slice()
              .sort((a, b) => ((a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1))
              .map((item) => (
                <div
                  key={item.id}
                  className="grid gap-[14px] py-[18px] border-b border-dark/[0.06]"
                  style={{ gridTemplateColumns: "80px 1fr auto" }}
                  data-testid="cart-item"
                >
                  <div className="w-[80px] h-[96px] bg-gradient-to-br from-light to-background rounded-[10px] flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {item.thumbnail ? (
                      <Thumbnail
                        thumbnail={item.thumbnail}
                        images={item.variant?.product?.images}
                        size="square"
                      />
                    ) : (
                      <GbBottle flavor="beer" size={70} />
                    )}
                  </div>
                  <div>
                    <div className="font-display font-semibold text-[15px] text-dark">{item.title}</div>
                    <LineItemOptions
                      variant={item.variant}
                      title={item.variant_title}
                      data-testid="cart-item-variant"
                      data-value={item.variant}
                    />
                    <div className="flex items-center gap-[10px] mt-[10px]">
                      <span
                        className="font-sans text-xs text-dark/70"
                        data-testid="cart-item-quantity"
                        data-value={item.quantity}
                      >
                        Qty: {item.quantity}
                      </span>
                      <DeleteButton
                        id={item.id}
                        className="font-sans text-xs text-dark/50 underline"
                        data-testid="cart-item-remove-button"
                      >
                        Remove
                      </DeleteButton>
                    </div>
                  </div>
                  <div className="font-sans font-bold text-primary text-[15px]">
                    <LineItemPrice item={item} style="tight" currencyCode={currencyCode} />
                  </div>
                </div>
              ))}
          </div>

          {/* Footer */}
          <div className="border-t border-dark/[0.08] px-6 py-5 bg-white flex-shrink-0">
            <div className="flex justify-between text-sm text-dark/70 mb-1.5 font-sans">
              <span>Subtotal</span>
              <span data-testid="cart-subtotal" data-value={subtotal}>
                {convertToLocale({ amount: subtotal, currency_code: currencyCode })}
              </span>
            </div>
            <div className="flex justify-between font-display text-2xl font-bold text-dark mb-4">
              <span>Total</span>
              <span>{convertToLocale({ amount: subtotal, currency_code: currencyCode })}</span>
            </div>
            <LocalizedClientLink
              href="/cart"
              onClick={() => setOpen(false)}
              className="gb-btn gb-btn--primary w-full justify-center text-[15px]"
              data-testid="go-to-cart-button"
            >
              View cart &amp; checkout
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </LocalizedClientLink>
            <div className="flex gap-[10px] justify-center mt-3 font-sans text-[11px] text-dark/50">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
              </svg>
              Secure · Stripe + PromptPay QR
            </div>
          </div>
        </>
      )}
    </>
  )

  return (
    <>
      {/* Cart icon button in nav */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-dark text-background rounded-full px-4 py-[10px] font-sans text-sm font-semibold hover:bg-dark/90 transition-colors"
        aria-label="Open cart"
        data-testid="nav-cart-link"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 7h12l-1 13H7L6 7Z" /><path d="M9 7a3 3 0 1 1 6 0" />
        </svg>
        <span>Cart</span>
        <span className="bg-primary text-white text-[11px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
          {totalItems}
        </span>
      </button>

      {/* Portal backdrop + drawer to <body> so the sticky nav's backdrop-filter
          doesn't create a containing block that collapses fixed positioning. */}
      {mounted && createPortal(
        <>
          {open && (
            <div
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-dark/40 backdrop-blur-[4px] z-[100] transition-opacity"
              aria-hidden="true"
            />
          )}
          <aside
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[460px] bg-background z-[101] flex flex-col shadow-[-20px_0_60px_rgba(44,24,16,0.15)] transition-transform duration-[400ms] ease-[cubic-bezier(0.5,0,0.5,1)]"
            style={{ transform: open ? "translateX(0)" : "translateX(100%)" }}
            data-testid="nav-cart-dropdown"
            aria-hidden={!open}
          >
            {drawerBody}
          </aside>
        </>,
        document.body
      )}
    </>
  )
}

export default CartDropdown
