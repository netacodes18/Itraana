"use client";

import { useState } from "react";

type ProductCardProps = {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  onAddToCart?: () => void;
};

export default function ProductCard({
  id,
  name,
  price,
  image,
  description,
  onAddToCart,
}: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(false);

  return (
    <div className="group">
      {/* IMAGE */}
      <div className="relative overflow-hidden mb-6 bg-white">
        <img
          src={image}
          alt={name}
          loading="lazy"
          className="
            w-full h-[480px] object-cover
            transform-gpu
            transition-transform duration-700 ease-out
            group-hover:scale-[1.05]
          "
        />

        {/* WISHLIST */}
        <button
          onClick={() => setWishlisted(!wishlisted)}
          aria-label="Add to wishlist"
          className="
            absolute top-4 right-4 w-10 h-10
            bg-white/90 backdrop-blur-sm
            rounded-full flex items-center justify-center
            transition-all duration-300
            hover:bg-white hover:scale-110
          "
        >
          <svg
            className={`w-5 h-5 transition-colors duration-300 ${
              wishlisted
                ? "fill-red-500 stroke-red-500"
                : "fill-none stroke-neutral-700"
            }`}
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* HOVER OVERLAY */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500" />
      </div>

      {/* INFO */}
      <div className="text-center space-y-4">
        <div>
          <h3 className="text-sm uppercase tracking-[0.3em] font-light text-neutral-800 mb-2">
            {name}
          </h3>
          <p className="text-xs text-neutral-500 tracking-wide mb-3">
            {description}
          </p>
          <p className="text-base font-light text-neutral-700">
            ₹{price.toLocaleString("en-IN")}
          </p>
        </div>

        {/* ADD TO CART */}
        <button
          onClick={onAddToCart}
          className="
            w-full py-3
            border border-neutral-800
            text-neutral-800 text-xs uppercase tracking-[0.25em]
            font-light
            transition-all duration-300
            hover:bg-neutral-800 hover:text-white
          "
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
