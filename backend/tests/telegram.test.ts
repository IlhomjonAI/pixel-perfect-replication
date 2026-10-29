// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SqliteDatabase } from "@backend/database/sqlite";
import { handleContactSubmit } from "@backend/api/contact-api";
import { ContactBot, type TelegramUpdate } from "@backend/telegram/bot";
import {
  TelegramClient,
  TelegramError,
  type TelegramApi,
  type TelegramMethod,
} from "@backend/telegram/client";
import { deliverPendingContacts } from "@backend/telegram/outbox";
import { contactText, splitTelegramText } from "@backend/telegram/messages";
import { acquireWorkerLease } from "@backend/telegram/worker";
import type { AdminMessage } from "@school/contracts/contact-workflow";

let db: SqliteDatabase;
const admin = 123456789;
beforeEach(() => {
  db = new SqliteDatabase();
  db.migrate();
});
afterEach(() => {
  db.close();
  vi.unstubAllGlobals();
});

function fakeApi(
  fail?: (method: TelegramMethod, payload: Record<string, unknown>, index: number) => void,
) {
  const calls: { method: TelegramMethod; payload: Record<string, unknown> }[] = [];
  const api: TelegramApi = {
    async call<T>(method: TelegramMethod, payload: Record<string, unknown> = {}) {
      calls.push({ method, payload });
      fail?.(method, payload, calls.length);
      return {} as T;
    },
  };
  return { api, calls };
}
async function insert(message = "Maktab haqida batafsil savolim bor.") {
  const row = await db
    .prepare(
      "INSERT INTO contact_messages (name,contact,telegram_username,email,type,message) VALUES ('Ali Valiyev','+998901234567','@ali_valiyev','ali@example.test','Savol',?) RETURNING id",
    )
    .bind(message)
    .first<{ id: number }>();
  return row!.id;
}
function command(from = admin, chat = admin, type = "private"): TelegramUpdate {
  return {
    update_id: 1,
    message: { message_id: 1, from: { id: from }, chat: { id: chat, type }, text: "/murojaatlar" },
  };
}

describe("Telegram access and menu", () => {
  it("rejects other IDs, a spoofed owner chat, and group commands before reading contacts", async () => {
    let reads = 0;
    const guarded: Database = {
      prepare() {
        reads++;
        throw new Error("No unauthorized DB reads");
      },
    };
    const { api, calls } = fakeApi();
    const bot = new ContactBot(guarded, api, admin);
    await bot.handleUpdate(command(999, 999));
    await bot.handleUpdate(command(999, admin));
    await bot.handleUpdate(command(admin, -123, "group"));
    await bot.handleUpdate({
      update_id: 2,
      callback_query: {
        id: "denied",
        from: { id: 999 },
        data: "view:1:0",
        message: { message_id: 1, chat: { id: admin, type: "private" } },
      },
    });
    expect(reads).toBe(0);
    expect(calls.filter((c) => c.method === "sendMessage")).toHaveLength(0);
    expect(calls[0]?.payload).toMatchObject({ text: "Ruxsat yo‘q.", show_alert: true });
  });
  it("shows only the contact menu, pages through requests, and provides the sender's profile", async () => {
    for (let n = 0; n < 7; n++) await insert();
    const { api, calls } = fakeApi();
    const bot = new ContactBot(db, api, admin);
    await bot.configureMenu();
    expect(calls[0]?.payload["commands"]).toEqual([]);
    expect(calls[1]?.payload).toMatchObject({
      scope: { chat_id: admin },
      commands: [{ command: "murojaatlar" }],
    });
    await bot.handleUpdate(command());
    const list = calls.at(-1)!.payload;
    expect(JSON.stringify(list)).toContain("list:5");
    expect(JSON.stringify(list)).toContain("view:7:0");
    await bot.handleUpdate({
      update_id: 2,
      callback_query: {
        id: "view",
        from: { id: admin },
        data: "view:7:0",
        message: { message_id: 1, chat: { id: admin, type: "private" } },
      },
    });
    const detail = calls.at(-1)!.payload;
    expect(detail["text"]).toContain("+998901234567");
    expect(detail["text"]).toContain("@ali_valiyev");
    expect(JSON.stringify(detail)).toContain("https://t.me/ali_valiyev");
    expect(detail).not.toHaveProperty("parse_mode");
  });
});

