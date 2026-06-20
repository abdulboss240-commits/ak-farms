import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/goats")({
  component: () => <Outlet />,
});
