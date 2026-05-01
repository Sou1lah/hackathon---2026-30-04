import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import AccessDenied from "@/components/Common/AccessDenied"
import SuiviStage from "@/components/Mobility/SuiviStage"
import useAuth from "@/hooks/useAuth"

const suiviSearchSchema = z.object({
  id: z.string().optional(),
})

export const Route = createFileRoute("/_layout/suivi")({
  component: SuiviPage,
  validateSearch: (search) => suiviSearchSchema.parse(search),
  head: () => ({
    meta: [{ title: "Internship Tracking - UBMA" }],
  }),
})

function SuiviPage() {
  const { id } = Route.useSearch()
  const { user } = useAuth()

  if (!user) return null

  // DB-driven access control — render only if can_view_tracking is true
  if (!user.can_view_tracking && !user.is_superuser) {
    return <AccessDenied page="Suivi de Stage" />
  }

  return <SuiviStage internshipId={id} />
}
