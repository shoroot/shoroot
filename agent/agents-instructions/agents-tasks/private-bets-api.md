## Private Bets API Updates

**Description:** Update backend APIs to support creating and querying private bets with user assignments.

**MD files to read before changes:**

- [`agent/backend-routes/admin-bet-create.md`](../../backend-routes/admin-bet-create.md)
- [`agent/backend-routes/bets-all.md`](../../backend-routes/bets-all.md)
- [`agent/backend-routes/bets-get.md`](../../backend-routes/bets-get.md)

### API Changes Required

#### 1. Update POST /api/bets/create

- [ ] Accept `visibility` field ('public' | 'private')
- [ ] Accept `assignees` array of user IDs (only when visibility is 'private')
- [ ] Validate that assignees exist in users table
- [ ] Create bet_assignees records for private bets
- [ ] Return visibility and assignees in response

#### 2. Update POST /api/bets/[id]/edit

- [ ] Allow changing `visibility` field
- [ ] Allow updating `assignees` array
- [ ] Handle adding/removing assignees
- [ ] Validate admin permissions

#### 3. Update GET /api/bets/all (admin)

- [ ] Include visibility field in response
- [ ] Include assignees list for private bets
- [ ] No filtering needed (admin sees all)

#### 4. Update GET /api/bets/user

- [ ] Filter bets based on visibility:
  - Public bets: visible to all authenticated users
  - Private bets: only visible if user is in assignees list
- [ ] Admin sees all bets regardless of visibility
- [ ] Include `isAssigned` flag for private bets

#### 5. Update GET /api/bets/[id]

- [ ] Check visibility before returning bet
- [ ] For private bets, verify user is assigned or is admin
- [ ] Return 403 if user not authorized to view

#### 6. Create POST /api/bets/[id]/assignees

- [ ] Add assignees to a private bet
- [ ] Validate admin permissions
- [ ] Validate users exist
- [ ] Prevent duplicate assignments

#### 7. Create POST /api/bets/[id]/remove-assignee

- [ ] Remove assignee from a private bet
- [ ] Validate admin permissions
- [ ] Prevent removing all assignees (at least one required?)

### Request/Response Examples

#### Create Private Bet

```json
// POST /api/bets/create
{
  "title": "Private Match Bet",
  "description": "Only for VIP users",
  "amount": 1000,
  "options": ["Team A", "Team B"],
  "visibility": "private",
  "assignees": [1, 5, 10]
}

// Response
{
  "bet": {
    "id": 123,
    "title": "Private Match Bet",
    "visibility": "private",
    "assignees": [
      { "userId": 1, "email": "user1@test.com" },
      { "userId": 5, "email": "user5@test.com" },
      { "userId": 10, "email": "user10@test.com" }
    ]
  }
}
```

#### Get User Bets (with visibility filtering)

```json
// GET /api/bets/user?tab=active
// For regular user - only sees public bets + assigned private bets
// For admin - sees all bets

// Response
{
  "bets": [
    {
      "id": 123,
      "title": "Public Bet",
      "visibility": "public",
      ...
    },
    {
      "id": 124,
      "title": "Private Bet",
      "visibility": "private",
      "isAssigned": true,
      ...
    }
  ]
}
```

### Files to Modify

- [ ] [`src/app/api/bets/create/route.ts`](../../../src/app/api/bets/create/route.ts)
- [ ] [`src/app/api/bets/[id]/edit/route.ts`](../../../src/app/api/bets/[id]/edit/route.ts)
- [ ] [`src/app/api/bets/all/route.ts`](../../../src/app/api/bets/all/route.ts)
- [ ] [`src/app/api/bets/user/route.ts`](../../../src/app/api/bets/user/route.ts)
- [ ] [`src/app/api/bets/[id]/route.ts`](../../../src/app/api/bets/[id]/route.ts)
- [ ] Create: [`src/app/api/bets/[id]/assignees/route.ts`](../../../src/app/api/bets/[id]/assignees/route.ts)
- [ ] Create: [`src/app/api/bets/[id]/remove-assignee/route.ts`](../../../src/app/api/bets/[id]/remove-assignee/route.ts)

### Authorization Logic

```typescript
// Helper function for bet visibility check
async function canViewBet(
  userId: number,
  userRole: string,
  betId: number,
): Promise<boolean> {
  if (userRole === "admin") return true;

  const bet = await db.select().from(bets).where(eq(bets.id, betId)).limit(1);
  if (!bet.length) return false;

  if (bet[0].visibility === "public") return true;

  // Check if user is assigned
  const assignment = await db
    .select()
    .from(betAssignees)
    .where(and(eq(betAssignees.betId, betId), eq(betAssignees.userId, userId)))
    .limit(1);

  return assignment.length > 0;
}
```
