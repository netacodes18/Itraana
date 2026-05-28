import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { QuickViewProvider } from "@/context/QuickViewContext";
import NavBar from "@/components/NavBar";
import AuthDrawer from "@/components/AuthDrawer";
import CartDrawer from "@/components/CartDrawer";
import QuickViewDrawer from "@/components/QuickViewDrawer";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Itraana - Handcrafted Attars & Pure Essences",
  description: "ITRAANA represents the timeless art of attar — rooted in India’s rich heritage and crafted for the modern world.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col bg-white text-black`}>
        <AuthProvider>
          <CartProvider>
            <QuickViewProvider>
              <NavBar />
              <AuthDrawer />
              <CartDrawer />
              <QuickViewDrawer />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </QuickViewProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
