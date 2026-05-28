"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import * as cartApiService from "@/services/cart.service";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  size: string;
  quantity: number;
}

interface CartContextType {
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  addToCart: (product: any, quantity?: number, size?: string) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateCartItem: (productId: string, quantity: number, size?: string) => Promise<void>;
  clearCartItems: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // 1. Fetch Cart from Database when User logs in
  useEffect(() => {
    if (user && isAuthenticated) {
      cartApiService
        .getCart()
        .then((res) => {
          // Unpacked Axios response returns PopulatedCartItem[] directly
          const dbCart = res.data || [];
          const mappedItems: CartItem[] = dbCart.map((item: any) => ({
            id: item.productId._id || item.productId.id,
            name: item.productId.name,
            price: item.productId.price,
            image: item.productId.image,
            description: item.productId.description || "",
            size: item.size || "6ml",
            quantity: item.quantity || 1,
          }));
          setCartItems(mappedItems);
        })
        .catch((err) => {
          console.error("Failed to load user cart from database", err);
        });
    } else {
      setCartItems([]);
    }
  }, [user, isAuthenticated]);

  // 2. Add Item to Cart (calls database if logged in)
  const addToCart = async (product: any, quantity = 1, size = "6ml") => {
    if (user && isAuthenticated) {
      try {
        const res = await cartApiService.addToCart(product.id, quantity, size);
        const dbCart = res.data || [];
        const mappedItems: CartItem[] = dbCart.map((item: any) => ({
          id: item.productId._id || item.productId.id,
          name: item.productId.name,
          price: item.productId.price,
          image: item.productId.image,
          description: item.productId.description || "",
          size: item.size || "6ml",
          quantity: item.quantity || 1,
        }));
        setCartItems(mappedItems);
      } catch (err) {
        console.error("Failed to add to database cart", err);
        throw err;
      }
    } else {
      // Local state fallback for guest users
      setCartItems((prev) => {
        const existingIndex = prev.findIndex(
          (item) => item.id === product.id && item.size === size
        );
        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex].quantity += quantity;
          return updated;
        }
        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            description: product.description || "",
            size,
            quantity,
          },
        ];
      });
    }
    setIsCartOpen(true);
  };

  // 3. Remove Item from Cart (calls database if logged in)
  const removeFromCart = async (productId: string) => {
    if (user && isAuthenticated) {
      try {
        const res = await cartApiService.removeFromCart(productId);
        const dbCart = res.data || [];
        const mappedItems: CartItem[] = dbCart.map((item: any) => ({
          id: item.productId._id || item.productId.id,
          name: item.productId.name,
          price: item.productId.price,
          image: item.productId.image,
          description: item.productId.description || "",
          size: item.size || "6ml",
          quantity: item.quantity || 1,
        }));
        setCartItems(mappedItems);
      } catch (err) {
        console.error("Failed to remove from database cart", err);
        throw err;
      }
    } else {
      setCartItems((prev) => prev.filter((item) => item.id !== productId));
    }
  };

  // 4. Clear Entire Cart
  const clearCartItems = async () => {
    if (user && isAuthenticated) {
      try {
        await cartApiService.clearCart();
        setCartItems([]);
      } catch (err) {
        console.error("Failed to clear database cart", err);
        throw err;
      }
    } else {
      setCartItems([]);
    }
  };

  // 5. Update Item in Cart (calls database if logged in)
  const updateCartItem = async (productId: string, quantity: number, size?: string) => {
    if (user && isAuthenticated) {
      try {
        const res = await cartApiService.updateCartItem(productId, quantity, size);
        const dbCart = res.data || [];
        const mappedItems: CartItem[] = dbCart.map((item: any) => ({
          id: item.productId._id || item.productId.id,
          name: item.productId.name,
          price: item.productId.price,
          image: item.productId.image,
          description: item.productId.description || "",
          size: item.size || "6ml",
          quantity: item.quantity || 1,
        }));
        setCartItems(mappedItems);
      } catch (err) {
        console.error("Failed to update database cart item", err);
        throw err;
      }
    } else {
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === productId ? { ...item, quantity, size: size || item.size } : item
        )
      );
    }
  };

  return (
    <CartContext.Provider
      value={{
        isCartOpen,
        setIsCartOpen,
        cartItems,
        setCartItems, // kept for backward compatibility
        addToCart,
        removeFromCart,
        updateCartItem,
        clearCartItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
