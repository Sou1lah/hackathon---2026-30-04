import { createFileRoute } from "@tanstack/react-router"
import OverviewDashboard from "@/components/Overview/OverviewDashboard"

export const Route = createFileRoute("/_layout/dashboard")({
  component: OverviewDashboard,
  head: () => ({
    meta: [{ title: "Dashboard - Mobility Hub" }],
  }),
})
