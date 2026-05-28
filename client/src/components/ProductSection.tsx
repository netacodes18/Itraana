"use client";

import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useQuickView } from "../context/QuickViewContext";
import { getAllProducts } from "../services/product.service";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
}

export default function ProductSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const { addToCart, setIsCartOpen } = useCart();
  const { isAuthenticated, setIsAuthOpen } = useAuth();
  const { openQuickView } = useQuickView();

  useEffect(() => {
    getAllProducts()
      .then((res) => {
        // Our unpacked axios response returns { products, total, page, totalPages }
        const productsData = res.data?.products || [];
        // Take first 3 products for the home page selected creations
        setProducts(productsData.slice(0, 3));
      })
      .catch((err) => {
        console.error("Failed to load featured products", err);
        // Fallback to static products if API fails
        setProducts([
          {
            id: "6a12a9a17d0b848eb8d76ec7",
            name: "Royal Oud",
            price: 3499,
            image: "/assets/attar1.jpg",
            description: "Deep, woody oud with warm amber undertones",
          },
          {
            id: "6a12a9a17d0b848eb8d76ec8",
            name: "Amber Noir",
            price: 2999,
            image: "/assets/attar1.jpg",
            description: "Sensual amber blended with soft spices",
          },
          {
            id: "6a12a9a17d0b848eb8d76ec9",
            name: "Musk Elixir",
            price: 2499,
            image: "/assets/attar1.jpg",
            description: "Clean white musk with lingering depth",
          },
        ]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const handleAddToCart = async (product: any) => {
    if (!isAuthenticated) {
      setIsAuthOpen(true);
      return;
    }
    try {
      await addToCart(product, 1, "6ml");
    } catch (err) {
      alert("Failed to add item to cart");
    }
  };

  return (
    <section className="bg-neutral-50 py-32 animate-fadeIn">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-24">
          <div className="flex items-center justify-center gap-8 mb-6">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-neutral-300"></div>
            <p className="text-[10px] uppercase tracking-[0.5em] text-neutral-500 font-light">
              Selected Creations
            </p>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-neutral-300"></div>
          </div>
        </div>

        {/* Product Grid - All aligned at top */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col space-y-4">
                <div className="bg-neutral-200 h-[480px] w-full"></div>
                <div className="h-4 bg-neutral-200 w-1/3 mx-auto"></div>
                <div className="h-3 bg-neutral-200 w-1/2 mx-auto"></div>
                <div className="h-4 bg-neutral-200 w-1/4 mx-auto"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {products.map((product) => (
              <div key={product.id} className="group">
                {/* Image Container */}
                <div className="relative overflow-hidden mb-6 bg-white">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-[480px] object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Wishlist Button */}
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:bg-white hover:scale-110 z-20"
                    aria-label="Add to wishlist"
                  >
                    <svg
                      className={`w-5 h-5 transition-colors duration-300 ${
                        wishlist[product.id]
                          ? "fill-red-500 stroke-red-500"
                          : "fill-none stroke-neutral-700"
                      }`}
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>

                  {/* Quick View Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 bg-black/5">
                    <button
                      onClick={() => openQuickView(product)}
                      className="bg-white/95 text-neutral-800 border border-neutral-800 text-[10px] tracking-[0.2em] uppercase font-light px-6 py-2.5 hover:bg-neutral-800 hover:text-white transition duration-300 cursor-pointer shadow-sm animate-fadeIn"
                    >
                      Quick View
                    </button>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500"></div>
                </div>

                {/* Product Info */}
                <div className="text-center space-y-4">
                  <div>
                    <h3 className="text-sm uppercase tracking-[0.3em] font-light text-neutral-800 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-xs text-neutral-500 tracking-wide mb-3">
                      {product.description}
                    </p>
                    <p className="text-base font-light text-neutral-700">
                      ₹{product.price.toLocaleString("en-IN")}
                    </p>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full py-3 border border-neutral-800 text-neutral-800 text-xs uppercase tracking-[0.25em] font-light transition-all duration-300 hover:bg-neutral-800 hover:text-white"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View All Link */}
        <div className="text-center mt-20">
          <Link
            href="/collection"
            className="inline-block text-xs uppercase tracking-[0.3em] text-neutral-700 pb-1 border-b border-neutral-400 hover:border-neutral-800 transition-colors duration-300"
          >
            View Complete Collection
          </Link>
        </div>
      </div>
    </section>
  );
}
