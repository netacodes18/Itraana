import api from "../api/axios";

/* =========================
   PRODUCT SERVICES
========================= */

// Get all products
export const getAllProducts = () => {
  return api.get("/products");
};

// Get single product by ID
export const getProductById = (productId: string | number) => {
  return api.get(`/products/${productId}`);
};

// Search products
export const searchProducts = (query: string) => {
  return api.get(`/products/search?q=${query}`);
};

// Get products by category
export const getProductsByCategory = (category: string) => {
  return api.get(`/products/category/${category}`);
};
