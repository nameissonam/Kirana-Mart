import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { getProductImage, handleProductImageError } from "../utils/productImages";
import { getProductDisplayName } from "../utils/productDisplay";
import { DEFAULT_STORE_SETTINGS, getStoreSettings } from "../services/settingsService";
import { Close, Trash, Plus, Minus, ShoppingCart } from "./Icons";

function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setCartOpen,
    updateQuantity,
    removeFromCart,
    getCartItemKey,
    cartTotal,
    cartCount,
  } = useCart();
  
  const navigate = useNavigate();
  const [settings, setSettings] = useState(DEFAULT_STORE_SETTINGS);

  useEffect(() => {
    getStoreSettings().then(setSettings).catch(() => {});
  }, []);

  if (!isCartOpen) return null;
  const discount = Math.round(cartTotal * 0.08);
  const homeDeliveryMinValue = Number(settings.homeDeliveryMinValue || 750);
  const remainingForHomeDelivery = Math.max(0, homeDeliveryMinValue - cartTotal);
  const homeDeliveryAvailable = cartTotal >= homeDeliveryMinValue;
  const delivery = cart.length === 0 || !homeDeliveryAvailable ? 0 : Number(settings.deliveryCharge || 30);
  const payable = Math.max(0, cartTotal - discount + delivery);

  const handleCheckoutClick = () => {
    setCartOpen(false);
    navigate("/checkout");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={() => setCartOpen(false)}
      />

      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        {/* Drawer Panel */}
        <div className="w-screen max-w-md transform bg-white shadow-2xl transition-transform duration-300 ease-in-out animate-slide-in flex flex-col h-full">
          {/* Header */}
          <div className="px-6 py-5 border-b border-lime-100 flex items-center justify-between bg-lime-500 text-slate-950">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-6 h-6" />
              <h2 className="text-xl font-semibold">
                My Cart ({cartCount})
              </h2>
            </div>
            <button
              onClick={() => setCartOpen(false)}
              className="p-1 rounded-full text-slate-950 hover:bg-lime-400 transition-colors cursor-pointer"
            >
              <Close className="w-6 h-6" />
            </button>
          </div>

          {/* Cart items list */}
          <div className="flex-1 py-4 overflow-y-auto px-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center text-brand-500 mb-4 animate-bounce">
                  <ShoppingCart className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-medium text-gray-700">Empty Basket</h3>
                <p className="text-gray-500 text-sm mt-1 max-w-xs">
                  Looks like you haven't added anything to your cart yet. Let's find some fresh items!
                </p>
                <button
                  onClick={() => setCartOpen(false)}
                  className="mt-6 px-6 py-2.5 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={getCartItemKey(item)}
                  className="flex items-center gap-4 rounded-2xl border border-lime-100 bg-white p-3 transition hover:bg-lime-50/50"
                >
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                    <img
                      src={getProductImage(item)}
                      alt={getProductDisplayName(item)}
                      onError={(event) => handleProductImageError(event, item)}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800 text-sm truncate">
                      {getProductDisplayName(item)}
                    </h4>
                    <p className="text-gray-500 text-xs mt-0.5">
                      ₹{item.price} · {item.unit || "piece"}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity controls */}
                      <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden">
                        <button
                          onClick={() => updateQuantity(getCartItemKey(item), item.quantity - 1)}
                          className="px-2 py-1 text-gray-500 hover:bg-gray-100 transition cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-semibold text-gray-700">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(getCartItemKey(item), item.quantity + 1)}
                          className="px-2 py-1 text-gray-500 hover:bg-gray-100 transition cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Total price for the item */}
                      <span className="font-bold text-gray-800 text-sm">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => removeFromCart(getCartItemKey(item))}
                    className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="border-t border-gray-100 px-6 py-6 bg-slate-50 space-y-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-500">Basket summary</h3>
              <div className={`rounded-2xl border px-4 py-3 text-xs font-bold ${homeDeliveryAvailable ? "border-green-200 bg-green-50 text-green-700" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
                {homeDeliveryAvailable
                  ? `Home delivery available for this cart.`
                  : `Add ₹${remainingForHomeDelivery} more for home delivery. Pay at Store is still available.`}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Price ({cartCount} items)</span><span>₹{cartTotal}</span></div>
                <div className="flex justify-between text-green-700"><span>Discount</span><span>-₹{discount}</span></div>
                <div className="flex justify-between"><span>Home Delivery Charge</span><span>{homeDeliveryAvailable ? `₹${delivery}` : "Locked"}</span></div>
                <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-900"><span>Total Amount</span><span>₹{payable}</span></div>
              </div>
              <p className="text-xs font-semibold text-lime-700">
                You will save ₹{discount} on this order.
              </p>
              <button
                onClick={handleCheckoutClick}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl shadow-lg bg-lime-500 hover:bg-lime-400 text-slate-950 font-extrabold transition cursor-pointer"
              >
                Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CartDrawer;
