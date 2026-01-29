export interface BetOption {
  id: number;
  optionText: string;
}

export interface Bet {
  id: number;
  title: string;
  description: string;
  amount: number;
  status: "active" | "in-progress" | "resolved";
  visibility?: "public" | "private";
  winningOption?: string;
  winningOptionText?: string;
  options: BetOption[];
  participationCount: number;
  hasUserParticipated: boolean;
  isAssigned?: boolean;
  createdAt: string;
}

export interface UserStats {
  participated: number;
  won: number;
  lost: number;
  totalMoneyWon: number;
  totalMoneyLost: number;
}

export interface UserBetsDashboardProps {
  // Add any props if needed
}

export type TabType = "all" | "active" | "in-progress" | "resolved" | "private";
