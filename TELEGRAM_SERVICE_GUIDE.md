# Telegram Service Implementation Guide

## Overview

The Telegram service has been fully integrated into the ShorOOt betting application. It automatically sends notifications to a configured Telegram channel whenever:

1. **A new bet is created** - Includes bet title, description, amount, and options
2. **A bet status changes** - Notifies when bet moves to "in-progress" or "resolved" status
3. **Resolved bets** - Can optionally include screenshots of the bet details page

## Setup Instructions

### 1. Create a Telegram Bot

1. Open Telegram and search for **@BotFather**
2. Send the command `/newbot`
3. Follow the prompts to create a new bot
4. Copy the **Bot Token** provided (format: `123456789:ABCdefGHIjklMNOpqrsTUVwxyzABCDeFG`)

### 2. Get Your Chat ID

1. Create a Telegram channel where you want bet notifications
2. Add your bot to the channel as an admin
3. Use this command to get the chat ID:

```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates"
```

Or send a message to the channel and run the above command, then look for the `chat` object to find your `id`.

The chat ID format is usually: `-100123456789` (for channels)

### 3. Configure Environment Variables

Add these variables to your `.env.local` file:

```env
TELEGRAM_BOT_TOKEN=your-bot-token-here
TELEGRAM_CHAT_ID=your-chat-id-here

# Optional: For screenshot functionality
SCREENSHOT_SERVICE=none|html2image|puppeteer
HTML2IMAGE_API_KEY=your-api-key-here  # if using html2image service
```

## Features

### 1. Text Message Notifications

#### Bet Creation Message Format:
```
🎲 New Bet Created!

Bet #[ID]
Title: [Title]
Description: [Description]
Amount: [Amount] تومان

Options:
  1. [Option 1]
  2. [Option 2]
  ...

Bet on a bet and if you lose, you lose the bet.
```

#### Bet Status Change Message Format:
```
[Status Emoji] [Status Text]

Bet #[ID]
Title: [Title]
Participants: [Count]

Bet on a bet and if you lose, you lose the bet.
```

### 2. Screenshot Support (Optional)

The service supports taking screenshots of resolved bets. There are three options:

#### Option A: No Screenshots (Default)
```env
SCREENSHOT_SERVICE=none
```
Only text notifications are sent.

#### Option B: HTML to Image API
```env
SCREENSHOT_SERVICE=html2image
HTML2IMAGE_API_KEY=your-api-key-here
```

Uses html2image.io service to capture the bet details page.

#### Option C: Puppeteer (Self-Hosted)
```env
SCREENSHOT_SERVICE=puppeteer
```

Install Puppeteer:
```bash
npm install puppeteer
```

## API Reference

### Core Functions

#### `sendTelegramMessage(message: string): Promise<void>`
Sends a text message to the configured Telegram channel.

**Parameters:**
- `message` (string): The message to send (supports HTML formatting)

**Example:**
```typescript
import { sendTelegramMessage } from "@/lib/telegram";

await sendTelegramMessage("Hello from ShorOOt!");
```

#### `sendTelegramPhoto(photoUrl: string, caption: string): Promise<void>`
Sends a photo to the Telegram channel with a caption.

**Parameters:**
- `photoUrl` (string): URL or base64 encoded image
- `caption` (string): Caption for the photo (supports HTML formatting)

**Example:**
```typescript
import { sendTelegramPhoto } from "@/lib/telegram";

await sendTelegramPhoto(
  "https://example.com/image.png",
  "<b>Bet Details</b>\n..."
);
```

#### `notifyBetCreation(betData): Promise<void>`
Sends a formatted notification for a newly created bet.

**Parameters:**
```typescript
{
  id: number;
  title: string;
  description: string;
  amount: number;
  options: string[];
}
```

#### `notifyBetStatusChange(betData): Promise<void>`
Sends a formatted notification for a bet status change.

**Parameters:**
```typescript
{
  id: number;
  title: string;
  status: "active" | "in-progress" | "resolved";
  winningOption?: string;
  participationCount?: number;
}
```

#### `notifyBetResolvedWithScreenshot(screenshotUrl, betData): Promise<void>`
Sends a screenshot of the resolved bet with caption.

**Parameters:**
- `screenshotUrl` (string): URL or base64 of the screenshot
- `betData` (object): Bet details object

## Integration Points

### 1. Bet Creation Route
**File:** `src/app/api/bets/create/route.ts`

Automatically sends notification when a new bet is created.

```typescript
// Already integrated!
import { notifyBetCreation } from "@/lib/telegram";

// Called after bet is created:
notifyBetCreation({
  id: result.bet.id,
  title: result.bet.title,
  description: result.bet.description,
  amount: result.bet.amount,
  options: result.options.map((opt) => opt.optionText),
});
```

