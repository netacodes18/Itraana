"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useQuickView } from "../context/QuickViewContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function QuickViewDrawer() {
  const { isQuickViewOpen, selectedProduct, closeQuickView } = useQuickView();
  const { addToCart } = useCart();
  const { isAuthenticated, setIsAuthOpen } = useAuth();

  const [size, setSize] = useState("6ml");
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  // Reset defaults when product changes
  useEffect(() => {
    if (selectedProduct) {
      setSize("6ml");
      setQty(1);
    }
  }, [selectedProduct]);

  if (!isQuickViewOpen || !selectedProduct) return null;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      closeQuickView();
      setIsAuthOpen(true);
      return;
    }

    try {
      setAdding(true);
      await addToCart(selectedProduct, qty, size);
      closeQuickView();
    } catch (err) {
      alert("Failed to add item to cart");
    } finally {
      setAdding(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-fadeIn"
        onClick={closeQuickView}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-screen w-full sm:w-[420px] bg-white z-50 flex flex-col shadow-2xl transition-all duration-300 transform translate-x-0">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-neutral-200">
          <h2 className="text-sm uppercase tracking-widest text-neutral-800">
            Quick View
          </h2>
          <button onClick={closeQuickView} className="hover:opacity-60 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 px-8 py-6 space-y-8 overflow-y-auto">
          {/* Product Image */}
          <div className="w-full h-80 overflow-hidden bg-neutral-100">
            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Info */}
          <div className="space-y-3">
            <h3 className="text-lg uppercase tracking-[0.2em] font-light text-neutral-800">
              {selectedProduct.name}
            </h3>
            {selectedProduct.category && (
              <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-light">
                Category: {selectedProduct.category}
              </p>
            )}
            <p className="text-base font-light text-neutral-700">
              ₹{selectedProduct.price?.toLocaleString("en-IN")}
            </p>
            <div className="h-px w-full bg-neutral-100 my-4" />
            <p className="text-xs text-neutral-600 leading-relaxed font-light">
              {selectedProduct.description}
            </p>
          </div>

          {/* Size Selector */}
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-widest text-neutral-400 block font-light">
              Bottle Size
            </label>
            <div className="flex gap-3">
              {(selectedProduct.sizes || ["3ml", "6ml", "12ml"]).map((s: string) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`border px-4 py-2 text-xs uppercase tracking-wider font-light cursor-pointer transition ${
                    size === s
                      ? "border-neutral-800 bg-neutral-800 text-white"
                      : "border-neutral-300 text-neutral-600 hover:border-neutral-800"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-widest text-neutral-400 block font-light">
              Quantity
            </label>
            <div className="flex items-center w-28 border border-neutral-300">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="px-3 py-2 text-neutral-600 hover:opacity-60 cursor-pointer text-sm"
              >
                -
              </button>
              <span className="flex-1 text-center text-xs font-light text-neutral-800">
                {qty}
              </span>
              <button
                onClick={() => setQty(qty + 1)}
                className="px-3 py-2 text-neutral-600 hover:opacity-60 cursor-pointer text-sm"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="px-8 py-6 border-t border-neutral-200 bg-neutral-50">
          <button
            onClick={handleAddToCart}
            disabled={adding}
            className="w-full bg-black text-white py-4 text-xs uppercase tracking-widest hover:bg-neutral-800 transition duration-300 cursor-pointer disabled:opacity-60"
          >
            {adding ? "Adding..." : "Add to Cart"}
          </button>
        </div>

      </div>
    </>
  );
}
