"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AdminCard,
  AdminListItem,
  AdminLoading,
  AdminNotice,
  AdminPager,
} from "@admin/components/admin-ui";
import { AdminDeleteButton } from "@admin/components/AdminDeleteButton";
import { useAdminApi } from "@admin/hooks/use-admin-api";
import { TELEGRAM_USERNAME, isValidPhone } from "@school/contracts/contact";
import {
  messageStatuses,
  messageStatusLabels,
  type AdminMessage,
} from "@school/contracts/contact-workflow";
export function MessageManager({ onExpired }: { onExpired: () => void }) {
  const [items, setItems] = useState<AdminMessage[]>([]);
  const [selected, setSelected] = useState<AdminMessage | null>(null);
  const [chosen, setChosen] = useState<AdminMessage["status"]>("new");
  const [filter, setFilter] = useState("");
  const [offset, setOffset] = useState(0);
  const [more, setMore] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const sequence = useRef(0);
  const api = useAdminApi(onExpired);
  const load = useCallback(
    async (status: string, page: number) => {
      const current = ++sequence.current;
      setLoading(true);
      setError("");
      try {
        const result = await api<AdminMessage[]>(
          "/api/admin/messages?offset=" +
            page +
            (status ? "&status=" + encodeURIComponent(status) : ""),
        );
        if (current !== sequence.current) return;
        setItems(result.data);
        setCounts(result.counts ?? {});
        setMore(result.pagination?.hasMore ?? false);
        setOffset(page);
      } catch (e) {
        if (current === sequence.current)
          setError(e instanceof Error ? e.message : "Serverga ulanib bo‘lmadi.");
      } finally {
        if (current === sequence.current) setLoading(false);
      }
    },
    [api],
  );
  useEffect(() => {
    void load("", 0);
  }, [load]);
  function open(item: AdminMessage) {
    setSelected(item);
    setChosen(item.status);
    setNotice("");
    setError("");
  }
  async function save() {
    if (!selected) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await api<AdminMessage>("/api/admin/messages/" + selected.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: chosen, version: selected.version }),
      });
      setSelected(result.data);
      setNotice("Holat saqlandi.");
      await load(filter, offset);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Holat saqlanmadi.");
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    if (!selected || busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await api("/api/admin/messages/" + selected.id + "?version=" + selected.version, {
        method: "DELETE",
      });
      setSelected(null);
      setNotice("Murojaat o‘chirildi.");
      await load(filter, offset > 0 && items.length === 1 ? Math.max(0, offset - 20) : offset);
    } finally {
      setBusy(false);
    }
  }
  const date = (value: string) => {
    const iso = value.includes("T") ? value : value.replace(" ", "T") + "Z";
    return new Date(iso).toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" });
  };
  const username = selected?.telegram_username?.replace(/^@/, "") ?? "";
  const telegramLink = TELEGRAM_USERNAME.test(username) ? `https://t.me/${username}` : null;
  const phone =
    selected && isValidPhone(selected.contact) ? selected.contact.replace(/[\s()-]/g, "") : null;
  return (
    <section className="mt-8">
      <h2 className="text-2xl font-semibold text-primary">Murojaatlar</h2>
      <div className="mt-4 flex flex-wrap gap-3">
        {messageStatuses.map((status) => (
          <span key={status} className="rounded-lg border px-3 py-2 text-sm">
            {messageStatusLabels[status]}: {counts[status] ?? 0}
          </span>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap items-end gap-3">
        <label>
          Holat bo‘yicha
          <select
            className="field mt-2"
            value={filter}
            disabled={busy}
            onChange={(e) => {
              setFilter(e.target.value);
              setSelected(null);
              setNotice("");
              void load(e.target.value, 0);
            }}
          >
            <option value="">Barchasi</option>
            {messageStatuses.map((status) => (
              <option key={status} value={status}>
                {messageStatusLabels[status]}
              </option>
            ))}
          </select>
        </label>
        <button
          className="btn btn-outline"
          disabled={busy || loading}
          onClick={() => void load(filter, offset)}
        >
          Yangilash
        </button>
      </div>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_1.3fr]">
        <div>
          {loading ? (
            <AdminLoading />
          ) : items.length ? (
            <ul className="space-y-3">
              {items.map((item) => (
                <li key={item.id}>
                  <AdminListItem
                    active={selected?.id === item.id}
                    disabled={busy}
                    onClick={() => open(item)}
                  >
                    <strong className="block">{item.name}</strong>
                    <span className="mt-1 block text-sm">
                      {item.type} · {messageStatusLabels[item.status]}
                    </span>
                    <time
                      className="mt-2 block text-sm text-muted-foreground"
                      dateTime={item.created_at}
                    >
                      {date(item.created_at)}
                    </time>
                  </AdminListItem>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">Bu holatda murojaat yo‘q.</p>
          )}
          <AdminPager
            offset={offset}
            hasMore={more}
            disabled={loading || busy}
            onPage={(page) => void load(filter, page)}
          />
        </div>
        <div>
          {selected ? (
            <AdminCard>
              <h3 className="text-xl font-semibold text-primary">{selected.name}</h3>
              <dl className="mt-4 space-y-3">
                <div>
                  <dt className="text-sm text-muted-foreground">Aloqa</dt>
                  <dd className="break-words">{selected.contact}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Telegram</dt>
                  <dd className="break-words">
                    {telegramLink ? (
                      <a
                        href={telegramLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-primary underline underline-offset-4"
                      >
                        {selected.telegram_username}
                      </a>
                    ) : (
                      "Eski murojaatda ko‘rsatilmagan"
                    )}
                  </dd>
                </div>
                {selected.email && (
                  <div>
                    <dt className="text-sm text-muted-foreground">Elektron pochta</dt>
                    <dd className="break-words">{selected.email}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm text-muted-foreground">Murojaat turi</dt>
                  <dd>{selected.type}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Yuborilgan vaqt</dt>
                  <dd>{date(selected.created_at)}</dd>
                </div>
              </dl>
              <div className="mt-5 flex flex-wrap gap-3">
                {telegramLink && (
                  <a
                    href={telegramLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                  >
                    Telegram orqali yozish
                  </a>
                )}
                {phone && (
                  <a href={`sms:${phone}`} className="btn btn-outline">
                    SMS yozish
                  </a>
                )}
                {phone && (
                  <a href={`tel:${phone}`} className="btn btn-outline">
                    Qo‘ng‘iroq qilish
                  </a>
                )}
              </div>
              <p className="mt-6 whitespace-pre-wrap break-words">{selected.message}</p>
              <label className="mt-6 block">
                Holat
                <select
                  className="field mt-2"
                  disabled={busy}
                  value={chosen}
                  onChange={(e) => {
                    setChosen(e.target.value as AdminMessage["status"]);
                    setNotice("");
                  }}
                >
                  {messageStatuses.map((status) => (
                    <option key={status} value={status}>
                      {messageStatusLabels[status]}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="btn btn-primary mt-4"
                disabled={busy || chosen === selected.status}
                onClick={save}
              >
                {busy ? "Saqlanmoqda…" : "Holatni saqlash"}
              </button>
              <AdminDeleteButton
                name={selected.name + " — murojaat"}
                disabled={busy || loading}
                onDelete={remove}
              />
            </AdminCard>
          ) : (
            <p className="text-muted-foreground">Murojaatni o‘qish uchun ro‘yxatdan tanlang.</p>
          )}
          <AdminNotice notice={notice} error={error} />
        </div>
      </div>
    </section>
  );
}
