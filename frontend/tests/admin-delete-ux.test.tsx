import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { AchievementManager } from "@admin/features/achievements/AchievementManager";
import { AdminDeleteButton } from "@admin/components/AdminDeleteButton";
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("cancels without deleting and keeps the dialog usable when deletion fails", async () => {
  const remove = vi
    .fn()
    .mockRejectedValueOnce(new Error("Yozuv boshqa oynada o‘zgartirilgan."))
    .mockResolvedValue(undefined);
  render(<AdminDeleteButton name="Test yozuv" onDelete={remove} />);
  fireEvent.click(screen.getByRole("button", { name: "O‘chirish" }));
  let dialog = await screen.findByRole("dialog");
  fireEvent.click(within(dialog).getByRole("button", { name: "Bekor qilish" }));
  expect(remove).not.toHaveBeenCalled();
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  fireEvent.click(screen.getByRole("button", { name: "O‘chirish" }));
  dialog = await screen.findByRole("dialog");
  fireEvent.click(within(dialog).getByRole("button", { name: "Ha, o‘chirish" }));
  expect(await within(dialog).findByRole("alert")).toHaveTextContent("boshqa oynada");
  fireEvent.click(within(dialog).getByRole("button", { name: "Ha, o‘chirish" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(remove).toHaveBeenCalledTimes(2);
});

it("deletes a selected achievement with its saved version and resets the editor", async () => {
  const item = {
    id: "test-achievement",
    studentName: "Test O‘quvchi",
    classAtAchievement: "9-sinf",
    type: "STEM",
    title: "Test yutuq",
    subject: "Math",
    stage: "Tuman",
    result: "1",
    achievementDate: "2026-10-16",
    certificateImage: null,
    status: "published",
    version: 3,
    isDemo: false,
  };
  let removed = false;
  const requests = vi.fn(async (url: string, init?: RequestInit) => {
    if (init?.method === "DELETE") {
      expect(url).toBe("/api/admin/achievements/test-achievement?version=3");
      removed = true;
      return Response.json({ data: { deleted: true } });
    }
    return Response.json({ data: removed ? [] : [item], pagination: { hasMore: false } });
  });
  vi.stubGlobal("fetch", requests);
  render(<AchievementManager onExpired={() => {}} />);
  fireEvent.click(await screen.findByRole("button", { name: /Test O‘quvchi/ }));
  expect(screen.getByLabelText("Yutuq nomi")).toHaveValue("Test yutuq");
  fireEvent.click(screen.getByRole("button", { name: "O‘chirish" }));
  const dialog = await screen.findByRole("dialog");
  expect(removed).toBe(false);
  fireEvent.click(within(dialog).getByRole("button", { name: "Ha, o‘chirish" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(screen.getByLabelText("Yutuq nomi")).toHaveValue("");
  expect(screen.getByRole("status")).toHaveTextContent("Yozuv o‘chirildi.");
  expect(screen.queryByRole("button", { name: /Test O‘quvchi/ })).not.toBeInTheDocument();
});
