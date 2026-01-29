import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bet } from "../types";
import { formatDate, formatCurrency, getStatusColor } from "../utils";
import { Lock, Globe, Users } from "lucide-react";

interface BetsTableProps {
  bets: Bet[];
  onCreateBet: () => void;
  onEditBet: (bet: Bet) => void;
  onStatusChange: (bet: Bet) => void;
  onDeleteBet: (betId: number) => void;
  onManageAssignees?: (bet: Bet) => void;
  visibilityFilter?: "all" | "public" | "private";
  onVisibilityFilterChange?: (filter: "all" | "public" | "private") => void;
}

export function BetsTable({
  bets,
  onCreateBet,
  onEditBet,
  onStatusChange,
  onDeleteBet,
  onManageAssignees,
  visibilityFilter = "all",
  onVisibilityFilterChange,
}: BetsTableProps) {
  const getVisibilityBadge = (visibility: string) => {
    if (visibility === "private") {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Lock className="w-3 h-3" />
          Private
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="flex items-center gap-1">
        <Globe className="w-3 h-3" />
        Public
      </Badge>
    );
  };

  const filteredBets =
    visibilityFilter === "all"
      ? bets
      : bets.filter((bet) => bet.visibility === visibilityFilter);

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold dark:text-white">Bets</h2>
        <div className="flex items-center gap-4">
          {onVisibilityFilterChange && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Filter:
              </span>
              <select
                value={visibilityFilter}
                onChange={(e) =>
                  onVisibilityFilterChange(
                    e.target.value as "all" | "public" | "private",
                  )
                }
                className="text-sm border rounded-md px-3 py-1.5 bg-white dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="all">All</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
          )}
          <Button onClick={onCreateBet}>Create Bet</Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Title
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Visibility
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredBets.map((bet) => (
              <tr key={bet.id}>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {bet.id}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  <div className="flex items-center gap-2">
                    {bet.title}
                    {bet.visibility === "private" && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {bet.assignees?.length || 0}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {getVisibilityBadge(bet.visibility)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <Badge className={getStatusColor(bet.status)}>
                    {bet.status.replace("-", " ")}
                  </Badge>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatCurrency(bet.amount)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(bet.createdAt)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditBet(bet)}
                    >
                      Edit
                    </Button>
                    {bet.visibility === "private" && onManageAssignees && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onManageAssignees(bet)}
                      >
                        Assignees
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onStatusChange(bet)}
                    >
                      Status
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDeleteBet(bet.id)}
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

      {filteredBets.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No bets found
        </div>
      )}
    </>
  );
}
