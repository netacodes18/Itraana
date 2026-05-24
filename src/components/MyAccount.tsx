"use client";

import { useEffect, useState } from "react";
import {
  getUserProfile,
  updateUserProfile,
  getWishlist,
  removeFromWishlist,
} from "../services/user.service";
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

export default function MyAccount() {
  const router = useRouter();
  const { logout } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  const [editData, setEditData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    email: "",
  });

  /* =========================
     FETCH PROFILE + WISHLIST
  ========================= */
  useEffect(() => {
    Promise.all([getUserProfile(), getWishlist()])
      .then(([profileRes, wishlistRes]) => {
        setProfile(profileRes.data);
        setEditData({
          firstName: profileRes.data.firstName,
          lastName: profileRes.data.lastName,
          email: profileRes.data.email,
        });
        setWishlist(wishlistRes.data);
      })
      .catch((err) => {
        console.error("Failed to load account data", err);
      });
  }, []);

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
