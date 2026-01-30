import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User } from "../types";
import { formatDate, getRoleColor, getUserStatusColor } from "../utils";

interface UsersTableProps {
  users: User[];
  onCreateUser: () => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: number) => void;
  onApproveUser?: (userId: number) => void;
  onDeactivateUser?: (userId: number) => void;
  onReactivateUser?: (userId: number) => void;
  statusFilter?: "all" | "pending" | "active" | "deactivated";
  onStatusFilterChange?: (
    filter: "all" | "pending" | "active" | "deactivated",
  ) => void;
}

export function UsersTable({
  users,
  onCreateUser,
  onEditUser,
  onDeleteUser,
  onApproveUser,
  onDeactivateUser,
  onReactivateUser,
  statusFilter = "all",
  onStatusFilterChange,
}: UsersTableProps) {
  const filteredUsers =
    statusFilter === "all"
      ? users
      : users.filter((user) => user.status === statusFilter);

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h2 className="text-xl font-semibold dark:text-white">Users</h2>
        <div className="flex items-center gap-2">
          {onStatusFilterChange && (
            <select
              value={statusFilter}
              onChange={(e) =>
                onStatusFilterChange(e.target.value as typeof statusFilter)
              }
              className="px-3 py-2 rounded-md border border-input bg-background text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="deactivated">Deactivated</option>
            </select>
          )}
          <Button onClick={onCreateUser}>Create User</Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {user.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className={getUserStatusColor(user.status)}>
                    {user.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditUser(user)}
                    >
                      Edit
                    </Button>
                    {user.status === "pending" && onApproveUser && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onApproveUser(user.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Approve
                      </Button>
                    )}
                    {user.status === "active" && onDeactivateUser && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDeactivateUser(user.id)}
                      >
                        Deactivate
                      </Button>
                    )}
                    {user.status === "deactivated" && onReactivateUser && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onReactivateUser(user.id)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Reactivate
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDeleteUser(user.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No users found
        </div>
      )}
    </>
  );
}
