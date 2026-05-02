import { createFileRoute } from "@tanstack/react-router"
import TutorManagement from "@/components/Tutor/TutorManagement"

export const Route = createFileRoute("/_layout/tutor")({
  component: TutorPage,
  head: () => ({
    meta: [{ title: "Tutor Management – UBMA" }],
  }),
})

function TutorPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-[42px] font-extrabold tracking-tight text-foreground leading-[1.1] mb-2">
          Tutor Management
        </h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium">
          Manage your students, search for new mentees, and track their progress.
        </p>
      </div>
      <TutorManagement />
    </div>
  )
}
