import { apiGet } from "./client";
import type { SchoolLifeItem } from "@backend/contracts/models";
export const getSchoolLifePage = (limit = 20, offset = 0) =>
  apiGet<SchoolLifeItem[]>(`school-life?limit=${limit}&offset=${offset}`);
