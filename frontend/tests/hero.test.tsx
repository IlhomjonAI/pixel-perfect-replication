import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { Hero } from "@/components/site/Hero";
afterEach(cleanup);
it("shows the homepage actions without slideshow buttons", () => {
  render(<Hero />);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Bugungi bilim.");
  expect(screen.getByRole("link", { name: /Maktab bilan tanishing/ })).toHaveAttribute(
    "href",
    "/maktab",
  );
  expect(screen.getByRole("link", { name: /Murojaat yuborish/ })).toHaveAttribute("href", "/aloqa");
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
});
it("falls back when a photograph fails and keeps content visible if all fail", () => {
  const { container } = render(<Hero />);
  const first = container.querySelector(".hero-slide img")!;
  const src = first.getAttribute("src");
  fireEvent.error(first);
  expect(container.querySelector(".hero-slide img")).not.toHaveAttribute("src", src);
  while (container.querySelector(".hero-slide img"))
    fireEvent.error(container.querySelector(".hero-slide img")!);
  expect(screen.getByRole("heading", { level: 1 })).toBeVisible();
});
