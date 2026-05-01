import { createFileRoute } from "@tanstack/react-router"
import { ConventionManagement } from "@/components/Admin/ConventionManagement"
import AccessDenied from "@/components/Common/AccessDenied"
import StaticConvention from "@/components/Mobility/StaticConvention"
import useAuth from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout/convention")({
  component: ConventionPage,
  head: () => ({
    meta: [{ title: "Internship Convention - UBMA" }],
  }),
})

function ConventionPage() {
  const { user } = useAuth()

  if (!user) return null

  // DB-driven access control — render only if can_view_convention is true
  if (!user.can_view_convention && !user.is_superuser) {
    return <AccessDenied page="Internship Convention" />
  }

  // Admin View: If user has review permissions, show the management table.
  // Otherwise, show the student's personal convention stage tracker.
  if (user.can_review_applications || user.is_superuser) {
    return (
      <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
        <div className="space-y-2">
          <h1 className="text-4xl font-serif tracking-tight">
            Administrative <span className="gradient-text">Space</span>
          </h1>
          <p className="text-muted-foreground">
            Consolidated view of internship conventions awaiting validation.
          </p>
        </div>
        <ConventionManagement />
      </div>
    )
  }

  return <StaticConvention />
}
