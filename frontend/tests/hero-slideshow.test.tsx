import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { Hero } from "@/components/site/Hero";
import type { ComponentProps } from "react";
vi.mock("next/image", () => ({
  default: ({ src, alt, onLoad, onError }: ComponentProps<"img">) => (
    <img src={src} alt={alt} onLoad={onLoad} onError={onError} />
  ),
}));
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

it("keeps reduced-motion photographs still while allowing manual navigation", () => {
  vi.useFakeTimers();
  const matchMedia = window.matchMedia;
  vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
    ...matchMedia(query),
    matches: query === "(prefers-reduced-motion: reduce)",
  }));
  const { container } = render(<Hero />);
  container.querySelectorAll(".hero-slide img").forEach((image) => fireEvent.load(image));
  act(() => vi.advanceTimersByTime(6000));
  expect(container.querySelectorAll(".hero-slide")[0]).toHaveAttribute("data-active", "true");
  expect(container.querySelector(".hero-progress-track > span")).toHaveStyle({
    transform: "scaleX(0)",
  });
  fireEvent.click(screen.getByRole("button", { name: "Keyingi surat" }));
  expect(container.querySelectorAll(".hero-slide")[1]).toHaveAttribute("data-active", "true");
  act(() => vi.advanceTimersByTime(6000));
  expect(container.querySelectorAll(".hero-slide")[1]).toHaveAttribute("data-active", "true");
});
it("fills each line over six seconds and rotates three photos", () => {
  vi.useFakeTimers();
  const { container } = render(<Hero />);
  container.querySelectorAll(".hero-slide img").forEach((image) => fireEvent.load(image));
  expect(screen.getByRole("button", { name: "Keyingi surat" })).toBeInTheDocument();
  expect(container.querySelector(".hero-side-note")).toBeNull();
  const lines = container.querySelectorAll(".hero-progress-track > span");
  expect(lines).toHaveLength(3);
  act(() => vi.advanceTimersByTime(3000));
  expect(lines[0]).toHaveStyle({ transform: "scaleX(0.5)" });
  act(() => vi.advanceTimersByTime(3000));
  expect(container.querySelectorAll(".hero-slide")[1]).toHaveAttribute("data-active", "true");
  for (let i = 0; i < 2; i++) act(() => vi.advanceTimersByTime(6000));
  expect(container.querySelectorAll(".hero-slide")[0]).toHaveAttribute("data-active", "true");
});

it("supports selection and previous/next then continues autoplay", () => {
  vi.useFakeTimers();
  const { container } = render(<Hero />);
  container.querySelectorAll(".hero-slide img").forEach((image) => fireEvent.load(image));
  fireEvent.click(screen.getByRole("button", { name: "Keyingi surat" }));
  expect(container.querySelectorAll(".hero-slide")[1]).toHaveAttribute("data-active", "true");
  fireEvent.click(screen.getByRole("button", { name: "Oldingi surat" }));
  fireEvent.click(screen.getByRole("button", { name: /3-surat:/ }));
  act(() => vi.advanceTimersByTime(6000));
  expect(container.querySelectorAll(".hero-slide")[0]).toHaveAttribute("data-active", "true");
});
