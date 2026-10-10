import { createFileRoute } from "@tanstack/react-router";
import { handlePublicApi } from "@/server/public-api";

type CloudflareRequest = Request & {
  runtime?: { cloudflare?: { env?: CloudflareBindings } };
};

const handle = ({ request }: { request: Request }) =>
  handlePublicApi(request, (request as CloudflareRequest).runtime?.cloudflare?.env);

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
