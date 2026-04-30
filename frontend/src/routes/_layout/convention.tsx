import { createFileRoute } from "@tanstack/react-router"
import ConventionStage from "@/components/Mobility/ConventionStage"

export const Route = createFileRoute("/_layout/convention")({
  component: ConventionPage,
  head: () => ({
    meta: [{ title: "Convention de Stage - Mobilité & Stages" }],
  }),
})

function ConventionPage() {
  return <ConventionStage />
}
