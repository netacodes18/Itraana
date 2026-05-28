"use client";

import { useEffect, useState } from "react";
import {
  getUserProfile,
  updateUserProfile,
  getWishlist,
  removeFromWishlist,
} from "../services/user.service";
import { getOrders, cancelOrder } from "../services/order.service";
import { logoutUser } from "../services/auth.service";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
}

interface WishlistItem {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
}

interface OrderItem {
  productId: string;
  name: string;
  image: string;
  size: string;
  quantity: number;
  priceAtCheckout: number;
  subtotal: number;
}

interface OrderData {
  _id: string;
  totalAmount: number;
  orderStatus: "processing" | "confirmed" | "shipped" | "delivered" | "cancelled";
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pinCode: string;
  };
}

export default function MyAccount() {
  const router = useRouter();
  const { logout } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const [editData, setEditData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    email: "",
  });

  /* =========================
     FETCH PROFILE + WISHLIST + ORDERS
  ========================= */
  useEffect(() => {
    Promise.all([getUserProfile(), getWishlist(), getOrders()])
      .then(([profileRes, wishlistRes, ordersRes]) => {
        setProfile(profileRes.data);
        setEditData({
          firstName: profileRes.data.firstName,
          lastName: profileRes.data.lastName,
          email: profileRes.data.email,
        });
        setWishlist(wishlistRes.data);
        setOrders(ordersRes.data?.orders || []);
      })
      .catch((err) => {
        console.error("Failed to load account data", err);
      })
      .finally(() => {
        setOrdersLoading(false);
      });
  }, []);

  /* =========================
     CANCEL ORDER
  ========================= */
  const handleCancelOrder = async (orderId: string) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this order?");
    if (!confirmCancel) return;

    try {
      await cancelOrder(orderId);
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, orderStatus: "cancelled" as const } : order
        )
      );
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to cancel order";
      alert(errorMsg);
    }
  };

  /* =========================
     UPDATE PROFILE
  ========================= */
  const handleUpdateProfile = async () => {
    try {
      const res = await updateUserProfile(editData);
      setProfile(res.data);
      setIsEditing(false);
    } catch {
      alert("Failed to update profile");
    }
  };

  /* =========================
     REMOVE WISHLIST ITEM
  ========================= */
  const handleRemoveWishlist = async (productId: number) => {
    try {
      await removeFromWishlist(productId);
      setWishlist((prev) =>
        prev.filter((item) => item.id !== productId)
      );
    } catch {
      alert("Failed to remove item");
    }
  };

  /* =========================
     LOGOUT
  ========================= */
  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {}
    localStorage.removeItem("token");
    logout();
    router.push("/");
  };

  return (
    <section className="min-h-screen bg-neutral-50">
      {/* HERO */}
      <div className="bg-neutral-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-8">
          <h1 className="text-3xl font-light">
            Welcome, {profile?.firstName || "—"}
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-16">
        {/* PROFILE */}
        <div className="bg-white p-8 mb-8">
          <div className="flex justify-between mb-6">
            <div>
              <h2 className="text-xl">
                {profile?.firstName || "—"} {profile?.lastName || ""}
              </h2>
              <p className="text-sm text-neutral-500">
                {profile?.email || ""}
              </p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="border px-6 py-2 text-xs uppercase"
            >
              {isEditing ? "Cancel" : "Edit"}
            </button>
          </div>

          {isEditing && (
            <div className="space-y-4">
              <input
                value={editData.firstName}
                onChange={(e) =>
                  setEditData({ ...editData, firstName: e.target.value })
                }
                className="border p-2 w-full"
                placeholder="First Name"
              />
              <input
                value={editData.lastName}
                onChange={(e) =>
                  setEditData({ ...editData, lastName: e.target.value })
                }
                className="border p-2 w-full"
                placeholder="Last Name"
              />
              <input
                value={editData.email}
                onChange={(e) =>
                  setEditData({ ...editData, email: e.target.value })
                }
                className="border p-2 w-full"
                placeholder="Email"
              />
              <button
                onClick={handleUpdateProfile}
                className="bg-black text-white px-6 py-2 text-xs uppercase"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* ORDERS */}
        <div className="bg-white p-8 mb-8 font-light">
          <h3 className="mb-6 text-lg uppercase tracking-wider font-light text-neutral-800">
            Order History ({orders.length})
          </h3>

          {ordersLoading ? (
            <p className="text-neutral-500 text-sm">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="text-neutral-500 text-sm">You haven't placed any orders yet.</p>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="border border-neutral-200 p-6 space-y-4"
                >
                  {/* Order header */}
                  <div className="flex flex-wrap justify-between items-center gap-4 pb-4 border-b border-neutral-100 text-xs uppercase tracking-wider">
                    <div>
                      <p className="text-neutral-400 text-[10px]">Order ID</p>
                      <p className="font-mono font-bold text-neutral-800 text-[11px] mt-0.5 select-all">{order._id}</p>
                    </div>
                    <div>
                      <p className="text-neutral-400 text-[10px]">Placed On</p>
                      <p className="text-neutral-800 font-light mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-neutral-400 text-[10px]">Status</p>
                      <p className={`font-medium mt-0.5 ${
                        order.orderStatus === "cancelled"
                          ? "text-red-500"
                          : order.orderStatus === "delivered"
                          ? "text-green-600"
                          : "text-amber-600"
                      }`}>
                        {order.orderStatus}
                      </p>
                    </div>
                    <div>
                      <p className="text-neutral-400 text-[10px]">Total</p>
                      <p className="text-neutral-800 font-medium mt-0.5">₹{order.totalAmount.toLocaleString("en-IN")}</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex gap-4 items-center">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-20 object-cover bg-neutral-50 border border-neutral-100"
                        />
                        <div className="flex-1 text-xs">
                          <p className="font-medium uppercase tracking-wider text-neutral-800">{item.name}</p>
                          <p className="text-neutral-400 mt-1">Size: {item.size} | Qty: {item.quantity}</p>
                          <p className="text-neutral-500 mt-0.5">₹{item.priceAtCheckout.toLocaleString("en-IN")} each</p>
                        </div>
                        <div className="text-sm font-light text-neutral-700">
                          ₹{(item.priceAtCheckout * item.quantity).toLocaleString("en-IN")}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer details */}
                  <div className="flex flex-wrap justify-between items-end gap-4 pt-4 border-t border-neutral-100 text-xs">
                    <div>
                      <p className="text-neutral-400 uppercase tracking-wider mb-1 text-[10px]">Delivery Details</p>
                      <p className="text-neutral-600 font-light leading-relaxed">
                        {order.shippingAddress.fullName} · {order.shippingAddress.phone} <br />
                        {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pinCode}
                      </p>
                    </div>

                    {order.orderStatus === "processing" && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        className="border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-500 px-4 py-2 text-[10px] uppercase tracking-widest font-light transition cursor-pointer"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* WISHLIST */}
        <div className="bg-white p-8 mb-8">
          <h3 className="mb-6 text-lg">
            Wishlist ({wishlist.length})
          </h3>

          {wishlist.length === 0 ? (
            <p className="text-neutral-500">Your wishlist is empty</p>
          ) : (
            <div className="space-y-4">
              {wishlist.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 border p-3"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover"
                  />
                  <div className="flex-1">
                    <p>{item.name}</p>
                    <p>₹{item.price}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveWishlist(item.id)}
                    className="text-red-500 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* LOGOUT */}
        <div className="text-center">
          <button
            onClick={handleLogout}
            className="border px-8 py-3 text-xs uppercase hover:bg-black hover:text-white"
          >
            Sign Out
          </button>
        </div>
      </div>
    </section>
  );
}
