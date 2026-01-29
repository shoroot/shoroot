## Admin Bet Visibility Management

**Description:** Update admin dashboard to support creating and managing public/private bets with assignees.

**MD files to read before changes:**

- [`agent/dashboards/admin-dashboard.md`](../../dashboards/admin-dashboard.md)
- [`agent/components/bet-card.md`](../../components/bet-card.md)

### Admin Dashboard Changes

#### 1. Update Bet Creation Modal

- [ ] Add visibility toggle (Public/Private) in [`bet-modal/component.tsx`](../../../src/components/admin-dashboard/bet-modal/component.tsx)
- [ ] When Private selected, show user selection dropdown
- [ ] Allow searching and selecting multiple users as assignees
- [ ] Show selected assignees as removable tags/chips
- [ ] Validate at least one assignee for private bets

#### 2. Update Bet Edit Modal

- [ ] Allow changing visibility after creation
- [ ] Allow modifying assignees list
- [ ] Show warning when changing from private to public
- [ ] Handle adding/removing assignees

#### 3. Update Bets Table

- [ ] Add visibility column with badge (Public/Private)
- [ ] Add assignees count column for private bets
- [ ] Add filter for visibility type
- [ ] Show lock icon for private bets

#### 4. Create Assignees Management Modal

- [ ] Create new component: [`assignees-modal/`](../../../src/components/admin-dashboard/assignees-modal/)
  - [ ] `component.tsx` - Manage assignees UI
  - [ ] `types.ts` - Type definitions
  - [ ] `index.ts` - Export
- [ ] Show all current assignees with remove button
- [ ] Search and add new assignees
- [ ] Bulk add/remove functionality

#### 5. Update Bet Types

- [ ] Add visibility and assignees to [`types.ts`](../../../src/components/admin-dashboard/types.ts)

### UI Components Needed

#### Visibility Toggle

```typescript
// Radio or segmented control for Public/Private
<VisibilityToggle
  value={visibility}
  onChange={setVisibility}
/>
```

#### User Selector for Assignees

```typescript
// Multi-select dropdown with search
<AssigneeSelector
  availableUsers={users}
  selectedUsers={assignees}
  onChange={setAssignees}
/>
```

#### Assignees Display

```typescript
// Show assignees as chips/tags
<AssigneeChips
  assignees={assignees}
  onRemove={(userId) => removeAssignee(userId)}
/>
```

### Files to Modify

- [ ] [`src/components/admin-dashboard/types.ts`](../../../src/components/admin-dashboard/types.ts)
- [ ] [`src/components/admin-dashboard/bet-modal/component.tsx`](../../../src/components/admin-dashboard/bet-modal/component.tsx)
- [ ] [`src/components/admin-dashboard/bets-table/component.tsx`](../../../src/components/admin-dashboard/bets-table/component.tsx)
- [ ] [`src/components/admin-dashboard/component.tsx`](../../../src/components/admin-dashboard/component.tsx)

### Files to Create

- [ ] [`src/components/admin-dashboard/assignees-modal/component.tsx`](../../../src/components/admin-dashboard/assignees-modal/component.tsx)
- [ ] [`src/components/admin-dashboard/assignees-modal/types.ts`](../../../src/components/admin-dashboard/assignees-modal/types.ts)
- [ ] [`src/components/admin-dashboard/assignees-modal/index.ts`](../../../src/components/admin-dashboard/assignees-modal/index.ts)

### TypeScript Types

```typescript
// Add to types.ts
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
  assignees?: Assignee[]; // Only for private bets
  createdAt: Date;
  updatedAt: Date;
}

export interface Assignee {
  userId: number;
  email: string;
  fullName?: string;
  assignedAt: Date;
}

export interface CreateBetData {
  title: string;
  description: string;
  amount: number;
  options: string[];
  visibility: "public" | "private";
  assignees?: number[]; // User IDs
}

export interface UpdateBetData {
  title?: string;
  description?: string;
  amount?: number;
  options?: string[];
  visibility?: "public" | "private";
  assignees?: number[];
}
```

### Table Columns Update

```typescript
// Bets table should show:
const columns = [
  { key: 'id', label: 'ID' },
  { key: 'title', label: 'Title' },
  { key: 'visibility', label: 'Visibility', render: (bet) => (
    <Badge variant={bet.visibility === 'public' ? 'default' : 'secondary'}>
      {bet.visibility === 'public' ? '🔓 Public' : '🔒 Private'}
    </Badge>
  )},
  { key: 'assignees', label: 'Assignees', render: (bet) => (
    bet.visibility === 'private' ? `${bet.assignees?.length || 0} users` : '-'
  )},
  { key: 'status', label: 'Status' },
  { key: 'amount', label: 'Amount' },
  { key: 'actions', label: 'Actions' },
];
```
