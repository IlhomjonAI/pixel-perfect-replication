import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import Teachers from "@/views/Teachers";
import { SCHOOL_TEACHERS } from "@school/contracts/staff";
import { matchesSearch } from "@/lib/search";

afterEach(cleanup);

it.each([
  "G'AYRATOVICH",
  "G‘ayratovich",
  "G’ayratovich",
  "Gʻayratovich",
  "Gʼayratovich",
  "Gayratovich",
])("finds Uzbek names with the query %s", (query) => {
  expect(matchesSearch("Abduxoliqov Behzod G‘ayratovich", query)).toBe(true);
  expect(matchesSearch("Akbaraliyev Jahongir Kamolidinovich", query)).toBe(false);
});

it("searches names and subjects in any order and returns focus after clearing", () => {
  const { container } = render(<Teachers initialData={SCHOOL_TEACHERS} />);
  const search = screen.getByRole("searchbox", { name: "O‘qituvchini qidirish" });
  fireEvent.change(search, { target: { value: "  matematika   g'ayratovich behzod  " } });
  expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent("1 ta ustoz");
  expect(screen.getByRole("link", { name: /Abduxoliqov Behzod/ })).toBeInTheDocument();
  const clear = screen.getByRole("button", { name: "Qidiruvni tozalash" });
  clear.focus();
  fireEvent.click(clear);
  expect(search).toHaveFocus();
  expect(search).toHaveValue("");
  expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent("29 ta ustoz");
});
