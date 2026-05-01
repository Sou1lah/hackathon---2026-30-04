import { createFileRoute } from "@tanstack/react-router"
import RecommendationForm from "@/components/Mobility/RecommendationForm"

export const Route = createFileRoute("/_layout/stages")({
  component: StagesPage,
  head: () => ({
    meta: [{ title: "Système de Recommandation - Mobilité & Stages" }],
  }),
})

function StagesPage() {
  return <RecommendationForm />
}
