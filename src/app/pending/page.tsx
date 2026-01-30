"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function PendingPage() {
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

    // If user is deactivated, redirect to suspended page
    if (user?.status === "deactivated") {
      router.push("/suspended");
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
          <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">⏳</span>
          </div>
          <CardTitle className="text-2xl">Account Pending Approval</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2 text-muted-foreground">
            <p>Your account is currently pending admin approval.</p>
            <p>You will be able to access the platform once approved.</p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">
              What happens next?
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>An admin will review your account</li>
              <li>You will receive a notification once approved</li>
              <li>You can then log in and start using the platform</li>
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
