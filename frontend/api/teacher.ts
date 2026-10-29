import { apiGet } from "./client";
import type { Teacher } from "@school/contracts/models";
export const getTeachersPage = (limit = 50, offset = 0) =>
  apiGet<Teacher[]>(`teachers?limit=${limit}&offset=${offset}`);
export const getDatabaseTeacher = (slug: string) =>
  apiGet<Teacher | null>(`teachers/${encodeURIComponent(slug)}`, true);
