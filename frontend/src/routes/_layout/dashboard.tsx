import { createFileRoute, redirect } from "@tanstack/react-router"
import OverviewDashboard from "@/components/Overview/OverviewDashboard"
import StudentHome from "@/components/Mobility/StudentHome"
import useAuth from "@/hooks/useAuth"
import AccessDenied from "@/components/Common/AccessDenied"

export const Route = createFileRoute("/_layout/dashboard")({
  component: DashboardPage,
  head: () => ({
    meta: [{ title: "Dashboard - E-Learning" }],
  }),
})

function DashboardPage() {
  const { user } = useAuth()

  // Wait until user data is available
  if (!user) return null

  // DB-driven access control — no role inference
  if (!user.can_access_dashboard && !user.is_superuser) {
    return <AccessDenied page="Dashboard" />
  }

  // Superusers and users with can_review_applications see the admin overview;
  // everyone else with can_access_dashboard sees the student home.
  if (user.is_superuser || user.can_review_applications) {
    return <OverviewDashboard />
  }

  return <StudentHome />
}
