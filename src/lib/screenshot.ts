/**
 * Screenshot Service
 * Handles taking screenshots of bet details pages for resolved bets
 * Can work with Playwright or other headless browser solutions
 */

// Type declarations to avoid strict mode issues
declare const process: any;

/**
 * Generate a screenshot URL for a bet details page
 * This creates a temporary screenshot that can be uploaded to Telegram
 *
 * Note: In production, you might want to use:
 * - Puppeteer/Playwright for server-side screenshots
 * - Screenshot API services (e.g., html2image, screenshot.cloud)
 * - Cloudinary or similar image hosting
 *
 * For now, we'll provide a utility function that formats data for potential screenshots
 */

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

/**
 * Generate a screenshot of a bet details page
 * This requires a screenshot service to be configured
 *
 * Available options:
 * 1. Use Puppeteer/Playwright (self-hosted)
 * 2. Use external screenshot API (html2image, screenshot.cloud, etc.)
 * 3. Generate an HTML string and convert to image
 */
export async function generateBetScreenshot(
  betId: number,
  betDetails: BetDetailsForScreenshot
): Promise<string | null> {
  try {
    // Check if screenshot service is configured
    const screenshotService = process.env.SCREENSHOT_SERVICE;

    if (screenshotService === "none" || !screenshotService) {
      console.warn(
        "Screenshot service not configured. Skipping screenshot generation."
      );
      return null;
    }

    // Build the URL for the bet details page
    const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const detailsPageUrl = `${appUrl}/dashboard/bets/${betId}`;

    if (screenshotService === "html2image") {
      return await screenshotWithHtml2Image(detailsPageUrl);
    }

    if (screenshotService === "puppeteer") {
      return await screenshotWithPuppeteer(detailsPageUrl);
    }

    console.warn(`Unknown screenshot service: ${screenshotService}`);
    return null;
  } catch (error) {
    console.error("Error generating bet screenshot:", error);
    return null;
  }
}

/**
 * Generate screenshot using html2image API
 * Requires HTML2IMAGE_API_KEY environment variable
 */
async function screenshotWithHtml2Image(url: string): Promise<string | null> {
  try {
    const apiKey = process.env.HTML2IMAGE_API_KEY;
    if (!apiKey) {
      console.warn("HTML2IMAGE_API_KEY not configured");
      return null;
    }

    const response = await fetch("https://hcti.io/v1/capture", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        url: url,
        device_scale: 2,
        width: 800,
        height: 1200,
      }),
    });

    if (!response.ok) {
      console.error(
        "html2image API error:",
        response.status,
        await response.text()
      );
      return null;
    }

    const data = await response.json();
    return data.url || null;
  } catch (error) {
    console.error("Error with html2image screenshot:", error);
    return null;
  }
}

/**
 * Generate screenshot using Puppeteer (if installed)
 * Requires: npm install puppeteer
 */
async function screenshotWithPuppeteer(url: string): Promise<string | null> {
  try {
    // Dynamically import puppeteer only if available
    let puppeteer: any;
    try {
      puppeteer = await import("puppeteer" as any);
    } catch {
      console.warn(
        "Puppeteer not installed. To use Puppeteer: npm install puppeteer"
      );
      return null;
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    const screenshot = await page.screenshot({ type: "png" });
    await browser.close();

    // Return base64 encoded image
    return `data:image/png;base64,${screenshot.toString("base64")}`;
  } catch (error) {
    console.error("Error with Puppeteer screenshot:", error);
    return null;
  }
}

/**
 * Create a text-based summary that can be used with Telegram
 * This is a fallback when screenshots are not available
 */
export function generateBetSummaryForTelegram(
  betDetails: BetDetailsForScreenshot
): string {
  const statusEmoji =
    betDetails.status === "resolved" ? "✅" : "⏳ IN PROGRESS";

  const optionsText = betDetails.options
    .map((opt) => `  • ${opt.optionText}`)
    .join("\n");

  const winnersText =
    betDetails.status === "resolved"
      ? betDetails.participants
          .filter((p) => p.isWinner)
          .slice(0, 5)
          .map((p) => `  🏆 ${p.userEmail}`)
          .join("\n")
      : "Pending...";

  const participantsPreview = betDetails.participants
    .slice(0, 3)
    .map((p) => `  • ${p.userEmail}`)
    .join("\n");

  const moreParticipants =
    betDetails.participationCount > 3
      ? `  ... and ${betDetails.participationCount - 3} more`
      : "";

  return `
<b>📊 BET DETAILS - ${statusEmoji}</b>

<b>Bet #${betDetails.id}</b>
<b>Title:</b> ${betDetails.title}
<b>Amount:</b> ${betDetails.amount} تومان

<b>Options:</b>
${optionsText}

<b>Participants:</b> ${betDetails.participationCount}
${participantsPreview}
${moreParticipants}

${
  betDetails.status === "resolved"
    ? `<b>Winner:</b> ${betDetails.winningOption}\n\n<b>Winners:</b>\n${winnersText}`
    : ""
}

<i>Bet on a bet and if you lose, you lose the bet.</i>
  `.trim();
}
