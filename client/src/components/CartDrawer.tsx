"use client";

import { useState } from "react";
import { X, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function CartDrawer() {
  const { isCartOpen, setIsCartOpen, cartItems, clearCartItems, updateCartItem, removeFromCart } = useCart();
  const { isAuthenticated, setIsAuthOpen } = useAuth();

  const [step, setStep] = useState<"cart" | "checkout" | "success">("cart");
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState("");

  // Shipping Address Form State
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pinCode: "",
  });

  const [giftMessage, setGiftMessage] = useState("");
  const [deliveryPreferences, setDeliveryPreferences] = useState("standard");

  const handleCheckoutClick = () => {
    if (!isAuthenticated) {
      setIsCartOpen(false);
      setIsAuthOpen(true);
      return;
    }
    setStep("checkout");
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const { fullName, phone, street, city, state, pinCode } = shippingAddress;
    if (!fullName || !phone || !street || !city || !state || !pinCode) {
      alert("Please fill in all shipping details.");
      return;
    }

    if (!/^\d{6}$/.test(pinCode)) {
      alert("Pin code must be exactly 6 digits.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/orders", {
        shippingAddress,
        paymentMethod: "cod",
        giftMessage: giftMessage.trim() ? giftMessage : undefined,
        deliveryPreferences,
      });

      // Standard response is unpacked by interceptor to return the Order document directly
      const placedOrder = res.data;
      setOrderId(placedOrder?._id || placedOrder?.id || "N/A");
      
      // Clear cart on success
      await clearCartItems();
      setStep("success");
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to place order. Please try again.";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsCartOpen(false);
    // Reset state after drawer closes
    setTimeout(() => {
      setStep("cart");
      setOrderId("");
      setGiftMessage("");
      setDeliveryPreferences("standard");
    }, 300);
  };

  if (!isCartOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-fadeIn"
        onClick={handleClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-screen w-full sm:w-[420px] bg-white z-50 flex flex-col shadow-2xl transition-all duration-300 transform translate-x-0">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            {step === "checkout" && (
              <button onClick={() => setStep("cart")} className="hover:opacity-60">
                <ArrowLeft size={16} />
              </button>
            )}
            <h2 className="text-sm uppercase tracking-widest">
              {step === "cart" && "Shopping Bag"}
              {step === "checkout" && "Shipping Details"}
              {step === "success" && "Order Confirmed"}
            </h2>
          </div>
          <button onClick={handleClose} className="hover:opacity-60">
            <X size={18} />
          </button>
        </div>

        {/* STEP 1: CART ITEMS */}
        {step === "cart" && (
          <>
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
                      <p className="text-xs uppercase tracking-widest mb-1 font-medium">
                        {item.name}
                      </p>
                      <p className="text-xs text-neutral-500 mb-1">
                        Size: {item.size}
                      </p>
                      
                      {/* Quantity Selector & Remove Action */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-neutral-200">
                          <button
                            type="button"
                            onClick={() => {
                              if (item.quantity > 1) {
                                updateCartItem(item.id, item.quantity - 1, item.size);
                              } else {
                                removeFromCart(item.id);
                              }
                            }}
                            className="px-2 py-0.5 text-neutral-500 hover:opacity-60 cursor-pointer text-xs"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-light text-neutral-800">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateCartItem(item.id, item.quantity + 1, item.size)}
                            className="px-2 py-0.5 text-neutral-500 hover:opacity-60 cursor-pointer text-xs"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="text-[10px] uppercase tracking-widest text-neutral-400 hover:text-red-500 transition cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>

                      <p className="mt-3 font-light text-sm">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="px-8 py-6 border-t border-neutral-200 bg-neutral-50">
                <div className="flex justify-between mb-4">
                  <span className="text-xs uppercase tracking-widest font-medium">
                    Total
                  </span>
                  <span className="font-light">
                    ₹{cartItems.reduce((t, i) => t + (i.price * i.quantity), 0).toLocaleString("en-IN")}
                  </span>
                </div>

                <button
                  onClick={handleCheckoutClick}
                  className="w-full bg-black text-white py-4 text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors duration-300"
                >
                  Checkout
                </button>
              </div>
            )}
          </>
        )}

        {/* STEP 2: CHECKOUT FORM */}
        {step === "checkout" && (
          <form onSubmit={handlePlaceOrder} className="flex-1 flex flex-col justify-between overflow-hidden">
            <div className="flex-1 px-8 py-6 space-y-5 overflow-y-auto">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-neutral-500 block mb-1">
                  Full Name*
                </label>
                <input
                  required
                  type="text"
                  value={shippingAddress.fullName}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                  className="w-full border-b border-neutral-300 py-2 focus:outline-none focus:border-black text-sm"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-neutral-500 block mb-1">
                  Phone Number*
                </label>
                <input
                  required
                  type="tel"
                  value={shippingAddress.phone}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                  className="w-full border-b border-neutral-300 py-2 focus:outline-none focus:border-black text-sm"
                  placeholder="e.g. 9876543210"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-neutral-500 block mb-1">
                  Street Address*
                </label>
                <input
                  required
                  type="text"
                  value={shippingAddress.street}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                  className="w-full border-b border-neutral-300 py-2 focus:outline-none focus:border-black text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-neutral-500 block mb-1">
                    City*
                  </label>
                  <input
                    required
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    className="w-full border-b border-neutral-300 py-2 focus:outline-none focus:border-black text-sm"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-neutral-500 block mb-1">
                    State*
                  </label>
                  <input
                    required
                    type="text"
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                    className="w-full border-b border-neutral-300 py-2 focus:outline-none focus:border-black text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-neutral-500 block mb-1">
                  Pin Code (6 digits)*
                </label>
                <input
                  required
                  type="text"
                  maxLength={6}
                  value={shippingAddress.pinCode}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, pinCode: e.target.value })}
                  className="w-full border-b border-neutral-300 py-2 focus:outline-none focus:border-black text-sm"
                  placeholder="e.g. 110001"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-neutral-500 block mb-1">
                  Gift Message (Optional)
                </label>
                <textarea
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  maxLength={500}
                  rows={2}
                  className="w-full border border-neutral-300 p-2 focus:outline-none focus:border-black text-xs font-light placeholder-neutral-300 resize-none bg-transparent"
                  placeholder="Include a personal luxury card message..."
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-neutral-500 block mb-1">
                  Delivery Preference
                </label>
                <select
                  value={deliveryPreferences}
                  onChange={(e) => setDeliveryPreferences(e.target.value)}
                  className="w-full border border-neutral-300 p-2 focus:outline-none focus:border-black text-xs uppercase tracking-wider font-light bg-transparent cursor-pointer"
                >
                  <option value="standard" className="text-black bg-white">Standard Delivery (Free)</option>
                  <option value="weekend" className="text-black bg-white">Weekend Only Delivery</option>
                  <option value="priority" className="text-black bg-white">Priority Premium Shipping</option>
                </select>
              </div>

              <div className="pt-2">
                <label className="text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">
                  Payment Method
                </label>
                <div className="border border-neutral-800 p-4 flex justify-between items-center bg-neutral-50">
                  <span className="text-xs uppercase tracking-wider font-medium">Cash on Delivery</span>
                  <span className="text-[10px] text-green-600 font-bold uppercase tracking-widest">Selected</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-neutral-200 bg-neutral-50">
              <div className="flex justify-between mb-4">
                <span className="text-xs uppercase tracking-widest font-medium">Order Total</span>
                <span className="font-light">
                  ₹{cartItems.reduce((t, i) => t + (i.price * i.quantity), 0).toLocaleString("en-IN")}
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-4 text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors duration-300 disabled:opacity-60"
              >
                {loading ? "Placing Order..." : "Confirm & Place Order"}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: SUCCESS PAGE */}
        {step === "success" && (
          <div className="flex-1 flex flex-col justify-center items-center px-10 text-center space-y-6">
            <CheckCircle2 className="text-green-500 animate-bounce" size={56} strokeWidth={1.5} />
            <div>
              <h3 className="text-lg uppercase tracking-widest font-light mb-2">
                Thank You
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed max-w-[280px] mx-auto">
                Your order has been placed successfully. We are preparing your fragrance creation.
              </p>
            </div>
            <div className="bg-neutral-50 border p-4 w-full">
              <p className="text-[10px] text-neutral-400 uppercase tracking-widest mb-1">
                Order Reference
              </p>
              <p className="text-xs font-mono font-bold select-all">
                {orderId}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="border border-black text-black px-8 py-3 text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all duration-300"
            >
              Continue Shopping
            </button>
          </div>
        )}

      </div>
    </>
  );
}
