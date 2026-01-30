"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/auth/login");
      } else if (user?.status === "pending") {
        router.push("/pending");
      } else if (user?.status === "deactivated") {
        router.push("/suspended");
      } else if (requireAdmin && user?.role !== "admin") {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, isLoading, requireAdmin, user, router]);

  // Show loading state while checking authentication
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  // If admin is required but user is not admin, don't render children
  if (requireAdmin && user?.role !== "admin") {
    return null;
  }

  return <>{children}</>;
}
