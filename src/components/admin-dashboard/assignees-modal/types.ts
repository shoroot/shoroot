import { Assignee, User } from "../types";

export interface AssigneesModalProps {
  isOpen: boolean;
  onClose: () => void;
  betId: number;
  betTitle: string;
  assignees: Assignee[];
  availableUsers: User[];
  onAddAssignees: (userIds: number[]) => Promise<void>;
  onRemoveAssignee: (userId: number) => Promise<void>;
  isLoading?: boolean;
}
