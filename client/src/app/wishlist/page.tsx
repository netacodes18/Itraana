"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getWishlist, removeFromWishlist } from "@/services/user.service";
import { useAuth } from "@/context/AuthContext";

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
}

export default function Wishlist() {
  const { isAuthenticated } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    getWishlist()
      .then((res) => {
        // Our unpacked axios response returns the wishlist array directly
        setWishlistItems(res.data || []);
      })
      .catch((err) => {
        console.error("Failed to load wishlist items", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isAuthenticated]);

  const handleRemove = async (id: string) => {
    try {
      await removeFromWishlist(id);
      setWishlistItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert("Failed to remove item from wishlist");
    }
  };

  return (
    <section className="min-h-screen bg-neutral-50 animate-fadeIn">
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
        {!isAuthenticated ? (
          <div className="text-center py-32">
            <p className="text-neutral-500 mb-6">
              Please sign in to view your wishlist
            </p>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col space-y-4">
                <div className="bg-neutral-200 h-[420px] w-full"></div>
                <div className="h-4 bg-neutral-200 w-1/3 mx-auto"></div>
                <div className="h-3 bg-neutral-200 w-1/2 mx-auto"></div>
                <div className="h-4 bg-neutral-200 w-1/4 mx-auto"></div>
              </div>
            ))}
          </div>
        ) : wishlistItems.length === 0 ? (
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
