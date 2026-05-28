import api from "../api/axios";

/* =========================
   CART SERVICES
========================= */

// Get cart items
export const getCart = () => {
  return api.get("/cart");
};

// Add item to cart
export const addToCart = (productId: string | number, quantity: number = 1, size?: string) => {
  return api.post("/cart", {
    productId,
    quantity,
    size,
  });
};

// Update cart item quantity
export const updateCartItem = (
  productId: string | number,
  quantity: number,
  size?: string
) => {
  return api.put(`/cart/${productId}`, {
    quantity,
    size,
  });
};

// Remove item from cart
export const removeFromCart = (productId: string | number) => {
  return api.delete(`/cart/${productId}`);
};

// Clear entire cart
export const clearCart = () => {
  return api.delete("/cart");
};
