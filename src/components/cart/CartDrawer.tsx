import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Tag,
  Check,
  Sparkles,
  Truck,
} from 'lucide-react';
import { useEcommerce } from '../../context/EcommerceContext';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    cartDiscount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    formatPrice,
    setIsCheckoutOpen,
    setActiveTab,
  } = useEcommerce();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  if (!isCartOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 150;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cartSubtotal);
  const freeShippingProgress = Math.min(100, (cartSubtotal / FREE_SHIPPING_THRESHOLD) * 100);

  const estimatedTax = Math.round((cartSubtotal - cartDiscount) * 0.08 * 100) / 100;
  const estimatedTotal = Math.max(0, cartSubtotal - cartDiscount + (remainingForFreeShipping === 0 ? 0 : 15) + estimatedTax);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponError('');
    const res = applyCoupon(couponInput);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponInput('');
    }
  };

  const handleProceedCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div
      id="cart-drawer-backdrop"
      className="fixed inset-0 z-50 flex justify-end bg-stone-950/80 backdrop-blur-sm animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsCartOpen(false);
      }}
    >
      <div
        id="cart-drawer-panel"
        className="bg-stone-900 border-l border-stone-800 w-full max-w-md h-full flex flex-col text-stone-100 shadow-2xl animate-in slide-in-from-right duration-300"
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center text-amber-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold font-serif text-base text-stone-100">Shopping Bag</h3>
              <p className="text-[11px] text-stone-400">
                {cart.length} {cart.length === 1 ? 'item' : 'items'} in your atelier bag
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                id="clear-cart-btn"
                onClick={clearCart}
                className="text-[11px] text-stone-400 hover:text-rose-400 transition-colors mr-1"
                title="Empty shopping bag"
              >
                Clear
              </button>
            )}
            <button
              id="cart-drawer-close-btn"
              onClick={() => setIsCartOpen(false)}
              className="text-stone-400 hover:text-stone-100 p-1.5 rounded-full hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Free Shipping Progress Meter */}
        <div className="bg-stone-950 px-5 py-3 border-b border-stone-800 text-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="flex items-center gap-1.5 text-stone-300 text-[11px] font-medium">
              <Truck className="w-3.5 h-3.5 text-amber-400" />
              {remainingForFreeShipping === 0 ? (
                <strong className="text-emerald-400 font-semibold">
                  You unlocked Complimentary Express Delivery!
                </strong>
              ) : (
                <>
                  Add <strong className="text-amber-400 font-mono">{formatPrice(remainingForFreeShipping)}</strong> for Free Express Delivery
                </>
              )}
            </span>
            <span className="text-[10px] font-mono text-stone-400">
              {Math.round(freeShippingProgress)}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                remainingForFreeShipping === 0
                  ? 'bg-emerald-400'
                  : 'bg-gradient-to-r from-amber-400 to-amber-500'
              }`}
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-stone-400 space-y-3 py-12">
              <div className="w-16 h-16 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-center text-stone-600">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-stone-200 font-serif text-base">Your Bag is Empty</h4>
              <p className="text-xs text-stone-400 max-w-xs">
                Explore our acoustic headphones, Swiss automatic watches, and merino apparel.
              </p>
              <button
                id="cart-empty-explore-btn"
                onClick={() => {
                  setIsCartOpen(false);
                  setActiveTab('shop');
                }}
                className="bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow"
              >
                Discover Catalog
              </button>
            </div>
          ) : (
            cart.map((item, index) => (
              <div
                key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}-${index}`}
                className="bg-stone-950 border border-stone-800/90 rounded-2xl p-3.5 flex gap-3.5 items-center hover:border-stone-700 transition-colors"
              >
                {/* Image */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-900 shrink-0 border border-stone-800">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-stone-100 truncate font-serif">
                    {item.product.name}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-0.5">
                    {item.selectedColor && (
                      <span className="bg-stone-900 border border-stone-800 px-1.5 py-0.2 rounded text-[10px]">
                        {item.selectedColor}
                      </span>
                    )}
                    {item.selectedSize && (
                      <span className="bg-stone-900 border border-stone-800 px-1.5 py-0.2 rounded text-[10px]">
                        Size {item.selectedSize}
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-bold font-mono text-stone-100 mt-1">
                    {formatPrice(item.product.price)}
                  </div>
                </div>

                {/* Quantity & Delete */}
                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() =>
                      removeFromCart(item.product.id, item.selectedColor, item.selectedSize)
                    }
                    className="text-stone-500 hover:text-rose-400 p-1 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center bg-stone-900 border border-stone-800 rounded-lg p-0.5">
                    <button
                      onClick={() =>
                        updateCartQuantity(
                          item.product.id,
                          item.quantity - 1,
                          item.selectedColor,
                          item.selectedSize
                        )
                      }
                      className="w-6 h-6 rounded text-stone-300 hover:bg-stone-800 flex items-center justify-center font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="w-6 text-center text-xs font-mono font-bold text-stone-200">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateCartQuantity(
                          item.product.id,
                          item.quantity + 1,
                          item.selectedColor,
                          item.selectedSize
                        )
                      }
                      disabled={item.quantity >= item.product.stock}
                      className="w-6 h-6 rounded text-stone-300 hover:bg-stone-800 disabled:opacity-30 flex items-center justify-center font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer & Checkout Action */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-stone-800 bg-stone-950/90 space-y-4">
            {/* Promo Code Input */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-amber-400/10 border border-amber-500/40 rounded-xl px-3 py-2 text-xs">
                  <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Coupon: {appliedCoupon.code} (-{appliedCoupon.discountPercent}%)</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-stone-400 hover:text-rose-400 text-[11px]"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    id="cart-coupon-input"
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Promo code: WELCOME10 or SAVE20"
                    className="bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 flex-1 uppercase"
                  />
                  <button
                    id="cart-apply-coupon-btn"
                    type="submit"
                    className="bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold px-3.5 py-2 rounded-xl border border-stone-700 transition-colors"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && <p className="text-[11px] text-rose-400 mt-1">{couponError}</p>}
            </div>

            {/* Price Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-stone-400 pt-1">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-mono text-stone-200">{formatPrice(cartSubtotal)}</span>
              </div>
              {cartDiscount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Collector Discount</span>
                  <span className="font-mono">-{formatPrice(cartDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estimated Delivery</span>
                <span className="font-mono text-stone-200">
                  {remainingForFreeShipping === 0 ? 'FREE' : formatPrice(15)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Sales Tax (8%)</span>
                <span className="font-mono text-stone-200">{formatPrice(estimatedTax)}</span>
              </div>
              <div className="border-t border-stone-800 pt-2 flex justify-between text-sm font-bold text-stone-100">
                <span>Estimated Total</span>
                <span className="font-mono text-amber-400 text-base">{formatPrice(estimatedTotal)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              id="cart-proceed-checkout-btn"
              onClick={handleProceedCheckout}
              className="w-full bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 transition-all active:scale-[0.98]"
            >
              <span>Proceed to Secure Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-stone-500">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>256-Bit SSL Encrypted & Tokenized Checkout</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
