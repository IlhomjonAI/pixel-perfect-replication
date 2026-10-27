import { apiGet } from "./client";
import type { Post } from "@backend/contracts/models";
export const getPostsPage = (limit = 50, offset = 0) =>
  apiGet<Post[]>(`posts?limit=${limit}&offset=${offset}`);
export const getDatabasePost = (slug: string) =>
  apiGet<Post | null>(`posts/${encodeURIComponent(slug)}`, true);
