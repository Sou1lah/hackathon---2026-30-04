import { createFileRoute } from "@tanstack/react-router"
import AddInternshipForm from "@/components/Admin/AddInternshipForm"
import RecommendationForm from "@/components/Mobility/RecommendationForm"
import useAuth from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout/stages")({
  component: StagesPage,
  head: () => ({
    meta: [{ title: "Internship – UBMA" }],
  }),
})

function StagesPage() {
  const { user } = useAuth()

  // Admins see the "Add Internship" creation form
  if (user?.is_superuser || user?.can_review_applications) {
    return <AddInternshipForm />
  }

  // Students see the recommendation / internship-request form
  return <RecommendationForm />
}
