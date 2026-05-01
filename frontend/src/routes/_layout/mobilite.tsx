import { createFileRoute, useSearch } from "@tanstack/react-router"
import { z } from "zod"
import MobilityView from "@/components/Mobility/MobilityView"

const mobiliteSearchSchema = z.object({
  type: z.enum(["nationale", "internationale"]).catch("nationale"),
})

export const Route = createFileRoute("/_layout/mobilite")({
  validateSearch: mobiliteSearchSchema,
  component: MobilitePage,
  head: () => ({
    meta: [{ title: "Mobilité - Mobilité & Stages" }],
  }),
})

function MobilitePage() {
  const { type } = useSearch({ from: "/_layout/mobilite" })
  return <MobilityView type={type} />
}
