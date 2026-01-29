## User Status Management (Pending & Deactivated)

**Description:** Add user status management with pending approval and deactivated states. New users start as pending and require admin approval. Deactivated users are soft-deleted and cannot perform any actions.

**MD files to read before changes:**

- [`agent/database/db-schema.md`](../../database/db-schema.md)
- [`agent/authAndRoles/users-roles.md`](../../authAndRoles/users-roles.md)
- [`agent/dashboards/admin-dashboard.md`](../../dashboards/admin-dashboard.md)

### Database Schema Changes

#### 1. Update `users` table

Add status column to users table:

- `status`: text, enum: 'pending', 'active', 'deactivated', default 'pending'

```typescript
// In src/lib/db/schema.ts
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "user"] }).notNull(),
  status: text("status", { enum: ["pending", "active", "deactivated"] })
    .default("pending")
    .notNull(),
  hasAcceptedTerms: boolean("has_accepted_terms").default(false).notNull(),
  acceptedTermsAt: timestamp("accepted_terms_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

### User Status Flow

```
Signup → Pending → Admin Approval → Active
                    ↓
              Deactivated (soft delete)
```

### API Changes Required

#### 1. Update POST /api/auth/signup

- [ ] Set default status to 'pending' for new users
- [ ] Return message indicating account is pending approval
- [ ] Do not generate token for pending users (or generate limited token)

#### 2. Update POST /api/auth/login

- [ ] Check user status before allowing login
- [ ] For 'pending' users: return 403 with "account pending approval" message
- [ ] For 'deactivated' users: return 403 with "account suspended" message
- [ ] Only allow login for 'active' users

#### 3. Create POST /api/users/[id]/approve

- [ ] Admin-only endpoint to approve pending users
- [ ] Change status from 'pending' to 'active'
- [ ] Send notification to user about approval

#### 4. Create POST /api/users/[id]/deactivate

- [ ] Admin-only endpoint to deactivate users
- [ ] Change status from 'active' to 'deactivated'
- [ ] Soft delete - keep all data but prevent actions

#### 5. Create POST /api/users/[id]/reactivate

- [ ] Admin-only endpoint to reactivate deactivated users
- [ ] Change status from 'deactivated' to 'active'

#### 6. Update All Protected API Routes

Add status checks to all user action endpoints:

- [ ] POST /api/bets/[id]/participate - Block pending/deactivated users
- [ ] POST /api/bets/[id]/change-option - Block pending/deactivated users
- [ ] POST /api/users/change-password - Block pending/deactivated users
- [ ] All other user action endpoints

### Frontend Changes

#### 1. Create Pending Status Page

- [ ] Create [`src/app/pending/page.tsx`](../../../src/app/pending/page.tsx)
- [ ] Show "Your account is pending approval" message
- [ ] Display contact admin information
- [ ] No navigation options except logout
- [ ] Auto-redirect pending users to this page on login attempt

```typescript
// Pending page content
export default function PendingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card>
        <CardHeader>
          <CardTitle>⏳ Account Pending Approval</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Your account is currently pending admin approval.</p>
          <p>You will be able to access the platform once approved.</p>
          <p className="mt-4 text-sm text-muted-foreground">
            If you believe this is a mistake, please contact the admin.
          </p>
          <Button onClick={logout}>Logout</Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### 2. Create Deactivated Status Page

- [ ] Create [`src/app/suspended/page.tsx`](../../../src/app/suspended/page.tsx)
- [ ] Show "Your account has been suspended" message
- [ ] Display contact admin information
- [ ] No navigation options except logout

