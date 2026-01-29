import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  boolean,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "user"] }).notNull(),
  hasAcceptedTerms: boolean("has_accepted_terms").default(false).notNull(),
  acceptedTermsAt: timestamp("accepted_terms_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const bets = pgTable("bets", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  amount: integer("amount").notNull(),
  status: text("status", {
    enum: ["active", "in-progress", "resolved"],
  }).notNull(),
  visibility: text("visibility", { enum: ["public", "private"] })
    .default("public")
    .notNull(),
  winningOption: text("winning_option"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const betOptions = pgTable("bet_options", {
  id: serial("id").primaryKey(),
  betId: integer("bet_id")
    .notNull()
    .references(() => bets.id),
  optionText: text("option_text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const betParticipations = pgTable(
  "bet_participations",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    betId: integer("bet_id")
      .notNull()
      .references(() => bets.id),
    selectedOptionId: integer("selected_option_id").references(
      () => betOptions.id,
    ),
    isWinner: boolean("is_winner"),
    participatedAt: timestamp("participated_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueUserBet: uniqueIndex("unique_user_bet").on(table.userId, table.betId),
  }),
);

export const usersRelations = relations(users, ({ many }) => ({
  participations: many(betParticipations),
}));

export const betsRelations = relations(bets, ({ many }) => ({
  options: many(betOptions),
  participations: many(betParticipations),
}));

export const betOptionsRelations = relations(betOptions, ({ one, many }) => ({
  bet: one(bets, {
    fields: [betOptions.betId],
    references: [bets.id],
  }),
}));

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  type: text("type", {
    enum: [
      "new_bet",
      "bet_resolved",
      "bet_in_progress",
      "bet_deleted",
      "new_participant",
      "new_user",
    ],
  }).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  data: text("data"), // JSON string for additional data
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const betParticipationsRelations = relations(
  betParticipations,
  ({ one }) => ({
    user: one(users, {
      fields: [betParticipations.userId],
      references: [users.id],
    }),
    bet: one(bets, {
      fields: [betParticipations.betId],
      references: [bets.id],
    }),
    selectedOption: one(betOptions, {
      fields: [betParticipations.selectedOptionId],
      references: [betOptions.id],
    }),
  }),
);

export const termsAndConditions = pgTable("terms_and_conditions", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const betAssignees = pgTable(
  "bet_assignees",
  {
    id: serial("id").primaryKey(),
    betId: integer("bet_id")
      .notNull()
      .references(() => bets.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    assignedAt: timestamp("assigned_at").defaultNow().notNull(),
    assignedBy: integer("assigned_by")
      .notNull()
      .references(() => users.id),
  },
  (table) => ({
    uniqueBetUser: uniqueIndex("unique_bet_user_assignee").on(
      table.betId,
      table.userId,
    ),
  }),
);

export const betAssigneesRelations = relations(betAssignees, ({ one }) => ({
  bet: one(bets, {
    fields: [betAssignees.betId],
    references: [bets.id],
  }),
  user: one(users, {
    fields: [betAssignees.userId],
    references: [users.id],
  }),
  assigner: one(users, {
    fields: [betAssignees.assignedBy],
    references: [users.id],
  }),
}));
