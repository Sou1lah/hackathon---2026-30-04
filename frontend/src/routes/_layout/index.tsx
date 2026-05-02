import { createFileRoute, Navigate } from "@tanstack/react-router"
import useAuth from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout/")({
  component: IndexPage,
})

function IndexPage() {
  const { user } = useAuth()

  if (!user) {
    return null // Wait for user to be fetched
  }

  // Admins go to Dashboard
  if (user.is_superuser) {
    return <Navigate to="/dashboard" replace />
  }

  // Students default to the Internship Request page
  if (user.role?.startsWith("student")) {
    return <Navigate to="/stages" replace />
  }

  // Fallback for others
  if (user.can_access_dashboard) {
    return <Navigate to="/dashboard" replace />
  }
  
  return <Navigate to="/stages" replace />
}
