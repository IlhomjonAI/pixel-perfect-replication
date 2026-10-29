import { z } from "zod";

export const MAX_PAGE_SIZE = 50;
export const MAX_OFFSET = 100_000;

/** Shared bound for every public list endpoint. */
export const paginationInput = z.object({
  limit: z.number().int().min(1).max(MAX_PAGE_SIZE),
  offset: z.number().int().min(0).max(MAX_OFFSET),
});

/** Shared bound for public slug detail lookups. */
export const slugInput = z.string().min(1).max(200);
