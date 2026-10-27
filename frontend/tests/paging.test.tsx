import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useLoadMore } from "@/hooks/use-load-more";

const keyOf = (value: number) => String(value);

function Harness({
  initial,
  pageSize,
  load,
}: {
  initial: number[];
  pageSize: number;
  load: (offset: number) => Promise<number[]>;
}) {
  const paging = useLoadMore({ initial, pageSize, keyOf, load });
  return (
    <div>
      <ul>
        {paging.items.map((item) => (
          <li key={String(item)}>{item}</li>
        ))}
      </ul>
      <output data-testid="has-more">{paging.hasMore ? "more" : "none"}</output>
      <output data-testid="loading">{paging.loading ? "loading" : "idle"}</output>
      <output data-testid="error">{paging.error}</output>
      <button onClick={() => void paging.loadMore()}>Ko‘proq yuklash</button>
    </div>
  );
}

const items = () => Array.from(screen.getAllByRole("listitem")).map((node) => node.textContent);

function loadButton() {
  return screen.getByRole("button", { name: "Ko‘proq yuklash" });
}

afterEach(cleanup);

describe("useLoadMore", () => {
  it("ignores a stale page that resolves after the initial list is replaced", async () => {
    let resolveLoad!: (value: number[]) => void;
    const load = vi.fn(
      () =>
        new Promise<number[]>((resolve) => {
          resolveLoad = resolve;
        }),
    );
    const { rerender } = render(<Harness initial={[1, 2]} pageSize={2} load={load} />);

    fireEvent.click(loadButton());
    expect(load).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("loading")).toHaveTextContent("loading");

    // The route loader provides a fresh list while the old request is pending.
    rerender(<Harness initial={[7, 8, 9]} pageSize={2} load={load} />);
    await waitFor(() => expect(screen.getByText("7")).toBeInTheDocument());
    expect(items()).toEqual(["7", "8", "9"]);
    expect(screen.getByTestId("loading")).toHaveTextContent("idle");

    // The stale response now arrives and must not touch the reset list.
    await act(async () => {
      resolveLoad([3, 4]);
    });

    expect(items()).toEqual(["7", "8", "9"]);
    expect(screen.getByTestId("has-more")).toHaveTextContent("none");
    expect(screen.getByTestId("loading")).toHaveTextContent("idle");
    expect(screen.getByTestId("error")).toHaveTextContent("");
  });

  it("appends a page, de-duplicates and advances by the raw page length", async () => {
    const load = vi.fn(async () => [2, 3, 3, 4]);
    render(<Harness initial={[1, 2]} pageSize={2} load={load} />);
    expect(screen.getByTestId("has-more")).toHaveTextContent("more");

    fireEvent.click(loadButton());

    await waitFor(() => expect(screen.getByText("4")).toBeInTheDocument());
    // 2 (existing) and the repeated 3 are dropped; order is preserved.
    expect(items()).toEqual(["1", "2", "3", "4"]);
    // The raw page length is 4, so no page remains.
    await waitFor(() => expect(screen.getByTestId("has-more")).toHaveTextContent("none"));
    expect(screen.getByTestId("loading")).toHaveTextContent("idle");
    expect(screen.getByTestId("error")).toHaveTextContent("");
  });

  it("does not start a second request while one is still loading", async () => {
    let resolveLoad!: (value: number[]) => void;
    const load = vi.fn(
      () =>
        new Promise<number[]>((resolve) => {
          resolveLoad = resolve;
        }),
    );
    render(<Harness initial={[1, 2]} pageSize={2} load={load} />);

    fireEvent.click(loadButton());
    fireEvent.click(loadButton());
    expect(load).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveLoad([3, 4]);
    });
    await waitFor(() => expect(screen.getByText("4")).toBeInTheDocument());
    expect(load).toHaveBeenCalledTimes(1);
    expect(items()).toEqual(["1", "2", "3", "4"]);
  });
});
