import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { PhotoGallery } from "@/components/site/PhotoGallery";
import { Portrait } from "@/components/site/Portrait";

afterEach(cleanup);

it("navigates by arrow keys, stops at boundaries and restores focus when closed", async () => {
  render(<PhotoGallery images={["/a.webp", "/b.webp"]} title="Tadbir" />);
  const trigger = screen.getByRole("button", { name: "Tadbir, 1-rasmni kattalashtirish" });
  trigger.focus();
  fireEvent.click(trigger);
  const dialog = await screen.findByRole("dialog", { name: "Tadbir" });
  fireEvent.keyDown(dialog, { key: "ArrowRight" });
  expect(within(dialog).getByAltText("Tadbir, 2-rasm")).toHaveAttribute("src", "/b.webp");
  fireEvent.keyDown(dialog, { key: "ArrowRight" });
  expect(within(dialog).getByRole("status")).toHaveTextContent("2 / 2");
  fireEvent.keyDown(dialog, { key: "ArrowLeft" });
  expect(within(dialog).getByAltText("Tadbir, 1-rasm")).toHaveAttribute("src", "/a.webp");
  fireEvent.click(within(dialog).getByRole("button", { name: "Yopish" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  await waitFor(() => expect(trigger).toHaveFocus());
});

it("keeps an available image visible if the gallery shrinks while open", async () => {
  const { rerender } = render(
    <PhotoGallery images={["/a.webp", "/b.webp", "/c.webp"]} title="Tadbir" />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Tadbir, 3-rasmni kattalashtirish" }));
  const dialog = await screen.findByRole("dialog", { name: "Tadbir" });
  rerender(<PhotoGallery images={["/a.webp", "/b.webp"]} title="Tadbir" />);
  expect(within(dialog).getByAltText("Tadbir, 2-rasm")).toHaveAttribute("src", "/b.webp");
  expect(within(dialog).getByRole("status")).toHaveTextContent("2 / 2");
});

it("opens a teacher portrait and provides its full image link", async () => {
  render(<Portrait src="/media/staff/abduxoliqov-behzod.webp" name="Behzod" />);
  fireEvent.click(screen.getByRole("button", { name: "Behzod rasmini kattalashtirish" }));
  const dialog = await screen.findByRole("dialog", { name: "Behzod" });
  expect(within(dialog).getByRole("link", { name: "Rasmni to‘liq ochish" })).toHaveAttribute(
    "href",
    "/media/staff/abduxoliqov-behzod.webp",
  );
});
