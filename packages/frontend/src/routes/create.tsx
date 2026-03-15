import { createFileRoute } from "@tanstack/react-router";
import CreateDashboard from "@/features/create/components/CreateDashboard";

export const Route = createFileRoute("/create")({
  component: RouteComponent,
});

function RouteComponent() {
  return <CreateDashboard />;
}
