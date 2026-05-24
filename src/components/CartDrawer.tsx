"use client";

import { X } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function CartDrawer() {
  const { isCartOpen, setIsCartOpen, cartItems } = useCart();

  if (!isCartOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-screen w-full sm:w-[420px] bg-white z-50 flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-neutral-200">
          <h2 className="text-sm uppercase tracking-widest">
            Shopping Bag
          </h2>
          <button onClick={() => setIsCartOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 px-8 py-6 space-y-6 overflow-y-auto">
          {cartItems.length === 0 ? (
            <p className="text-sm text-neutral-500">
              Your bag is currently empty.
            </p>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 border-b border-neutral-200 pb-6"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-24 object-cover"
                />

                <div className="flex-1">
                  <p className="text-xs uppercase tracking-widest mb-1">
                    {item.name}
                  </p>
                  <p className="text-sm opacity-70">
                    {item.size || "10ml"}
                  </p>
                  <p className="mt-2 font-light">
                    ₹{item.price.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="px-8 py-6 border-t border-neutral-200">
            <div className="flex justify-between mb-4">
              <span className="text-xs uppercase tracking-widest">
                Total
              </span>
              <span className="font-light">
                ₹{cartItems.reduce((t, i) => t + i.price, 0).toLocaleString("en-IN")}
              </span>
            </div>

            <button className="w-full bg-black text-white py-4 text-xs uppercase tracking-widest">
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
