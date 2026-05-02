import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import useAuth from "@/hooks/useAuth"
import { InternshipsService, ConventionsService } from "@/client/sdk.gen"

export function useApplyInternship() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (offer: { title: string; description: string | null }) => {
      // 1. Create Internship Request
      const ir = await InternshipsService.createInternship({
        requestBody: {
          student_name: user?.full_name || "Student",
          registration_number: "AUTO-GEN",
          mission_title: offer.title,
          mission_description: offer.description || "",
          status: "pending_verification",
          progress: 15,
          current_step: 2,
        }
      })

      // 2. Create Convention (Initial)
      await ConventionsService.createConventionEndpoint({
        requestBody: {
          document_name: `Convention_${offer.title.replace(/\s+/g, "_")}.pdf`,
          internship_request_id: ir.id,
          status: "pending",
        }
      })
      
      return ir
    },
    onSuccess: () => {
      toast.promise(
        new Promise((resolve) => setTimeout(resolve, 1500)),
        {
          loading: "Processing your institutional application...",
          success: () => {
            queryClient.invalidateQueries({ queryKey: ["my-conventions"] })
            queryClient.invalidateQueries({ queryKey: ["internship-requests"] })
            navigate({ to: "/convention" })
            return "Application initialized! Redirecting to signature portal..."
          },
          error: "Success, but redirection failed. Please navigate to Conventions manually.",
        }
      )
    },
  })
}