```typescript
// Suspended page content
export default function SuspendedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card>
        <CardHeader>
          <CardTitle>🚫 Account Suspended</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Your account has been suspended.</p>
          <p>You cannot access the platform at this time.</p>
          <p className="mt-4 text-sm text-muted-foreground">
            If you believe this is a mistake, please contact the admin.
          </p>
          <Button onClick={logout}>Logout</Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### 3. Update Auth Provider/Hook

- [ ] Check user status after login
- [ ] Redirect pending users to /pending
- [ ] Redirect deactivated users to /suspended
- [ ] Only allow active users to access dashboard

#### 4. Update Admin Dashboard

- [ ] Add "Pending Users" tab or section
- [ ] Show users table with status column
- [ ] Add approve button for pending users
- [ ] Add deactivate/reactivate buttons
- [ ] Add status filter (All, Pending, Active, Deactivated)

```typescript
// Admin users table columns
const columns = [
  { key: 'id', label: 'ID' },
  { key: 'email', label: 'Email' },
  { key: 'fullName', label: 'Name' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status', render: (user) => (
    <Badge variant={
      user.status === 'active' ? 'default' :
      user.status === 'pending' ? 'secondary' : 'destructive'
    }>
      {user.status}
    </Badge>
  )},
  { key: 'createdAt', label: 'Created' },
  { key: 'actions', label: 'Actions' },
];
```

#### 5. Update User Modal

- [ ] Add status dropdown in create/edit user forms
- [ ] Allow admin to set initial status
- [ ] Show status change warnings

### Middleware Updates

- [ ] Update [`src/middleware.ts`](../../../src/middleware.ts) to check user status
- [ ] Block API access for pending/deactivated users
- [ ] Redirect to appropriate status page

### Files to Modify

#### Database

- [ ] [`src/lib/db/schema.ts`](../../../src/lib/db/schema.ts) - Add status column

#### API Routes

- [ ] [`src/app/api/auth/signup/route.ts`](../../../src/app/api/auth/signup/route.ts)
- [ ] [`src/app/api/auth/login/route.ts`](../../../src/app/api/auth/login/route.ts)
- [ ] [`src/app/api/bets/[id]/participate/route.ts`](../../../src/app/api/bets/[id]/participate/route.ts)
- [ ] [`src/app/api/bets/[id]/change-option/route.ts`](../../../src/app/api/bets/[id]/change-option/route.ts)
- [ ] [`src/app/api/users/change-password/route.ts`](../../../src/app/api/users/change-password/route.ts)
- [ ] Create: [`src/app/api/users/[id]/approve/route.ts`](../../../src/app/api/users/[id]/approve/route.ts)
- [ ] Create: [`src/app/api/users/[id]/deactivate/route.ts`](../../../src/app/api/users/[id]/deactivate/route.ts)
- [ ] Create: [`src/app/api/users/[id]/reactivate/route.ts`](../../../src/app/api/users/[id]/reactivate/route.ts)

#### Frontend Pages

- [ ] Create: [`src/app/pending/page.tsx`](../../../src/app/pending/page.tsx)
- [ ] Create: [`src/app/suspended/page.tsx`](../../../src/app/suspended/page.tsx)

#### Components

- [ ] [`src/components/admin-dashboard/types.ts`](../../../src/components/admin-dashboard/types.ts) - Add status type
- [ ] [`src/components/admin-dashboard/users-table/component.tsx`](../../../src/components/admin-dashboard/users-table/component.tsx) - Add status column and actions
- [ ] [`src/components/admin-dashboard/user-modal/component.tsx`](../../../src/components/admin-dashboard/user-modal/component.tsx) - Add status field
- [ ] [`src/components/admin-dashboard/component.tsx`](../../../src/components/admin-dashboard/component.tsx) - Add pending users section
- [ ] [`src/hooks/use-auth.ts`](../../../src/hooks/use-auth.ts) - Add status checks

#### Middleware

- [ ] [`src/middleware.ts`](../../../src/middleware.ts) - Add status verification

### Status Check Helper Function

```typescript
// Helper to check if user can perform actions
export function canUserAct(userStatus: string): boolean {
  return userStatus === "active";
}

// Helper to get status message
export function getStatusMessage(status: string): string {
  switch (status) {
    case "pending":
      return "Your account is pending approval. Please contact admin.";
    case "deactivated":
      return "Your account has been suspended. Please contact admin.";
    default:
      return "";
  }
}
```

### Migration Steps

1. Generate migration: `pnpm db:generate`
2. Apply migration: `pnpm db:migrate`
3. Update existing users: Set all existing users to 'active' status
4. Verify changes in database

### Notes

- Admin users should always be 'active' by default
- Deactivated users retain all data (bets, participations) but cannot act
- Pending users cannot see any bets or place any bets
- All user actions must check status before proceeding
- Consider adding email notifications for status changes
