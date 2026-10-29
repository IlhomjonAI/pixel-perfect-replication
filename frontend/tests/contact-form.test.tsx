import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import Contact from "@/views/Contact";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("focuses the first invalid field and clears its stale error when edited", () => {
  render(<Contact />);
  fireEvent.click(screen.getByRole("button", { name: "Murojaatni yuborish" }));
  const name = screen.getByLabelText("Ism *");
  expect(name).toHaveFocus();
  expect(name).toHaveAttribute("aria-invalid", "true");
  fireEvent.change(name, { target: { value: "Ali Valiyev" } });
  expect(name).toHaveAttribute("aria-invalid", "false");
  expect(screen.queryByText("Ismingizni kiriting.")).not.toBeInTheDocument();
  expect(screen.getByLabelText("Telefon raqami *")).toHaveAttribute("aria-invalid", "true");
});

it("keeps the same request ID and form values when retrying after a network failure", async () => {
  const send = vi
    .fn()
    .mockRejectedValueOnce(new TypeError("Failed to fetch"))
    .mockResolvedValueOnce(Response.json({ data: { received: true } }, { status: 202 }));
  vi.stubGlobal("fetch", send);
  render(<Contact />);
  for (const [label, value] of [
    ["Ism *", "Ali Valiyev"],
    ["Telefon raqami *", "+998 90 123 45 67"],
    ["Telegram username *", "@ali_valiyev"],
    ["Murojaat turi *", "Savol"],
    ["Xabar *", "Maktab haqida batafsil savolim bor."],
  ])
    fireEvent.change(screen.getByLabelText(label!), { target: { value } });
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(screen.getByRole("button", { name: "Murojaatni yuborish" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Serverga ulanib bo‘lmadi.");
  expect(screen.getByLabelText("Ism *")).toHaveValue("Ali Valiyev");
  fireEvent.click(screen.getByRole("button", { name: "Murojaatni yuborish" }));
  await waitFor(() =>
    expect(screen.getByRole("alert")).toHaveTextContent("Murojaatingiz qabul qilindi"),
  );
  expect(send.mock.calls[1]![1].body).toBe(send.mock.calls[0]![1].body);
});

it("requires a phone and Telegram username, and submits optional email with consent", async () => {
  let submitted: Record<string, unknown> | undefined;
  const send = vi.fn(async (_url: string, init?: RequestInit) => {
    submitted = JSON.parse(init!.body as string);
    return Response.json({ data: { received: true } }, { status: 202 });
  });
  vi.stubGlobal("fetch", send);
  render(<Contact />);
  fireEvent.change(screen.getByLabelText("Ism *"), { target: { value: "Ali Valiyev" } });
  fireEvent.change(screen.getByLabelText("Telefon raqami *"), {
    target: { value: "+998 90 123 45 67" },
  });
  fireEvent.change(screen.getByLabelText("Murojaat turi *"), { target: { value: "Savol" } });
  fireEvent.change(screen.getByLabelText("Xabar *"), {
    target: { value: "Maktab haqida batafsil savolim bor." },
  });
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(screen.getByRole("button", { name: "Murojaatni yuborish" }));
  expect(send).not.toHaveBeenCalled();
  expect(screen.getByLabelText("Telegram username *")).toHaveAttribute("aria-invalid", "true");
  fireEvent.change(screen.getByLabelText("Telegram username *"), {
    target: { value: "@ali_valiyev" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Murojaatni yuborish" }));
  await waitFor(() =>
    expect(submitted).toMatchObject({
      contact: "+998 90 123 45 67",
      telegramUsername: "@ali_valiyev",
      email: "",
      consent: true,
    }),
  );
  expect(await screen.findByRole("alert")).toHaveTextContent("Murojaatingiz qabul qilindi");
  expect(screen.getByLabelText("Telefon raqami *")).toHaveValue("");
  expect(screen.getByLabelText("Telegram username *")).toHaveValue("");
});
