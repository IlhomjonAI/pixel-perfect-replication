import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
const loadPage = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      limit: z.number().int().min(1).max(50),
      offset: z.number().int().min(0).max(100000),
    }),
  )
  .handler(async ({ data }) => {
    const { getRequest } = await import("@tanstack/react-start/server");
    const { getD1, listSchoolLife } = await import("@/server/db");
    const request = getRequest() as Request & {
      runtime?: { cloudflare?: { env?: CloudflareBindings } };
    };
    return listSchoolLife(getD1(request.runtime?.cloudflare?.env), data.limit, data.offset);
  });
export const getSchoolLifePage = (limit = 20, offset = 0) => loadPage({ data: { limit, offset } });
