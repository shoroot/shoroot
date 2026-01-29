## Remove Public Scoreboard

**Description:** Remove the public leaderboard/scoreboard from the home page and make it admin-only.

**MD files to read before changes:**

- [`agent/dashboards/public-dashbaord.md`](../../dashboards/public-dashbaord.md)
- [`agent/dashboards/admin-dashboard.md`](../../dashboards/admin-dashboard.md)

### Changes Required

#### 1. Remove Leaderboard from Public Dashboard

- [ ] Update [`src/components/public-dashboard/component.tsx`](../../../src/components/public-dashboard/component.tsx):
  - [ ] Remove the "Leaderboard" tab
  - [ ] Remove stats fetching for leaderboard
  - [ ] Keep only basic info display if needed
- [ ] Remove or deprecate [`src/components/public-dashboard/leaderboard/`](../../../src/components/public-dashboard/leaderboard/) folder
- [ ] Remove or deprecate [`src/components/public-dashboard/stats-cards/`](../../../src/components/public-dashboard/stats-cards/) folder

#### 2. Keep Scoreboard in Admin Dashboard

- [ ] Verify [`src/components/admin-dashboard/stats-cards/`](../../../src/components/admin-dashboard/stats-cards/) already exists
- [ ] Add Leaderboard tab to admin dashboard in [`src/components/admin-dashboard/component.tsx`](../../../src/components/admin-dashboard/component.tsx)
- [ ] Create admin leaderboard component at [`src/components/admin-dashboard/leaderboard/`](../../../src/components/admin-dashboard/leaderboard/)
  - [ ] `component.tsx` - Full leaderboard display
  - [ ] `types.ts` - Type definitions
  - [ ] `index.ts` - Export

#### 3. Update Stats API

- [ ] Update [`src/app/api/stats/route.ts`](../../../src/app/api/stats/route.ts):
  - [ ] Remove public access to detailed leaderboard data
  - [ ] Keep basic stats public if needed
  - [ ] Require authentication for full leaderboard
  - [ ] Require admin role for detailed user breakdown

#### 4. Update User Bets Dashboard

- [ ] Verify [`src/components/user-bets-dashboard/`](../../../src/components/user-bets-dashboard/) doesn't expose other users' data
- [ ] User dashboard should only show personal stats

### Public Dashboard Changes

Current public dashboard has:

- "Available Bets" tab - REMOVE (bets should not be public)
- "Leaderboard" tab - REMOVE

New public dashboard (landing page):

- No tabs needed
- Just landing page content (carousel, features, FAQ, disclaimer)

### Admin Dashboard Additions

Add to existing admin dashboard:

- New "Leaderboard" tab alongside "Bets Management" and "Users Management"
- Show full stats cards
- Show complete leaderboard table
- Show top winners

### Files to Modify

- [ ] [`src/components/public-dashboard/component.tsx`](../../../src/components/public-dashboard/component.tsx) - Remove tabs, simplify
- [ ] [`src/app/api/stats/route.ts`](../../../src/app/api/stats/route.ts) - Add auth checks
- [ ] [`src/components/admin-dashboard/component.tsx`](../../../src/components/admin-dashboard/component.tsx) - Add leaderboard tab

### Files to Create

- [ ] [`src/components/admin-dashboard/leaderboard/component.tsx`](../../../src/components/admin-dashboard/leaderboard/component.tsx)
- [ ] [`src/components/admin-dashboard/leaderboard/types.ts`](../../../src/components/admin-dashboard/leaderboard/types.ts)
- [ ] [`src/components/admin-dashboard/leaderboard/index.ts`](../../../src/components/admin-dashboard/leaderboard/index.ts)

### Files to Remove/Deprecate

- [ ] [`src/components/public-dashboard/leaderboard/`](../../../src/components/public-dashboard/leaderboard/) - Move to admin
- [ ] [`src/components/public-dashboard/stats-cards/`](../../../src/components/public-dashboard/stats-cards/) - Remove
- [ ] [`src/components/public-dashboard/bets-grid/`](../../../src/components/public-dashboard/bets-grid/) - Remove (bets not public)

### API Authorization Update

```typescript
// In /api/stats/route.ts
export async function GET(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");

  // Basic stats can be public (total bets, etc)
  const basicStats = { ... };

  // Leaderboard requires authentication
  if (!token) {
    return NextResponse.json(basicStats);
  }

  // Full stats with user details requires admin
  const decoded = jwt.verify(token, process.env.JWT_SECRET!);

  if (decoded.role !== 'admin') {
    return NextResponse.json({
      ...basicStats,
      // Limited user stats
    });
  }

  // Full admin stats with complete leaderboard
  return NextResponse.json({
    ...basicStats,
    leaderboard: fullLeaderboard,
    topWinners: topWinners,
    userStats: detailedStats,
  });
}
```
