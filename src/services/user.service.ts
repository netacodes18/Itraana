import api from "../api/axios";

/* =========================
   PROFILE
========================= */

// Get logged-in user profile
export const getUserProfile = () => {
  return api.get("/user/profile");
};

// Update profile (name, email, etc.)
export const updateUserProfile = (data: {
  firstName: string;
  lastName: string;
  email: string;
}) => {
  return api.put("/user/profile", data);
};

/* =========================
   ORDERS
========================= */

// Get user's orders
export const getUserOrders = () => {
  return api.get("/user/orders");
};

/* =========================
   WISHLIST
========================= */

// Get wishlist
export const getWishlist = () => {
  return api.get("/user/wishlist");
};

// Remove item from wishlist
export const removeFromWishlist = (productId: number | string) => {
  return api.delete(`/user/wishlist/${productId}`);
};
