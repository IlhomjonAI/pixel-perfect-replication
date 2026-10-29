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

it("keeps the photograph still when reduced motion is requested", () => {
  vi.useFakeTimers();
  const matchMedia = window.matchMedia;
  vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
    ...matchMedia(query),
    matches: query === "(prefers-reduced-motion: reduce)",
  }));
  const { container } = render(<Hero />);
  container.querySelectorAll(".hero-slide img").forEach((image) => fireEvent.load(image));
  act(() => vi.advanceTimersByTime(18000));
  expect(container.querySelectorAll(".hero-slide")[0]).toHaveAttribute("data-active", "true");
  expect(container.querySelector(".hero-progress-track > span")).toHaveStyle({
    transform: "scaleX(0)",
  });
});
it("fills each line over six seconds and rotates four photos without buttons", () => {
  vi.useFakeTimers();
  const { container } = render(<Hero />);
  container.querySelectorAll(".hero-slide img").forEach((image) => fireEvent.load(image));
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
  expect(container.querySelector(".hero-side-note")).toBeNull();
  const lines = container.querySelectorAll(".hero-progress-track > span");
  expect(lines).toHaveLength(4);
  act(() => vi.advanceTimersByTime(3000));
  expect(lines[0]).toHaveStyle({ transform: "scaleX(0.5)" });
  act(() => vi.advanceTimersByTime(3000));
  expect(container.querySelectorAll(".hero-slide")[1]).toHaveAttribute("data-active", "true");
  for (let i = 0; i < 3; i++) act(() => vi.advanceTimersByTime(6000));
  expect(container.querySelectorAll(".hero-slide")[0]).toHaveAttribute("data-active", "true");
});
