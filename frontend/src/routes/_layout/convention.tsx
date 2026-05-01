import { createFileRoute } from "@tanstack/react-router"
import ConventionStage from "@/components/Mobility/ConventionStage"
import { ConventionManagement } from "@/components/Admin/ConventionManagement"
import useAuth from "@/hooks/useAuth"
import AccessDenied from "@/components/Common/AccessDenied"

export const Route = createFileRoute("/_layout/convention")({
  component: ConventionPage,
  head: () => ({
    meta: [{ title: "Convention de Stage - E-Learning" }],
  }),
})

function ConventionPage() {
  const { user } = useAuth()

  if (!user) return null

  // DB-driven access control — render only if can_view_convention is true
  if (!user.can_view_convention && !user.is_superuser) {
    return <AccessDenied page="Convention de Stage" />
  }

  // Admin View: If user has review permissions, show the management table.
  // Otherwise, show the student's personal convention stage tracker.
  if (user.can_review_applications || user.is_superuser) {
    return (
      <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
        <div className="space-y-2">
          <h1 className="text-4xl font-serif tracking-tight">Espace <span className="gradient-text">Administratif</span></h1>
          <p className="text-muted-foreground">Vue consolidée des conventions de stage en attente de validation.</p>
        </div>
        <ConventionManagement />
      </div>
    )
  }

  return <ConventionStage />
}
