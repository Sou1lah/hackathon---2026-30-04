import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import useAuth from "@/hooks/useAuth"

export function useApplyInternship() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (offer: { title: string; description: string | null }) => {
      const token = localStorage.getItem("access_token")
      const apiUrl = import.meta.env.VITE_API_URL || ""

      // 1. Create Internship Request
      const irRes = await fetch(`${apiUrl}/api/v1/internship-requests/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          student_name: user?.full_name || "Etudiant",
          registration_number: "AUTO-GEN",
          mission_title: offer.title,
          mission_description: offer.description || "",
          status: "pending_signature",
          verification_status: "verified",
          progress: 25,
          current_step: 1,
        }),
      })
      if (!irRes.ok) throw new Error("Failed to create internship request")
      const ir = await irRes.json()

      // 2. Create Convention (Initial)
      const convRes = await fetch(`${apiUrl}/api/v1/conventions/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          document_name: `Convention_${offer.title.replace(/\s+/g, "_")}.pdf`,
          internship_request_id: ir.id,
          status: "pending",
        }),
      })
      if (!convRes.ok) throw new Error("Failed to create convention")
      
      return ir
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-conventions"] })
      queryClient.invalidateQueries({ queryKey: ["internship-requests"] })
      navigate({ to: "/convention" })
    },
  })
}
