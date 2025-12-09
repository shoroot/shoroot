# Telegram Service - Code Implementation Reference

## Quick Reference: Where Everything Is

### Core Service Files
```
src/lib/
├── telegram.ts          ← Main Telegram service
├── screenshot.ts        ← Screenshot generation
```

### Integration Points
```
src/app/api/bets/
├── create/
│   └── route.ts        ← Sends notification on bet creation
└── [id]/
    └── status/
        └── route.ts    ← Sends notification on status change
```

### Configuration
```
.env.example            ← Template with TELEGRAM_BOT_TOKEN & TELEGRAM_CHAT_ID
```

### Documentation
```
├── TELEGRAM_SERVICE_GUIDE.md          ← Comprehensive guide
├── TELEGRAM_QUICK_START.md            ← 5-minute setup
├── IMPLEMENTATION_SUMMARY.md          ← Overview
└── TELEGRAM_IMPLEMENTATION_CHECKLIST.md ← This checklist
```

---

## Code Examples

### Example 1: Sending a Simple Message

```typescript
import { sendTelegramMessage } from "@/lib/telegram";

// Send text message
await sendTelegramMessage(
  "<b>🎲 New Bet Available!</b>\n" +
  "Join the betting action now."
);
```

### Example 2: Sending a Photo with Caption

```typescript
import { sendTelegramPhoto } from "@/lib/telegram";

const caption = "<b>Bet Details</b>\nBet #123\nWinner: Team A";
await sendTelegramPhoto(
  "https://example.com/screenshot.png",
  caption
);
```

### Example 3: Notify About New Bet

```typescript
import { notifyBetCreation } from "@/lib/telegram";

await notifyBetCreation({
  id: 123,
  title: "World Cup Winner",
  description: "Who will win the 2026 World Cup?",
  amount: 50000,
  options: ["France", "Brazil", "Argentina"],
});
```

Output Message:
```
🎲 New Bet Created!

Bet #123
Title: World Cup Winner
Description: Who will win the 2026 World Cup?
Amount: 50,000 تومان

Options:
  1. France
  2. Brazil
  3. Argentina

Bet on a bet and if you lose, you lose the bet.
```

### Example 4: Notify About Status Change

```typescript
import { notifyBetStatusChange } from "@/lib/telegram";

// Bet moved to in-progress
await notifyBetStatusChange({
  id: 123,
  title: "World Cup Winner",
  status: "in-progress",
  participationCount: 42,
});

// Bet resolved
await notifyBetStatusChange({
  id: 123,
  title: "World Cup Winner",
  status: "resolved",
  winningOption: "Argentina",
  participationCount: 42,
});
```

Output Messages:
```
In-Progress:
🔄 Bet is now in progress!

Bet #123
Title: World Cup Winner
Participants: 42

Bet on a bet and if you lose, you lose the bet.

---

Resolved:
✅ Bet has been resolved! Winner: Argentina

Bet #123
Title: World Cup Winner
Participants: 42

Bet on a bet and if you lose, you lose the bet.
```

### Example 5: Using Screenshots

```typescript
import { 
  generateBetScreenshot,
  generateBetSummaryForTelegram 
} from "@/lib/screenshot";
import { 
  notifyBetResolvedWithScreenshot 
} from "@/lib/telegram";

// Generate screenshot (if configured)
const screenshotUrl = await generateBetScreenshot(123, betDetails);

if (screenshotUrl) {
  // Send with screenshot
  await notifyBetResolvedWithScreenshot(
    screenshotUrl,
    {
      id: 123,
      title: "World Cup Winner",
      status: "resolved",
      winningOption: "Argentina",
      participationCount: 42,
    }
  );
} else {
  // Fallback to text summary
  const summary = generateBetSummaryForTelegram(betDetails);
  await sendTelegramMessage(summary);
}
```

---

## API Route Integration

### In Create Route (`src/app/api/bets/create/route.ts`)

```typescript
// At the top
import { notifyBetCreation } from "@/lib/telegram";

// After creating bet in database
const result = await db.transaction(async (tx) => {
  const [newBet] = await tx.insert(bets).values({ ... }).returning();
  const newOptions = await tx.insert(betOptions).values(...).returning();
  return { bet: newBet, options: newOptions };
});

// Send notification
notifyBetCreation({
  id: result.bet.id,
  title: result.bet.title,
  description: result.bet.description,
  amount: result.bet.amount,
  options: result.options.map((opt) => opt.optionText),
});

// Return response (no waiting for notification)
return NextResponse.json({ bet: {...} }, { status: 201 });
```

### In Status Route (`src/app/api/bets/[id]/status/route.ts`)

```typescript
// At the top
import { notifyBetStatusChange } from "@/lib/telegram";

// After updating status
await db.update(bets)
  .set({ status: status, ... })
  .where(eq(bets.id, betId));

// Get participation count
const [participationResult] = await db
  .select({ count: count() })
  .from(betParticipations)
  .where(eq(betParticipations.betId, betId));

const participationCount = participationResult?.count || 0;

// Send notification
notifyBetStatusChange({
  id: updatedBet.id,
  title: updatedBet.title,
  status: updatedBet.status as "active" | "in-progress" | "resolved",
  winningOption: updatedBet.winningOption,
  participationCount: participationCount,
});

// Return response
return NextResponse.json({
  message: "Bet status updated successfully",
  bet: formattedBet,
});
```

