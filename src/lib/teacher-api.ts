import { createServerFn } from "@tanstack/react-start";
import { getRequestD1 } from "@/lib/d1-binding";
import { paginationInput, slugInput } from "@/lib/pagination";

const loadPage = createServerFn({ method: "GET" })
  .inputValidator(paginationInput)
  .handler(async ({ data }) => {
    const { listTeachers } = await import("@/server/db");
    return listTeachers(await getRequestD1(), data.limit, data.offset);
  });

const loadTeacher = createServerFn({ method: "GET" })
  .inputValidator(slugInput)
  .handler(async ({ data }) => {
    const { getTeacherBySlug } = await import("@/server/db");
    return getTeacherBySlug(await getRequestD1(), data);
  });

export const getTeachersPage = (limit = 50, offset = 0) => loadPage({ data: { limit, offset } });
export const getDatabaseTeacher = (slug: string) => loadTeacher({ data: slug });
