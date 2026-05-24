"use client";

import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

export default function ProductSection() {
  const [wishlist, setWishlist] = useState<Record<number, boolean>>({});
  const { setCartItems, setIsCartOpen } = useCart();
  const { isAuthenticated, setIsAuthOpen } = useAuth();

  const products = [
    {
      id: 1,
      name: "Noor",
      price: 2499,
      image: "/assets/attar1.jpg",
      description: "Luminous floral essence"
    },
    {
      id: 2,
      name: "Oudh",
      price: 3999,
      image: "/assets/attar2.jpg",
      description: "Rich woody depths"
    },
    {
      id: 3,
      name: "Amber",
      price: 2899,
      image: "/assets/attar3.jpg",
      description: "Warm resinous allure"
    }
  ];

  const toggleWishlist = (productId: number) => {
    setWishlist(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const addToCart = (product: any) => {
    if (!isAuthenticated) {
      setIsAuthOpen(true);
      return;
    }
    setCartItems(prev => {
      if (prev.some(item => item.id === product.id)) {
        return prev;
      }
      return [...prev, product];
    });
    setIsCartOpen(true);
  };

  return (
    <section className="bg-neutral-50 py-32">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {products.map((product) => (
            <div 
              key={product.id} 
              className="group"
            >
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
                  className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:bg-white hover:scale-110"
                  aria-label="Add to wishlist"
                >
                  <svg
                    className={`w-5 h-5 transition-colors duration-300 ${
                      wishlist[product.id] 
                        ? 'fill-red-500 stroke-red-500' 
                        : 'fill-none stroke-neutral-700'
                    }`}
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>

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
                    ₹{product.price.toLocaleString('en-IN')}
                  </p>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => addToCart(product)}
                  className="w-full py-3 border border-neutral-800 text-neutral-800 text-xs uppercase tracking-[0.25em] font-light transition-all duration-300 hover:bg-neutral-800 hover:text-white"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

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
