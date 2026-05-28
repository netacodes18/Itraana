"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { getAllProducts } from "@/services/product.service";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
}

export default function Collection() {
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedCategory, setSelectedCategory] = useState("");
  const { addToCart } = useCart();
  const { isAuthenticated, setIsAuthOpen } = useAuth();

  useEffect(() => {
    setLoading(true);
    const params: any = {
      sortBy,
    };
    if (selectedCategory) {
      params.category = selectedCategory;
    }
    if (searchQuery.trim()) {
      params.search = searchQuery;
    }

    const delayDebounceFn = setTimeout(() => {
      getAllProducts(params)
        .then((res) => {
          const productsData = res.data?.products || [];
          setProductsList(productsData);
        })
        .catch((err) => {
          console.error("Failed to load collection products", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 250); // 250ms debounce for typing search

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, sortBy, selectedCategory]);

  const handleAddToCart = async (product: Product) => {
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
    <section className="min-h-screen px-6 py-16 max-w-[1400px] mx-auto animate-fadeIn">
      <div className="text-center mb-12">
        <h1 className="text-4xl tracking-widest font-light">
          OUR COLLECTION
        </h1>
        <p className="mt-3 text-black/60">
          Handcrafted attars. Timeless essence.
        </p>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-center pb-8 mb-12 border-b border-neutral-200 text-xs uppercase tracking-widest text-neutral-800">
        {/* Categories (Left) */}
        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
          {["All", "Woody", "Spicy", "Musk", "Floral", "Earthy"].map((cat) => {
            const isSelected = cat === "All" ? selectedCategory === "" : selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat === "All" ? "" : cat)}
                className={`pb-1 border-b transition cursor-pointer ${
                  isSelected
                    ? "border-neutral-800 text-neutral-900 font-medium"
                    : "border-transparent text-neutral-400 hover:text-neutral-800"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search & Sort (Right) */}
        <div className="flex flex-col sm:flex-row gap-6 w-full md:w-auto items-center">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search Scent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-b border-neutral-300 py-1 focus:outline-none focus:border-neutral-800 text-neutral-800 placeholder-neutral-400 tracking-wide text-xs"
            />
          </div>

          {/* Sort Select */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-neutral-400">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-b border-neutral-300 py-1 focus:outline-none focus:border-neutral-800 text-neutral-800 cursor-pointer text-xs"
            >
              <option value="newest" className="text-black bg-white">Newest</option>
              <option value="price_asc" className="text-black bg-white">Price: Low to High</option>
              <option value="price_desc" className="text-black bg-white">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse flex flex-col space-y-4">
              <div className="bg-neutral-200 h-[480px] w-full"></div>
              <div className="h-4 bg-neutral-200 w-1/3 mx-auto"></div>
              <div className="h-3 bg-neutral-200 w-1/2 mx-auto"></div>
              <div className="h-4 bg-neutral-200 w-1/4 mx-auto"></div>
            </div>
          ))}
        </div>
      ) : productsList.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-neutral-500">No creations found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {productsList.map((product) => (
            <ProductCard
              key={product.id}
              {...(product as any)}
              onAddToCart={() => handleAddToCart(product)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
