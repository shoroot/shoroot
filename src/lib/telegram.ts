/**
 * Telegram Service با پشتیبانی از Proxy
 * برای سرورهای داخل ایران که تلگرام فیلتره
 */

import { HttpsProxyAgent } from 'https-proxy-agent';

interface TelegramConfig {
  botToken: string;
  chatId: string;
  proxyUrl?: string; // مثال: 'http://proxy-server:port'
}

/**
 * تشخیص محیط و استفاده از proxy مناسب
 */
function getProxyUrl(customProxyUrl?: string): string | undefined {
  // اگر proxy دستی داده شده، از اون استفاده کن
  if (customProxyUrl) {
    return customProxyUrl;
  }

  // در حالت development از localhost proxy استفاده کن
  const isDevelopment = process.env.NODE_ENV === 'development';
  if (isDevelopment) {
    console.log('🔧 Development mode detected - using local SOCKS5 proxy');
    return 'socks5://127.0.0.1:10808';
  }

  // در production از proxy محیطی استفاده کن (اگر هست)
  return process.env.TELEGRAM_PROXY_URL;
}

/**
 * ساخت fetch با proxy
 */
function createFetchWithProxy(proxyUrl?: string) {
  if (!proxyUrl) {
    return fetch; // استفاده از fetch معمولی
  }

  // استفاده از proxy برای دور زدن فیلترینگ
  const agent = new HttpsProxyAgent(proxyUrl);
  
  return async (url: string | URL, options?: RequestInit) => {
    return fetch(url, {
      ...options,
      // @ts-ignore - Node.js fetch پشتیبانی از agent داره
      agent,
    });
  };
}

/**
 * ارسال پیام به تلگرام با پشتیبانی از Proxy
 */
export async function sendTelegramMessage(
  message: string,
  config?: TelegramConfig
): Promise<void> {
  const botToken = config?.botToken || process.env.TELEGRAM_BOT_TOKEN;
  const chatId = config?.chatId || process.env.TELEGRAM_CHAT_ID;
  const proxyUrl = getProxyUrl(config?.proxyUrl);

  if (!botToken || !chatId) {
    console.warn(
      "⚠️ Telegram configuration missing. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID"
    );
    return;
  }

  const customFetch = createFetchWithProxy(proxyUrl);
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    console.log(`📤 Sending to Telegram${proxyUrl ? ' (via proxy)' : ''}...`);
    const startTime = Date.now();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await customFetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`❌ Telegram API error (${responseTime}ms):`, {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      return;
    }

    console.log(`✅ Telegram message sent successfully (${responseTime}ms)`);
  } catch (error: any) {
    handleTelegramError(error, proxyUrl);
  }
}

/**
 * ارسال عکس به تلگرام
 */
export async function sendTelegramPhoto(
  photoUrl: string,
  caption: string,
  config?: TelegramConfig
): Promise<void> {
  const botToken = config?.botToken || process.env.TELEGRAM_BOT_TOKEN;
  const chatId = config?.chatId || process.env.TELEGRAM_CHAT_ID;
  const proxyUrl = getProxyUrl(config?.proxyUrl);

  if (!botToken || !chatId) {
    console.warn("⚠️ Telegram configuration missing");
    return;
  }

  const customFetch = createFetchWithProxy(proxyUrl);
  const url = `https://api.telegram.org/bot${botToken}/sendPhoto`;

  try {
    console.log(`📤 Sending photo to Telegram${proxyUrl ? ' (via proxy)' : ''}...`);
    const startTime = Date.now();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await customFetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        photo: photoUrl,
        caption: caption,
        parse_mode: "HTML",
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`❌ Telegram API error (${responseTime}ms):`, errorData);
      return;
    }

    console.log(`✅ Telegram photo sent successfully (${responseTime}ms)`);
  } catch (error: any) {
    handleTelegramError(error, proxyUrl);
  }
}

/**
 * مدیریت خطاهای تلگرام
 */
