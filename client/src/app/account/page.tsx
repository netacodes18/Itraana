"use client";

import { useAuth } from "@/context/AuthContext";
import MyAccount from "@/components/MyAccount";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AccountPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return <MyAccount />;
}
