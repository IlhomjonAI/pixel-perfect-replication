import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import Achievements from "@/views/Achievements";
import type { Achievement } from "@school/contracts/models";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("retains loaded achievements after a failed next page and retries the same offset", async () => {
  const item: Achievement = {
    id: "one",
    title: "Birinchi yutuq",
    studentName: "Ali",
    classAtAchievement: "10-sinf",
    type: "IELTS",
    subject: "Ingliz tili",
    stage: "Sertifikat",
    result: "7.5",
    achievementDate: "2026-10-20",
    certificateImage: null,
    isDemo: false,
  };
  const send = vi
    .fn()
    .mockRejectedValueOnce(new TypeError("Offline"))
    .mockResolvedValueOnce(
      Response.json({
        data: { items: [{ ...item, id: "two", title: "Ikkinchi yutuq" }], hasMore: false },
      }),
    );
  vi.stubGlobal("fetch", send);
  render(
    <Achievements
      initialData={{
        page: { items: [item], hasMore: true, offset: 0 },
        options: { year: [], subject: [] },
      }}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Ko‘proq ko‘rsatish" }));
  await screen.findByRole("alert");
  expect(screen.getByRole("heading", { name: "Birinchi yutuq" })).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Qayta urinish" }));
  await screen.findByRole("heading", { name: "Ikkinchi yutuq" });
  expect(screen.getByRole("heading", { name: "Birinchi yutuq" })).toBeVisible();
  expect(send.mock.calls[0]![0]).toContain("offset=1");
  expect(send.mock.calls[1]![0]).toBe(send.mock.calls[0]![0]);
  await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
});