function handleTelegramError(error: any, proxyUrl?: string): void {
  const errorMessage = error?.message || String(error);
  const errorCode = error?.code;

  console.error("❌ Telegram Error Details:", {
    message: errorMessage,
    code: errorCode,
    name: error?.name,
    proxy: proxyUrl || 'none',
  });

  if (error?.name === "AbortError") {
    console.error("⏱️ Telegram request timeout (15s) - network too slow");
  } else if (errorCode === "ENOTFOUND") {
    console.error("🌐 DNS Error - Cannot resolve api.telegram.org");
    console.error("💡 Solution: Check internet connection or use proxy");
  } else if (errorCode === "ECONNREFUSED") {
    console.error("🚫 Connection refused - Telegram API blocked");
    console.error("💡 Solution: Use VPN/Proxy (set TELEGRAM_PROXY_URL)");
  } else if (errorCode === "ETIMEDOUT" || errorCode === "ECONNRESET") {
    console.error("⏳ Connection timeout/reset");
    console.error("💡 Solution: Network unstable or Telegram filtered");
  } else if (errorMessage.includes("fetch failed")) {
    console.error("🔌 Network error - Cannot reach Telegram API");
    console.error("💡 Check: Firewall, DNS, or use proxy");
  } else {
    console.error(`⚠️ Unknown error: ${errorMessage}`);
  }

  if (!proxyUrl) {
    console.error("\n💡 TIP: If in Iran, set TELEGRAM_PROXY_URL in .env file");
  }
}

/**
 * تست اتصال به تلگرام
 */
export async function testTelegramConnection(
  config?: TelegramConfig
): Promise<boolean> {
  const botToken = config?.botToken || process.env.TELEGRAM_BOT_TOKEN;
  const proxyUrl = getProxyUrl(config?.proxyUrl);

  if (!botToken) {
    console.error("❌ TELEGRAM_BOT_TOKEN not set");
    return false;
  }

  const customFetch = createFetchWithProxy(proxyUrl);
  const url = `https://api.telegram.org/bot${botToken}/getMe`;

  try {
    console.log("🔍 Testing Telegram connection...");
    const response = await customFetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(10000),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Telegram connection successful!");
      console.log("🤖 Bot info:", data.result);
      return true;
    } else {
      console.error("❌ Telegram API returned error:", response.status);
      return false;
    }
  } catch (error) {
    console.error("❌ Cannot connect to Telegram");
    handleTelegramError(error, proxyUrl);
    return false;
  }
}

/**
 * Send Telegram notification about a new bet creation
 */
export async function notifyBetCreation(betData: {
  id: number;
  title: string;
  description: string;
  amount: number;
  options: string[];
}): Promise<void> {
  try {
    const message = formatBetCreationMessage(betData);
    await sendTelegramMessage(message);
  } catch (error) {
    console.error("Failed to send bet creation notification to Telegram:", error);
    // Don't throw - let the API continue even if Telegram fails
  }
}

/**
 * Send Telegram notification about a bet status change
 */
export async function notifyBetStatusChange(betData: {
  id: number;
  title: string;
  status: "active" | "in-progress" | "resolved";
  winningOption: string | null;
  participationCount: number;
}): Promise<void> {
  try {
    const message = formatBetStatusChangeMessage(betData);
    await sendTelegramMessage(message);
  } catch (error) {
    console.error("Failed to send bet status change notification to Telegram:", error);
    // Don't throw - let the API continue even if Telegram fails
  }
}

// Export توابع فرمت کردن از کد قبلی
export function formatBetCreationMessage(betData: {
  id: number;
  title: string;
  description: string;
  amount: number;
  options: string[];
}): string {
  const optionsText = betData.options
    .map((option, index) => `  ${index + 1}. ${option}`)
    .join("\n");

  return `
<b>🎲 New Bet Created!</b>

<b>Bet #${betData.id}</b>
<b>Title:</b> ${escapeHtml(betData.title)}
<b>Description:</b> ${escapeHtml(betData.description)}
<b>Amount:</b> ${formatAmount(betData.amount)}

<b>Options:</b>
${optionsText}

<i>Bet on a bet and if you lose, you lose the bet.</i>
  `.trim();
}

export function formatBetStatusChangeMessage(betData: {
  id: number;
  title: string;
  status: "active" | "in-progress" | "resolved";
  winningOption: string | null;
  participationCount: number;
}): string {
  const statusEmoji = {
    active: "🟢",
    "in-progress": "🟡",
    resolved: "🏁",
  };

  const statusText = {
    active: "Active",
    "in-progress": "In Progress",
    resolved: "Resolved",
  };

  let message = `
<b>${statusEmoji[betData.status]} Bet Status Updated</b>

<b>Bet #${betData.id}</b>
<b>Title:</b> ${escapeHtml(betData.title)}
<b>Status:</b> ${statusText[betData.status]}
<b>Participants:</b> ${betData.participationCount}`;

  if (betData.status === "resolved" && betData.winningOption) {
    message += `
<b>Winning Option:</b> ${escapeHtml(betData.winningOption)}`;
  }

  message += `

<i>Bet status has been updated.</i>
  `;

  return message.trim();
}

function escapeHtml(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatAmount(amount: number): string {
  return `${amount.toLocaleString("fa-IR")} تومان`;
}