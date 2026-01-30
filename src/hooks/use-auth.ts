import { useAuthStore } from "@/stores/auth-store";

export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    setLoading,
    setError,
    updateUser,
  } = useAuthStore();

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    setLoading,
    setError,
    updateUser,
    isAdmin: user?.role === "admin",
    isUser: user?.role === "user",
    isActive: user?.status === "active",
    isPending: user?.status === "pending",
    isDeactivated: user?.status === "deactivated",
  };
};

// Helper to check if user can perform actions
export function canUserAct(userStatus: string): boolean {
  return userStatus === "active";
}

// Helper to get status message
export function getStatusMessage(status: string): string {
  switch (status) {
    case "pending":
      return "Your account is pending approval. Please contact admin.";
    case "deactivated":
      return "Your account has been suspended. Please contact admin.";
    default:
      return "";
  }
}
