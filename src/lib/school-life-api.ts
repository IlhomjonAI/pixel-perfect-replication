import { createServerFn } from "@tanstack/react-start";
import { getRequestD1 } from "@/lib/d1-binding";
import { paginationInput } from "@/lib/pagination";

const loadPage = createServerFn({ method: "GET" })
  .inputValidator(paginationInput)
  .handler(async ({ data }) => {
    const { listSchoolLife } = await import("@/server/db");
    return listSchoolLife(await getRequestD1(), data.limit, data.offset);
  });

export const getSchoolLifePage = (limit = 20, offset = 0) => loadPage({ data: { limit, offset } });
