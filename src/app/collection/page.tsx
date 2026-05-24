"use client";

import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";

export default function Collection() {
  return (
    <section className="min-h-screen px-6 py-16 max-w-[1400px] mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl tracking-widest font-light">
          OUR COLLECTION
        </h1>
        <p className="mt-3 text-black/60">
          Handcrafted attars. Timeless essence.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </section>
  );
}
