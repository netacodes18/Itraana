import api from "../api/axios";

/* =========================
   ORDER SERVICES
 ========================= */

// Get orders for the authenticated user
export const getOrders = (page: number = 1, limit: number = 10) => {
  return api.get(`/orders?page=${page}&limit=${limit}`);
};

// Cancel a pending order
export const cancelOrder = (orderId: string | number) => {
  return api.put(`/orders/${orderId}`);
};
