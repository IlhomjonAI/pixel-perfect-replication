import { LoadingState } from "@/components/site/common";
import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPendingComponent: () => <LoadingState label="Sahifa yuklanmoqda…" />,
    defaultPendingMs: 250,
    defaultPendingMinMs: 250,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