describe("Durable Telegram notifications", () => {
  it("saves contact details and queues exactly one notification for a retried submission", async () => {
    const input = {
      name: "Ali Valiyev",
      contact: "+998901234567",
      telegramUsername: "ali_valiyev",
      email: "",
      type: "Savol",
      message: "Maktab haqida savolim bor.",
      consent: true,
      requestId: crypto.randomUUID(),
    };
    const submit = () =>
      handleContactSubmit(
        new Request("https://school.test/api/contact", {
          method: "POST",
          headers: { origin: "https://school.test", "Content-Type": "application/json" },
          body: JSON.stringify(input),
        }),
        { DB: db, ADMIN_PASSWORD_HASH: "test-only" },
      );
    expect((await submit()).status).toBe(202);
    expect((await submit()).status).toBe(202);
    expect(
      await db.prepare("SELECT contact,telegram_username FROM contact_messages").first(),
    ).toEqual({ contact: "+998901234567", telegram_username: "@ali_valiyev" });
    expect(await db.prepare("SELECT count(*) AS total FROM telegram_outbox").first()).toEqual({
      total: 1,
    });
  });
  it("retries after Telegram failure without losing the contact", async () => {
    await insert();
    const failure = fakeApi(() => {
      throw new TelegramError(429, 90);
    });
    await deliverPendingContacts(db, failure.api, admin, 100);
    expect(
      await db
        .prepare("SELECT attempts,next_attempt_at,last_error,sent_at FROM telegram_outbox")
        .first(),
    ).toEqual({ attempts: 1, next_attempt_at: 190, last_error: "telegram_429", sent_at: null });
    const success = fakeApi();
    await deliverPendingContacts(db, success.api, admin, 189);
    expect(success.calls).toHaveLength(0);
    await deliverPendingContacts(db, success.api, admin, 190);
    expect(success.calls).toHaveLength(1);
    expect(await db.prepare("SELECT sent_at FROM telegram_outbox").first()).toMatchObject({
      sent_at: new Date(190000).toISOString(),
    });
    await deliverPendingContacts(db, success.api, admin, 200);
    expect(success.calls).toHaveLength(1);
    expect(await db.prepare("SELECT count(*) AS total FROM contact_messages").first()).toEqual({
      total: 1,
    });
  });
  it("resumes a partially delivered long message without resending completed parts", async () => {
    await insert("📝".repeat(2500));
    const first = fakeApi((_m, _p, index) => {
      if (index === 2) throw new TelegramError(503);
    });
    await deliverPendingContacts(db, first.api, admin, 100);
    expect(await db.prepare("SELECT delivery_part FROM telegram_outbox").first()).toEqual({
      delivery_part: 1,
    });
    const retry = fakeApi();
    await deliverPendingContacts(db, retry.api, admin, 200);
    expect(retry.calls).toHaveLength(1);
    expect(retry.calls[0]!.payload["text"]).not.toBe(first.calls[0]!.payload["text"]);
    expect((retry.calls[0]!.payload["text"] as string).length).toBeLessThanOrEqual(3500);
  });
  it("removes unsent notifications when their contact is deleted", async () => {
    const id = await insert();
    await db.prepare("DELETE FROM contact_messages WHERE id=?").bind(id).run();
    expect(await db.prepare("SELECT count(*) AS total FROM telegram_outbox").first()).toEqual({
      total: 0,
    });
  });
  it("allows only one live worker and lets a new worker recover an expired lease", async () => {
    expect(await acquireWorkerLease(db, "a", 100)).toBe(true);
    expect(await acquireWorkerLease(db, "b", 110)).toBe(false);
    expect(await acquireWorkerLease(db, "a", 150)).toBe(true);
    expect(await acquireWorkerLease(db, "b", 170)).toBe(false);
    expect(await acquireWorkerLease(db, "b", 211)).toBe(true);
  });
});

it("splits Unicode messages safely and preserves the full text", async () => {
  const id = await insert("📝".repeat(2500));
  const row = await db
    .prepare("SELECT * FROM contact_messages WHERE id=?")
    .bind(id)
    .first<AdminMessage>();
  const text = contactText(row!);
  const parts = splitTelegramText(text);
  expect(parts.join("")).toBe(text);
  expect(parts.every((part) => part.length <= 3500 && !/[\uD800-\uDBFF]$/.test(part))).toBe(true);
});

it("sanitizes transport failures so the bot token cannot appear in errors", async () => {
  const token = "123456789:test-only-token-for-secret-check";
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => {
      throw new Error("https://api.telegram.org/bot" + token + "/sendMessage");
    }),
  );
  await expect(new TelegramClient(token).call("sendMessage", {})).rejects.toThrow(
    "Telegram so‘rovi bajarilmadi (0).",
  );
});
