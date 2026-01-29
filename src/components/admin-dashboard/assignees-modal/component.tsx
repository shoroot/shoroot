"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AssigneesModalProps } from "./types";
import { Search, X, UserPlus, Trash2 } from "lucide-react";

export function AssigneesModal({
  isOpen,
  onClose,
  betId,
  betTitle,
  assignees,
  availableUsers,
  onAddAssignees,
  onRemoveAssignee,
  isLoading = false,
}: AssigneesModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState<number | null>(null);

  // Filter out users that are already assignees and match search
  const filteredAvailableUsers = useMemo(() => {
    const assigneeIds = new Set(assignees.map((a) => a.userId));
    return availableUsers.filter(
      (user) =>
        user.role === "user" &&
        !assigneeIds.has(user.id) &&
        (user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.fullName?.toLowerCase().includes(searchQuery.toLowerCase())),
    );
  }, [availableUsers, assignees, searchQuery]);

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleAddAssignees = async () => {
    if (selectedUsers.length === 0) return;
    setIsAdding(true);
    try {
      await onAddAssignees(selectedUsers);
      setSelectedUsers([]);
      setSearchQuery("");
    } catch (error) {
      console.error("Error adding assignees:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveAssignee = async (userId: number) => {
    setIsRemoving(userId);
    try {
      await onRemoveAssignee(userId);
    } catch (error) {
      console.error("Error removing assignee:", error);
    } finally {
      setIsRemoving(null);
    }
  };

  const handleClose = () => {
    setSearchQuery("");
    setSelectedUsers([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Assignees</DialogTitle>
          <DialogDescription>
            Manage users assigned to "{betTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Assignees Section */}
          <div>
            <h4 className="text-sm font-medium mb-3">
              Current Assignees ({assignees.length})
            </h4>
            {assignees.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No assignees yet. Add users below.
              </p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {assignees.map((assignee) => (
                  <div
                    key={assignee.userId}
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-md"
                  >
                    <div>
                      <div className="font-medium text-sm">
                        {assignee.fullName || assignee.email}
                      </div>
                      {assignee.fullName && (
                        <div className="text-xs text-gray-500">
                          {assignee.email}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAssignee(assignee.userId)}
                      disabled={isRemoving === assignee.userId || isLoading}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      {isRemoving === assignee.userId ? (
                        <span className="text-xs">Removing...</span>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Assignees Section */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-3">Add New Assignees</h4>

            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Selected Users Preview */}
            {selectedUsers.length > 0 && (
              <div className="mb-3">
                <div className="text-xs text-gray-500 mb-2">
                  Selected ({selectedUsers.length}):
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedUsers.map((userId) => {
                    const user = availableUsers.find((u) => u.id === userId);
                    if (!user) return null;
                    return (
                      <Badge
                        key={userId}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {user.fullName || user.email}
                        <button
                          type="button"
                          onClick={() => toggleUserSelection(userId)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Available Users List */}
            {searchQuery && filteredAvailableUsers.length > 0 && (
              <div className="border rounded-md max-h-40 overflow-y-auto">
                {filteredAvailableUsers.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => toggleUserSelection(user.id)}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm border-b last:border-b-0 ${
                      selectedUsers.includes(user.id)
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {user.fullName || user.email}
                        </div>
                        {user.fullName && (
                          <div className="text-gray-500 text-xs">
                            {user.email}
                          </div>
                        )}
                      </div>
                      {selectedUsers.includes(user.id) && (
                        <Badge variant="outline" className="text-xs">
                          Selected
                        </Badge>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {searchQuery && filteredAvailableUsers.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No available users found matching "{searchQuery}"
              </p>
            )}

            {/* Add Button */}
            {selectedUsers.length > 0 && (
              <Button
                onClick={handleAddAssignees}
                disabled={isAdding || isLoading}
                className="w-full mt-3"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {isAdding
                  ? "Adding..."
                  : `Add ${selectedUsers.length} Assignee${
                      selectedUsers.length > 1 ? "s" : ""
                    }`}
              </Button>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