### 2. Bet Status Update Route
**File:** `src/app/api/bets/[id]/status/route.ts`

Automatically sends notification when bet status changes.

```typescript
// Already integrated!
import { notifyBetStatusChange } from "@/lib/telegram";

// Called after status is updated:
notifyBetStatusChange({
  id: updatedBet.id,
  title: updatedBet.title,
  status: updatedBet.status,
  winningOption: updatedBet.winningOption,
  participationCount: participationCount,
});
```

## Error Handling

The Telegram service is designed to be **non-blocking**:

- If Telegram credentials are not configured, it logs a warning but doesn't crash
- If the API request fails, it logs the error and continues app execution
- This ensures the betting app works even if Telegram notifications fail

Example error handling:
```typescript
try {
  await sendTelegramMessage("Bet created!");
} catch (error) {
  console.error("Telegram error:", error);
  // App continues to work normally
}
```

## HTML Formatting Support

Telegram messages support HTML formatting:

| Tag | Effect |
|-----|--------|
| `<b>text</b>` | **Bold** |
| `<i>text</i>` | *Italic* |
| `<u>text</u>` | <u>Underline</u> |
| `<s>text</s>` | ~~Strikethrough~~ |
| `<code>text</code>` | Monospace |
| `<a href="url">text</a>` | Hyperlink |

## Usage Examples

### Example 1: Manual Message Sending

```typescript
// In any API route or server function
import { sendTelegramMessage } from "@/lib/telegram";

await sendTelegramMessage(
  "<b>🎲 Attention:</b> New featured bet available!"
);
```

### Example 2: Custom Notifications

```typescript
import { formatBetStatusMessage, sendTelegramMessage } from "@/lib/telegram";

const customMessage = formatBetStatusMessage({
  id: 42,
  title: "Football Match Winner",
  status: "resolved",
  winningOption: "Team A Wins",
  participationCount: 15,
});

await sendTelegramMessage(customMessage);
```

### Example 3: Monitoring with Screenshots

```typescript
import { notifyBetResolvedWithScreenshot } from "@/lib/telegram";

// After getting screenshot URL
await notifyBetResolvedWithScreenshot(
  "https://cloudinary.com/screenshot.jpg",
  {
    id: 42,
    title: "Football Match",
    status: "resolved",
    winningOption: "Team A",
    participationCount: 15,
  }
);
```

## Troubleshooting

### Issue: "Telegram configuration missing"
**Solution:** Ensure `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are set in `.env.local`

### Issue: "Chat not found" Error
**Possible causes:**
- Invalid chat ID format
- Bot is not added to the channel
- Bot doesn't have permission to post messages

**Solution:** 
1. Verify chat ID with the curl command mentioned above
2. Add bot to channel and grant admin permissions
3. Test with `/sendMessage` API directly

### Issue: Messages not being sent
**Solution:**
1. Check that the bot token is correct
2. Verify internet connectivity
3. Check application logs for error messages
4. Ensure bot is not rate-limited by Telegram

### Issue: Special characters not displaying correctly
**Solution:** Make sure to use proper HTML escaping for special characters. The `escapeHtml()` function handles this automatically.

## Production Checklist

- [ ] Bot token is stored in environment variables (not hardcoded)
- [ ] Chat ID is configured correctly
- [ ] Error logs are monitored (notifications won't block app)
- [ ] Bot has necessary permissions in the channel
- [ ] Screenshots service is optional and configured (or disabled)
- [ ] Test notifications are working before deploying
- [ ] Rate limiting is considered if high volume of bets

## Production Readiness

✅ **The service is production-ready with:**

1. **Robust Error Handling** - Failures don't affect the betting application
2. **No External Dependencies** - Uses only the Telegram Bot API
3. **Configurable** - Works with or without screenshots
4. **Scalable** - Can handle high volume of notifications
5. **Type Safe** - Full TypeScript support
6. **HTML Formatting** - Professional looking messages
7. **Proper Logging** - Tracks all operations and errors

## Future Enhancements

Possible improvements:

1. **Message Queue** - Queue notifications if Telegram is temporarily unavailable
2. **Rich Media** - Include graphs showing bet statistics
3. **User Mentions** - Tag relevant users in notifications
4. **Webhook** - Listen for Telegram messages to trigger actions
5. **Multi-Language** - Support for multiple languages
6. **Custom Themes** - Different notification styles
7. **Analytics** - Track which notifications get reactions

## Support

For issues or questions:
1. Check the Telegram Bot API documentation: https://core.telegram.org/bots/api
2. Review application logs: `npm run dev` and check console output
3. Test bot token with curl: `curl "https://api.telegram.org/bot<TOKEN>/getMe"`
