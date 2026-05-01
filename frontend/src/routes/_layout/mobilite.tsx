import { createFileRoute, useSearch } from "@tanstack/react-router"
import { z } from "zod"
import MobilityView from "@/components/Mobility/MobilityView"

const mobiliteSearchSchema = z.object({
  type: z.enum(["national", "international"]).catch("national"),
})

export const Route = createFileRoute("/_layout/mobilite")({
  validateSearch: mobiliteSearchSchema,
  component: MobilitePage,
  head: () => ({
    meta: [{ title: "Mobility - UBMA" }],
  }),
})

function MobilitePage() {
  const { type } = useSearch({ from: "/_layout/mobilite" })
  return <MobilityView type={type} />
}
