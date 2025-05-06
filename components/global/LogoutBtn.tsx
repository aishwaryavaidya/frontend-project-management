"use client";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import React from "react";
import { LogOut } from "lucide-react";

export default function LogoutBtn() {
  const router = useRouter();
  async function handleLogout() {
    try {
      await signOut({
        callbackUrl: "/login",
        redirect: true,
      });
      // The router.push is not strictly necessary because we're using redirect: true above
      // but keeping it as a fallback mechanism
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Force navigation to login page even if signOut fails
      router.push("/login");
    }
  }
  return (
    <div className="flex items-center gap-2 cursor-pointer" onClick={handleLogout}>
      <LogOut className="h-4 w-4" />
      <span>Logout</span>
    </div>
  );
}
