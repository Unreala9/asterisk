import {
  Outlet,
  createRootRoute,
} from "@tanstack/react-router";
import { NotFoundPage } from "@/components/ui/404-page-not-found";

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: () => <NotFoundPage />,
});

function RootComponent() {
  return <Outlet />;
}
