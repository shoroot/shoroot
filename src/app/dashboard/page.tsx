import { UserBetsDashboard } from "@/components/user-bets-dashboard";
import { ProtectedRoute } from "@/components/protected-route";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <UserBetsDashboard />
    </ProtectedRoute>
  );
}
