export interface User {
  id: number;
  email: string;
  fullName?: string;
  role: "admin" | "user";
  createdAt: string;
}

export interface Assignee {
  userId: number;
  email: string;
  fullName?: string;
  assignedAt: string;
}

export interface Bet {
  id: number;
  title: string;
  description: string;
  amount: number;
  status: "active" | "in-progress" | "resolved";
  visibility: "public" | "private";
  winningOption?: string;
  options: BetOption[];
  participationCount: number;
  assignees?: Assignee[];
  createdAt: string;
  updatedAt?: string;
}

export interface BetOption {
  id: number;
  optionText: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  role: "admin" | "user";
}

export interface UpdateUserData {
  email?: string;
  password?: string;
  role?: "admin" | "user";
}

export interface CreateBetData {
  title: string;
  description: string;
  amount: number;
  options: string[];
  visibility: "public" | "private";
  assignees?: number[];
}

export interface UpdateBetData {
  title?: string;
  description?: string;
  amount?: number;
  options?: string[];
  visibility?: "public" | "private";
  assignees?: number[];
}

export interface AdminStats {
  totalUsers: number;
  activeBets: number;
  resolvedBets: number;
  closedBets: number;
  totalMoneyRaised: number;
}

export interface AdminDashboardProps {
  // Add any props if needed
}
