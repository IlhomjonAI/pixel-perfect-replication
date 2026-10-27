export type TelegramMethod =
  | "getMe"
  | "getWebhookInfo"
  | "getUpdates"
  | "sendMessage"
  | "answerCallbackQuery"
  | "setMyCommands";
export interface TelegramApi {
  call<T = unknown>(method: TelegramMethod, payload?: Record<string, unknown>): Promise<T>;
}

/** Never include the request URL, token or raw transport error in logs. */
export class TelegramError extends Error {
  constructor(
    readonly code: number,
    readonly retryAfter = 0,
  ) {
    super(`Telegram so‘rovi bajarilmadi (${code}).`);
  }
}

export class TelegramClient implements TelegramApi {
  constructor(
    private readonly token: string,
    private readonly signal?: AbortSignal,
  ) {}
  async call<T>(method: TelegramMethod, payload: Record<string, unknown> = {}): Promise<T> {
    const timeout = AbortSignal.timeout(method === "getUpdates" ? 35000 : 15000);
    try {
      const response = await fetch(`https://api.telegram.org/bot${this.token}/${method}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: this.signal ? AbortSignal.any([timeout, this.signal]) : timeout,
      });
      const body = (await response.json()) as {
        ok?: boolean;
        result?: T;
        error_code?: number;
        parameters?: { retry_after?: number };
      };
      if (!response.ok || body.ok !== true)
        throw new TelegramError(
          body.error_code ?? response.status,
          body.parameters?.retry_after ?? 0,
        );
      return body.result as T;
    } catch (error) {
      if (error instanceof TelegramError) throw error;
      throw new TelegramError(0);
    }
  }
}
