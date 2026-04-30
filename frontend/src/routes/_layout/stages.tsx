import { createFileRoute } from "@tanstack/react-router"
import DemandeStage from "@/components/Mobility/DemandeStage"

export const Route = createFileRoute("/_layout/stages")({
  component: StagesPage,
  head: () => ({
    meta: [{ title: "Demande de Stage - Mobilité & Stages" }],
  }),
})

function StagesPage() {
  return <DemandeStage />
}
