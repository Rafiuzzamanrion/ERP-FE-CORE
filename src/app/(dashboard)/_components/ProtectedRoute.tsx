"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import Loading from "@/app/loading";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (user) {
      const userRole = user.role.toLowerCase().trim();

      // Define route protection rules
      const routeRoles: Record<string, string[]> = {
        "/categories": ["admin", "manager"],
        "/users": ["admin"],
        "/roles": ["admin"],
      };

      // Check if current path requires specific roles
      const requiredRoles = Object.entries(routeRoles).find(
        ([route]) => pathname === route || pathname.startsWith(`${route}/`)
      )?.[1];

      if (requiredRoles && !requiredRoles.includes(userRole)) {
        router.replace("/"); // Redirect unauthorized users to dashboard
      }
    }
  }, [isAuthenticated, user, pathname, router]);

  if (!isAuthenticated) {
    return <Loading />;
  }

  return <>{children}</>;
}
