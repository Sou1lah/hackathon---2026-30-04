import { createFileRoute } from "@tanstack/react-router"
import AdminSuiviStage from "@/components/Admin/AdminSuiviStage"
import AccessDenied from "@/components/Common/AccessDenied"
import useAuth from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout/admin/suivi-stage")({
  component: AdminSuiviStagePage,
  head: () => ({
    meta: [{ title: "Tracking Administration - UBMA" }],
  }),
})

function AdminSuiviStagePage() {
  const { user } = useAuth()

  if (!user) return null

  // Strict access control for admin page
  if (!user.is_superuser && !user.can_review_applications) {
    return <AccessDenied page="Administration Suivi" />
  }

  return <AdminSuiviStage />
}
