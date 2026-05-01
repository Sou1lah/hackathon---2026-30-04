import { createFileRoute } from "@tanstack/react-router"
import PartnershipsView from "@/components/Partnerships/PartnershipsView"

export const Route = createFileRoute("/_layout/partnerships")({
  component: PartnershipsView,
  head: () => ({
    meta: [{ title: "Institutional Conventions - UBMA" }],
  }),
})
