"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function SuspendedPage() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    // If user is not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    // If user is active, redirect to home
    if (user?.status === "active") {
      router.push("/");
      return;
    }

    // If user is pending, redirect to pending page
    if (user?.status === "pending") {
      router.push("/pending");
      return;
    }
  }, [user, isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">🚫</span>
          </div>
          <CardTitle className="text-2xl">Account Suspended</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2 text-muted-foreground">
            <p>Your account has been suspended.</p>
            <p>You cannot access the platform at this time.</p>
          </div>

          <div className="bg-destructive/10 rounded-lg p-4 text-sm">
            <p className="font-medium text-destructive mb-1">
              Why am I seeing this?
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Violation of platform terms of service</li>
              <li>Suspicious activity detected</li>
              <li>Account under review</li>
              <li>Requested by account owner or admin</li>
            </ul>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            If you believe this is a mistake, please contact the admin.
          </p>

          <Button onClick={handleLogout} variant="outline" className="w-full">
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
