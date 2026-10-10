import { createFileRoute } from "@tanstack/react-router";
import { handlePublicApi } from "@/server/public-api";
import { handleAdminAuth } from "@/server/admin-auth";

type CloudflareRequest = Request & {
  runtime?: { cloudflare?: { env?: CloudflareBindings } };
};

const handle = ({ request }: { request: Request }) =>
  (new URL(request.url).pathname.startsWith("/api/admin/") ? handleAdminAuth : handlePublicApi)(
    request,
    (request as CloudflareRequest).runtime?.cloudflare?.env,
  );

export const Route = createFileRoute("/api/$")({
  server: {
    handlers: {
      GET: handle,
      POST: handle,
      PUT: handle,
      PATCH: handle,
      DELETE: handle,
      OPTIONS: handle,
      HEAD: handle,
    },
  },
});
