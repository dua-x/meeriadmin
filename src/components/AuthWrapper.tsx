"use client";

import { useEffect, useState } from "react";
import Signin from "@/components/Signin";
import { useRouter, usePathname } from "next/navigation";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("authtoken");

    if (token) {
      setIsAuthenticated(true);
      // ✅ don't force redirect to `/`, just let user stay
      // but if they’re on signin page with token, send them home
      if (pathname === "/signin") {
        router.push("/");
      }
    } else {
      setIsAuthenticated(false);
      if (pathname !== "/signin") {
        router.push("/signin");
      }
    }
  }, [router, pathname]);

  if (isAuthenticated === null) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
        {/* Loader */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute w-24 h-24 border-4 border-[#C4A484] border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute w-16 h-16 border-4 border-[#857B74] border-t-transparent rounded-full animate-spin-slow"></div>
          <span className="text-[#C4A484] font-bold text-2xl tracking-wide">M</span>
        </div>
        <p className="mt-6 text-[#857B74] text-lg font-semibold tracking-wide">
          Elevating Your Style at
          <span className="text-[#C4A484] font-bold"> Merri Store</span>...
        </p>
        <p className="mt-2 text-sm text-gray-500 opacity-80 animate-fade-in">
          Just a moment, fashion takes time.
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Signin />;
  }

  return <>{children}</>;
}
