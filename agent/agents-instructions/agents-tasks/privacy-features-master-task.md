# Privacy Features Master Task

## Overview

This master task coordinates multiple interconnected privacy-related features for the betting application. These features work together to provide privacy controls for bets.

## Related Task Files

1. [`home-landing-page.md`](./home-landing-page.md) - Create new public landing page
2. [`bet-visibility-schema.md`](./bet-visibility-schema.md) - Database schema changes for public/private bets
3. [`private-bets-api.md`](./private-bets-api.md) - API updates for private bets with assignees
4. [`admin-bet-visibility.md`](./admin-bet-visibility.md) - Admin dashboard updates for bet visibility
5. [`remove-public-scoreboard.md`](./remove-public-scoreboard.md) - Move scoreboard to admin-only

## Feature Requirements Summary

### 1. Home Page Redesign

- **Current**: Public dashboard showing all bets to everyone
- **New**: Landing page with 4 sections:
  - Auto-play image carousel with new stuff/CTA
  - Website features explanation
  - FAQ section for navigation help
  - Disclaimer in footer
- **Bets visibility**: Only authenticated users can see bets

### 2. Bet Visibility Types

- **Public bets**: All authenticated users can participate
- **Private bets**: Only assigned users can see and participate
- Users cannot see private bets unless assigned
- Admin can change assignees later

### 3. Scoreboard Privacy

- **Current**: Public leaderboard visible to everyone
- **New**: Admin-only dashboard feature
- Remove from public dashboard completely

### 4. Admin Controls

- Admin can create public or private bets
- Admin can assign/unassign users to private bets
- Admin can change bet visibility after creation
- Admin has full access control over all bets

## Implementation Order

1. Database schema changes (bet-visibility-schema.md)
2. API updates (private-bets-api.md)
3. Admin dashboard updates (admin-bet-visibility.md)
4. Remove public scoreboard (remove-public-scoreboard.md)
5. Create new home landing page (home-landing-page.md)

## Dependencies Between Tasks

- Task 1 (schema) must be done before Tasks 2, 3, 4
- Task 2 (API) must be done before Tasks 3, 4, 5
- Task 3 (admin) should be done before Task 5
- Task 4 (scoreboard) can be done independently after Task 2

## Testing Checklist

- [ ] Public bets visible to all authenticated users
- [ ] Private bets only visible to assigned users
- [ ] Non-assigned users cannot see private bets
- [ ] Admin can see all bets regardless of visibility
- [ ] Admin can change assignees on private bets
- [ ] Scoreboard only visible in admin dashboard
- [ ] Home page shows landing content, not bets
- [ ] Unauthenticated users redirected to login when accessing bets
