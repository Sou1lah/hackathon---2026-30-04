import { createFileRoute } from "@tanstack/react-router"
import InternshipManagement from "@/components/Admin/InternshipManagement"

export const Route = createFileRoute("/_layout/admin/internships")({
  component: InternshipManagement,
  head: () => ({
    meta: [{ title: "Manage Internships – Admin" }],
  }),
})
