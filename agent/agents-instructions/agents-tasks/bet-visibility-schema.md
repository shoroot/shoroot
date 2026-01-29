## Bet Visibility Schema Changes

**Description:** Add database schema support for public/private bets and bet assignments.

**MD files to read before changes:** [`agent/database/db-schema.md`](../../database/db-schema.md)

### Schema Changes Required

#### 1. Modify `bets` table

Add visibility column to bets table:

- `visibility`: text, enum: 'public', 'private', default 'public'

#### 2. Create new `bet_assignees` table

Track which users are assigned to private bets:

- `id`: integer, primary key, auto increment
- `bet_id`: integer, foreign key to bets.id, not null
- `user_id`: integer, foreign key to users.id, not null
- `assigned_at`: datetime, default current timestamp
- `assigned_by`: integer, foreign key to users.id (admin who assigned), not null
- unique constraint on (bet_id, user_id) to prevent duplicate assignments

### Migration Steps

- [ ] Update [`src/lib/db/schema.ts`](../../../src/lib/db/schema.ts):
  - [ ] Add `visibility` column to bets table with default 'public'
  - [ ] Create `betAssignees` table with proper foreign keys
  - [ ] Add Drizzle relations for betAssignees
- [ ] Generate migration file using `pnpm db:generate`
- [ ] Apply migration using `pnpm db:migrate`
- [ ] Verify schema changes in database

### Database Schema Details

```typescript
// bets table addition
visibility: text("visibility", { enum: ["public", "private"] }).default("public").notNull(),

// bet_assignees table
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
    uniqueBetUser: uniqueIndex("unique_bet_user_assignee").on(table.betId, table.userId),
  })
);

// Add relations
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
```

### Notes

- When a bet is deleted, all assignee records should be cascade deleted
- When a user is deleted, their assignee records should be cascade deleted
- Default visibility is 'public' to maintain backward compatibility
- Private bets without assignees are only visible to admin