---

## Environment Configuration

### Minimum Configuration (.env.local)

```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyzABCDeFG
TELEGRAM_CHAT_ID=-100123456789
```

### Full Configuration (with screenshots)

```env
# Telegram
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyzABCDeFG
TELEGRAM_CHAT_ID=-100123456789

# Screenshots - Choose one:
# Option 1: HTML2Image (requires API key)
SCREENSHOT_SERVICE=html2image
HTML2IMAGE_API_KEY=your-api-key-here

# Option 2: Puppeteer (requires npm install puppeteer)
# SCREENSHOT_SERVICE=puppeteer

# Option 3: Disabled (text only)
# SCREENSHOT_SERVICE=none
```

---

## Type Definitions

### Bet Creation Data

```typescript
interface BetCreationData {
  id: number;
  title: string;
  description: string;
  amount: number;
  options: string[];
}
```

### Bet Status Change Data

```typescript
interface BetStatusChangeData {
  id: number;
  title: string;
  status: "active" | "in-progress" | "resolved";
  winningOption?: string;
  participationCount?: number;
}
```

### Bet Details for Screenshot

```typescript
interface BetDetailsForScreenshot {
  id: number;
  title: string;
  description: string;
  amount: number;
  status: "active" | "in-progress" | "resolved";
  winningOption?: string | null;
  options: Array<{ id: number; optionText: string }>;
  participants: Array<{
    userEmail: string;
    userFullName?: string;
    selectedOptionText?: string | null;
    isWinner?: boolean;
  }>;
  participationCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Error Handling

### Automatic Error Handling

All functions in the Telegram service include built-in error handling:

```typescript
try {
  // Send message
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const response = await fetch(url, { ... });
  
  if (!response.ok) {
    const error = await response.json();
    console.error("Telegram API error:", error);
    throw new Error(`Failed to send: ${error.description}`);
  }
} catch (error) {
  console.error("Error sending Telegram message:", error);
  // Don't throw - app continues normally
}
```

### Key Error Scenarios Handled

1. **Missing Configuration**
   - Logs warning if TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set
   - Gracefully continues without sending notification

2. **API Errors**
   - Catches and logs Telegram API errors
   - Doesn't crash the application

3. **Network Errors**
   - Handles fetch failures gracefully
   - Logs error and continues

4. **Invalid Data**
   - Escapes HTML special characters
   - Validates input data

---

## Testing the Implementation

### 1. Unit Test Example

```typescript
import { formatBetCreationMessage } from "@/lib/telegram";

const message = formatBetCreationMessage({
  id: 1,
  title: "Test Bet",
  description: "This is a test",
  amount: 1000,
  options: ["Option A", "Option B"],
});

console.log(message);
// Output: HTML formatted message with emojis and bold text
```

### 2. Integration Test Example

```typescript
// Send request to create bet API
const response = await fetch("/api/bets/create", {
  method: "POST",
  headers: {
    "Authorization": "Bearer your-token",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    title: "Test Bet",
    description: "Testing Telegram integration",
    amount: 5000,
    options: ["Yes", "No"],
  }),
});

// Check response
if (response.status === 201) {
  console.log("Bet created successfully");
  // Check Telegram channel for notification
}
```

### 3. Manual Testing

```bash
# Test Telegram configuration
curl "https://api.telegram.org/bot<YOUR_TOKEN>/getMe"

# If successful, you'll see:
# {"ok":true,"result":{"id":123456789,"is_bot":true,"first_name":"ShorOot Bot",...}}
```

---

## Performance Considerations

1. **Async & Non-Blocking**
   - Notifications sent asynchronously
   - API response doesn't wait for Telegram
   - Network delay doesn't affect user experience

2. **Single HTTP Request**
   - One request per notification
   - Minimal overhead (~100ms typically)

3. **Scalability**
   - Can handle thousands of notifications per hour
   - Telegram API rate limits: ~30 messages/second per chat

4. **Screenshot Performance**
   - Screenshots are optional
   - HTML2Image API: ~2-5 seconds per screenshot
   - Puppeteer: ~3-8 seconds per screenshot
   - Fallback to text if too slow

---

## Monitoring & Logging

### Logs to Check

```bash
npm run dev

# Look for:
# ✅ "Telegram message sent successfully"
# ⚠️ "Telegram configuration missing"
# ❌ "Error sending Telegram message"
```

### Production Monitoring

```typescript
// Logs are sent to console.error and console.log
// In production, integrate with your logging service:
// - Sentry
// - LogRocket
// - Datadog
// - CloudWatch
```

---

## Summary

The Telegram service implementation provides:

✅ **Automatic notifications** on bet creation and status changes
✅ **HTML formatted messages** with emojis and styling
✅ **Optional screenshots** of resolved bets
✅ **Non-blocking design** with graceful error handling
✅ **Production-ready** code with comprehensive logging
✅ **Type-safe** TypeScript implementation
✅ **Easy to use** - Just add environment variables

**Next Steps:**
1. Read `TELEGRAM_QUICK_START.md` for setup
2. Add environment variables to `.env.local`
3. Test by creating a bet
4. Check Telegram channel for notification
5. Refer to `TELEGRAM_SERVICE_GUIDE.md` for advanced features
