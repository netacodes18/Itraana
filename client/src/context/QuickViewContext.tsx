"use client";

import React, { createContext, useContext, useState } from "react";

interface QuickViewContextType {
  isQuickViewOpen: boolean;
  selectedProduct: any | null;
  openQuickView: (product: any) => void;
  closeQuickView: () => void;
}

const QuickViewContext = createContext<QuickViewContextType | undefined>(undefined);

export function QuickViewProvider({ children }: { children: React.ReactNode }) {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  const openQuickView = (product: any) => {
    setSelectedProduct(product);
    setIsQuickViewOpen(true);
  };

  const closeQuickView = () => {
    setIsQuickViewOpen(false);
    // Don't clear immediately to allow transition animation to finish
    setTimeout(() => {
      setSelectedProduct(null);
    }, 300);
  };

  return (
    <QuickViewContext.Provider
      value={{
        isQuickViewOpen,
        selectedProduct,
        openQuickView,
        closeQuickView,
      }}
    >
      {children}
    </QuickViewContext.Provider>
  );
}

export const useQuickView = () => {
  const context = useContext(QuickViewContext);
  if (!context) {
    throw new Error("useQuickView must be used within QuickViewProvider");
  }
  return context;
};
