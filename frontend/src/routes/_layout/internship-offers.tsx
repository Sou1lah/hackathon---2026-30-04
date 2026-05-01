import { createFileRoute } from "@tanstack/react-router"
import InternshipOffers from "@/components/Internships/InternshipOffers"

export const Route = createFileRoute("/_layout/internship-offers")({
  component: InternshipOffersPage,
  head: () => ({
    meta: [{ title: "University Internship Offers" }],
  }),
})

function InternshipOffersPage() {
  return <InternshipOffers />
}
