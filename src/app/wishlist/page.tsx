"use client";

import { useState } from "react";
import Link from "next/link";

interface WishlistItem {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
}

export default function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([
    {
      id: 1,
      name: "Amber",
      price: 2899,
      description: "Warm amber with woody undertones",
      image:
        "https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=600&q=80",
    },
    {
      id: 2,
      name: "Rose Attar",
      price: 3499,
      description: "Classic Indian rose distillation",
      image:
        "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&q=80",
    },
  ]);

  const handleRemove = (id: number) => {
    setWishlistItems((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  return (
    <section className="min-h-screen bg-neutral-50">
      {/* HEADER */}
      <div className="bg-neutral-900 text-white py-14 text-center">
        <h1 className="text-3xl font-light tracking-[0.3em]">
          WISHLIST
        </h1>
        <p className="text-xs tracking-widest mt-3 text-neutral-400">
          Saved fragrances you love
        </p>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-8 py-20">
        {wishlistItems.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-neutral-500 mb-6">
              Your wishlist is empty
            </p>
            <Link
              href="/collection"
              className="text-xs uppercase tracking-widest underline underline-offset-4 hover:opacity-60"
            >
              Explore Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {wishlistItems.map((item) => (
              <div key={item.id} className="group">
                {/* IMAGE */}
                <div className="relative overflow-hidden mb-6 bg-white">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="
                      w-full h-[420px] object-cover
                      transition-transform duration-700
                      group-hover:scale-[1.05]
                    "
                  />

                  {/* HEART (ALREADY WISHLISTED) */}
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="
                      absolute top-4 right-4 w-10 h-10
                      bg-white/90 rounded-full
                      flex items-center justify-center
                      hover:scale-110 transition
                    "
                  >
                    <svg
                      className="w-5 h-5 fill-red-500 stroke-red-500"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
                </div>

                {/* INFO */}
                <div className="text-center space-y-4">
                  <div>
                    <h3 className="text-sm uppercase tracking-[0.3em] font-light mb-2">
                      {item.name}
                    </h3>
                    <p className="text-xs text-neutral-500 mb-3">
                      {item.description}
                    </p>
                    <p className="text-base font-light">
                      ₹{item.price.toLocaleString("en-IN")}
                    </p>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex flex-col gap-3">
                    <button
                      className="
                        w-full py-3
                        border border-neutral-800
                        text-xs uppercase tracking-[0.25em]
                        transition
                        hover:bg-neutral-800 hover:text-white
                      "
                    >
                      Add to Cart
                    </button>

                    <button
                      onClick={() => handleRemove(item.id)}
                      className="
                        text-xs uppercase tracking-widest
                        text-neutral-500 hover:text-red-500
                      "
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
