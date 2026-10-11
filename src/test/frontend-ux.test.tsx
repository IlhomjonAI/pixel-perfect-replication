import type { ReactNode, MouseEventHandler } from "react";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { PhotoPlaceholder } from "@/components/site/PhotoPlaceholder";
import { PhotoGallery } from "@/components/site/PhotoGallery";
import { SiteHeader } from "@/components/site/SiteHeader";
vi.mock("@tanstack/react-router", () => ({
  useRouterState: () => "/",
  Link: ({
    to,
    children,
    onClick,
    className,
    "aria-label": label,
  }: {
    to: string;
    children: ReactNode;
    onClick?: MouseEventHandler<HTMLAnchorElement>;
    className?: string;
    "aria-label"?: string;
  }) => (
    <a
      href={to}
      className={className}
      aria-label={label}
      onClick={(event) => {
        event.preventDefault();
        onClick?.(event);
      }}
    >
      {children}
    </a>
  ),
}));
afterEach(cleanup);
it("replaces a failed image with a label and can load a new URL", () => {
  const { rerender } = render(
    <PhotoPlaceholder src="https://example.test/missing.png" alt="Maktab" />,
  );
  fireEvent.error(screen.getByAltText("Maktab"));
  expect(screen.getByRole("img", { name: "Rasm hozir ochilmadi" })).toBeInTheDocument();
  expect(screen.queryByAltText("Maktab")).not.toBeInTheDocument();
  rerender(<PhotoPlaceholder src="https://example.test/new.png" alt="Yangi maktab" />);
  expect(screen.getByAltText("Yangi maktab")).toHaveAttribute(
    "src",
    "https://example.test/new.png",
  );
});
it("opens the chosen gallery image, navigates both ways and links the original", async () => {
  render(
    <PhotoGallery
      images={[
        "https://example.test/a.png",
        null,
        "https://example.test/b.png",
        "https://example.test/a.png",
      ]}
      title="Tadbir"
    />,
  );
  expect(screen.getAllByRole("button", { name: /kattalashtirish/ })).toHaveLength(2);
  fireEvent.click(screen.getByRole("button", { name: "Tadbir, 2-rasmni kattalashtirish" }));
  const dialog = await screen.findByRole("dialog", { name: "Tadbir" });
  expect(within(dialog).getByAltText("Tadbir, 2-rasm")).toHaveAttribute(
    "src",
    "https://example.test/b.png",
  );
  expect(within(dialog).getByRole("button", { name: "Keyingi rasm" })).toBeDisabled();
  fireEvent.click(within(dialog).getByRole("button", { name: "Oldingi rasm" }));
  expect(within(dialog).getByRole("link", { name: "To‘liq ochish" })).toHaveAttribute(
    "href",
    "https://example.test/a.png",
  );
  expect(within(dialog).getByRole("button", { name: "Oldingi rasm" })).toBeDisabled();
  fireEvent.click(within(dialog).getByRole("button", { name: "Keyingi rasm" }));
  expect(within(dialog).getByRole("link", { name: "To‘liq ochish" })).toHaveAttribute(
    "href",
    "https://example.test/b.png",
  );
});
it("mobile menu closes on Escape and restores focus to its trigger", async () => {
  render(<SiteHeader />);
  const trigger = screen.getByRole("button", { name: "Menyuni ochish" });
  trigger.focus();
  fireEvent.click(trigger);
  const dialog = await screen.findByRole("dialog", { name: "Menyu" });
  expect(within(dialog).getByRole("navigation", { name: "Mobil menyu" })).toBeInTheDocument();
  fireEvent.keyDown(dialog, { key: "Escape" });
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  await waitFor(() => expect(trigger).toHaveFocus());
});
it("mobile menu closes after following a navigation link", async () => {
  render(<SiteHeader />);
  fireEvent.click(screen.getByRole("button", { name: "Menyuni ochish" }));
  const nav = await screen.findByRole("navigation", { name: "Mobil menyu" });
  fireEvent.click(within(nav).getByRole("link", { name: "Maktab hayoti" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
});
