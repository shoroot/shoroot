# Telegram Service - Quick Start Guide

## 5-Minute Setup

### Step 1: Create a Bot (2 minutes)
1. Open Telegram → Search for `@BotFather`
2. Send `/newbot`
3. Choose a name (e.g., "ShorOot Bet Bot")
4. Choose a username (e.g., "shoroot_bet_bot")
5. Copy the **Bot Token** (you'll need this)

### Step 2: Create a Channel & Get Chat ID (2 minutes)
1. Create a new Telegram channel (or use existing)
2. Add your bot as admin to the channel
3. Run this command to get chat ID:
```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates"
```
4. Look for `"chat":{"id":-123456789}` (or send a message to the channel first, then run the command)

### Step 3: Configure (.env.local)
```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyzABCDeFG
TELEGRAM_CHAT_ID=-100123456789
```

**Done!** Notifications will be sent automatically.

---

## Testing

### Test It
1. Start the app: `npm run dev`
2. Create a bet via the admin dashboard
3. Check your Telegram channel - notification should appear!

### Manual Test
Add this to any API route and call it:
```typescript
import { sendTelegramMessage } from "@/lib/telegram";
await sendTelegramMessage("<b>Test from ShorOot!</b>");
```

---

## What Happens

✅ **When a bet is created:**
- Telegram notification with bet details and options

✅ **When a bet status changes:**
- Notification when moved to "in-progress"
- Notification when "resolved" with winner

✅ **If Telegram is down:**
- App continues working normally
- Error is logged, notification is skipped

---

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "Telegram configuration missing" | Add bot token and chat ID to .env.local |
| Messages not appearing | Verify bot is added as admin to channel |
| "Chat not found" error | Double-check chat ID format (-100...) |
| Nothing happens | Restart dev server: `npm run dev` |

---

## Optional: Add Screenshots

For screenshots of resolved bets:

### Option A: HTML2Image (Easiest)
```env
SCREENSHOT_SERVICE=html2image
HTML2IMAGE_API_KEY=your-key-from-hcti.io
```

### Option B: Puppeteer (Self-hosted)
```bash
npm install puppeteer
```
```env
SCREENSHOT_SERVICE=puppeteer
```

---

## File Locations

- Service: `src/lib/telegram.ts`
- Screenshots: `src/lib/screenshot.ts`
- Integration: `src/app/api/bets/create/route.ts` & `status/route.ts`
- Guide: `TELEGRAM_SERVICE_GUIDE.md`
- Summary: `IMPLEMENTATION_SUMMARY.md`

---

## Need Help?

1. Read `TELEGRAM_SERVICE_GUIDE.md` for detailed documentation
2. Check `IMPLEMENTATION_SUMMARY.md` for what was implemented
3. Review console logs: `npm run dev` and watch for errors
4. Test bot token: 
```bash
curl "https://api.telegram.org/bot<TOKEN>/getMe"
```

---

**That's it!** Your betting app now has Telegram notifications. 🎉
