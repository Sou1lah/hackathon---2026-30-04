import { createFileRoute } from "@tanstack/react-router"
import Dashboard from "@/components/Mobility/Dashboard"

export const Route = createFileRoute("/_layout/")({
  component: DashboardPage,
  head: () => ({
    meta: [{ title: "Tableau de Bord - Mobilité & Stages" }],
  }),
})

function DashboardPage() {
  return <Dashboard />
}
