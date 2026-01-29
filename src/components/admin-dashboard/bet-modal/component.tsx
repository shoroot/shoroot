"use client";

import { useState, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Bet, CreateBetData, UpdateBetData, User } from "../types";
import { validateBetOptions } from "../utils";
import { Search, X, Lock, Globe } from "lucide-react";

interface BetModalProps {
  isOpen: boolean;
  onClose: () => void;
  bet?: Bet | null;
  onSubmit: (data: CreateBetData | UpdateBetData) => Promise<void>;
  mode: "create" | "edit";
  initialTitle?: string;
  initialDescription?: string;
  initialOptions?: string[];
  users?: User[];
}

export function BetModal({
  isOpen,
  onClose,
  bet,
  onSubmit,
  mode,
  initialTitle = "",
  initialDescription = "",
  initialOptions = ["", ""],
  users = [],
}: BetModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [selectedAssignees, setSelectedAssignees] = useState<number[]>([]);
  const [assigneeSearch, setAssigneeSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    amount?: string;
    options?: string;
    assignees?: string;
  }>({});

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && bet) {
        setTitle(bet.title);
        setDescription(bet.description);
        setAmount(bet.amount.toString());
        setOptions(bet.options.map((opt) => opt.optionText));
        setVisibility(bet.visibility || "public");
        setSelectedAssignees(bet.assignees?.map((a) => a.userId) || []);
      } else {
        setTitle(initialTitle);
        setDescription(initialDescription);
        setAmount("");
        setOptions(initialOptions);
        setVisibility("public");
        setSelectedAssignees([]);
      }
      setAssigneeSearch("");
      setErrors({});
    }
  }, [isOpen]);

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const toggleAssignee = (userId: number) => {
    setSelectedAssignees((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const removeAssignee = (userId: number) => {
    setSelectedAssignees((prev) => prev.filter((id) => id !== userId));
  };

  const filteredUsers = users.filter(
    (user) =>
      user.role === "user" &&
      (user.email.toLowerCase().includes(assigneeSearch.toLowerCase()) ||
        user.fullName?.toLowerCase().includes(assigneeSearch.toLowerCase())) &&
      !selectedAssignees.includes(user.id),
  );

  const selectedUsers = users.filter((user) =>
    selectedAssignees.includes(user.id),
  );

  const validateForm = () => {
    const newErrors: {
      title?: string;
      description?: string;
      amount?: string;
      options?: string;
      assignees?: string;
    } = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!description.trim()) {
      newErrors.description = "Description is required";
    }

    const amountValue = parseFloat(amount);
    if (!amount || isNaN(amountValue) || amountValue <= 0) {
      newErrors.amount = "Please enter a valid amount greater than 0";
    }

    const optionsValidation = validateBetOptions(options);
    if (!optionsValidation.isValid) {
      newErrors.options = optionsValidation.message;
    }

    // Validate assignees for private bets
    if (visibility === "private" && selectedAssignees.length === 0) {
      newErrors.assignees = "Private bets require at least one assignee";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const baseData = {
        title: title.trim(),
        description: description.trim(),
        amount: parseFloat(amount),
        options: options.map((opt) => opt.trim()).filter((opt) => opt),
        visibility,
        ...(visibility === "private" && { assignees: selectedAssignees }),
      };

      const data =
        mode === "create"
          ? baseData
          : {
              ...(title.trim() !== bet?.title && { title: title.trim() }),
              ...(description.trim() !== bet?.description && {
                description: description.trim(),
              }),
              ...(parseFloat(amount) !== bet?.amount && {
                amount: parseFloat(amount),
              }),
              ...(JSON.stringify(
                options.map((opt) => opt.trim()).filter((opt) => opt),
              ) !==
                JSON.stringify(bet?.options.map((opt) => opt.optionText)) && {
                options: options.map((opt) => opt.trim()).filter((opt) => opt),
              }),
              ...(visibility !== bet?.visibility && { visibility }),
              ...(visibility === "private" && {
                assignees: selectedAssignees,
              }),
            };

      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error("Bet modal submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTitle(initialTitle);
    setDescription(initialDescription);
    setAmount("");
    setOptions(initialOptions);
    setVisibility("public");
    setSelectedAssignees([]);
    setAssigneeSearch("");
    setErrors({});
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Bet" : "Edit Bet"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new bet with options for users to participate in."
              : "Update bet information."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Title */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <div className="col-span-3">
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">{errors.title}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <div className="col-span-3">
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.description}
                </p>
              )}
            </div>
          </div>

          {/* Amount */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount (Toman)
            </Label>
            <div className="col-span-3">
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={errors.amount ? "border-red-500" : ""}
              />
              {errors.amount && (
                <p className="text-sm text-red-500 mt-1">{errors.amount}</p>
              )}
            </div>
          </div>

          {/* Visibility Toggle */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Visibility</Label>
            <div className="col-span-3">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={visibility === "public" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setVisibility("public")}
                  className="flex items-center gap-2"
                >
                  <Globe className="w-4 h-4" />
                  Public
                </Button>
                <Button
                  type="button"
                  variant={visibility === "private" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setVisibility("private")}
                  className="flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Private
                </Button>
              </div>
              {mode === "edit" &&
                bet?.visibility === "private" &&
                visibility === "public" && (
                  <p className="text-sm text-amber-600 mt-2">
                    Warning: Changing to public will remove all assignees.
                  </p>
                )}
            </div>
          </div>

          {/* Assignees Selector (only for private bets) */}
          {visibility === "private" && (
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Assignees</Label>
              <div className="col-span-3 space-y-3">
                {/* Selected Assignees */}
                {selectedUsers.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map((user) => (
                      <Badge
                        key={user.id}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {user.fullName || user.email}
                        <button
                          type="button"
                          onClick={() => removeAssignee(user.id)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    value={assigneeSearch}
                    onChange={(e) => setAssigneeSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Available Users List */}
                {assigneeSearch && filteredUsers.length > 0 && (
                  <div className="border rounded-md max-h-32 overflow-y-auto">
                    {filteredUsers.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => toggleAssignee(user.id)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
                      >
                        <div className="font-medium">
                          {user.fullName || user.email}
                        </div>
                        {user.fullName && (
                          <div className="text-gray-500 text-xs">
                            {user.email}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {errors.assignees && (
                  <p className="text-sm text-red-500">{errors.assignees}</p>
                )}
              </div>
            </div>
          )}

          {/* Options */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Options</Label>
            <div className="col-span-3 space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className={errors.options ? "border-red-500" : ""}
                  />
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeOption(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                className="w-full"
              >
                Add Option
              </Button>
              {errors.options && (
                <p className="text-sm text-red-500">{errors.options}</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting
              ? mode === "create"
                ? "Creating..."
                : "Updating..."
              : mode === "create"
                ? "Create"
                : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
