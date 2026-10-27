import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { AchievementManager } from "@admin/features/achievements/AchievementManager";
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: () => {} }) }));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it("offers every school grade and saves an IELTS result with the certificate stage", async () => {
  let saved: Record<string, unknown> | undefined;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_path: string, init?: RequestInit) => {
      if (init?.method === "POST") {
        saved = JSON.parse(init.body as string);
        return Response.json({ data: { ...saved, id: "test-result", version: 1 } });
      }
      return Response.json({ data: [], pagination: { hasMore: false } });
    }),
  );
  render(<AchievementManager onExpired={() => {}} />);
  const grade = screen.getByRole("combobox", { name: /Yutuq paytidagi sinfi/ });
  expect(within(grade).getAllByRole("option")).toHaveLength(12);
  expect(within(grade).getByRole("option", { name: "1-sinf" })).toBeInTheDocument();
  expect(within(grade).getByRole("option", { name: "11-sinf" })).toBeInTheDocument();
  fireEvent.change(screen.getByPlaceholderText("Masalan: Ali Valiyev"), {
    target: { value: "Ali Valiyev" },
  });
  fireEvent.change(grade, { target: { value: "10-sinf" } });
  fireEvent.change(screen.getByLabelText("Yutuq nomi"), { target: { value: "IELTS Academic" } });
  fireEvent.change(screen.getByLabelText("Fan"), { target: { value: "Ingliz tili" } });
  fireEvent.change(screen.getByLabelText("Natija yoki ball"), { target: { value: "7.5" } });
  fireEvent.change(screen.getByLabelText("Yutuq turi"), { target: { value: "IELTS" } });
  expect(screen.getByLabelText("Bosqich")).toHaveValue("Sertifikat");
  fireEvent.change(screen.getByLabelText("Holat"), { target: { value: "published" } });
  fireEvent.click(screen.getByRole("button", { name: "Saqlash" }));
  await waitFor(() =>
    expect(saved).toMatchObject({
      classAtAchievement: "10-sinf",
      type: "IELTS",
      stage: "Sertifikat",
      result: "7.5",
      status: "published",
    }),
  );
  expect(await screen.findByRole("status")).toHaveTextContent("Saqlandi");
});
