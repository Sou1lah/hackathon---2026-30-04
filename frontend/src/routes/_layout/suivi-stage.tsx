import { createFileRoute } from "@tanstack/react-router"
import SuiviStageFeature from "@/components/Mobility/SuiviStageFeature"
import useAuth from "@/hooks/useAuth"
import AccessDenied from "@/components/Common/AccessDenied"

export const Route = createFileRoute("/_layout/suivi-stage")({
  component: SuiviStagePage,
  head: () => ({
    meta: [{ title: "Suivi de Stage - E-Learning" }],
  }),
})

function SuiviStagePage() {
  const { user } = useAuth()

  if (!user) return null

  // Minimal access control — allow if student or admin
  if (!user.can_view_tracking && !user.is_superuser && !user.can_review_applications) {
    return <AccessDenied page="Suivi de Stage" />
  }

  return <SuiviStageFeature />
}
