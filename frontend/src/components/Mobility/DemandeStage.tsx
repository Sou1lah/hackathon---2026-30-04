import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  ShieldCheck,
  Upload,
  User,
} from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import React, { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import useAuth from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

const STEPS = [
  { id: "personal", label: "Student Info", icon: User },
  { id: "organization", label: "Host Company", icon: Building2 },
  { id: "mission", label: "Mission Details", icon: Calendar },
  { id: "documents", label: "Attachments", icon: Upload },
]

export default function DemandeStage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [currentStep, setCurrentStep] = useState(0)
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "checking" | "verified" | "failed"
  >("idle")

  const [formData, setFormData] = useState({
    student_name: user?.full_name || "",
    registration_number: "",
    host_organization: "",
    organization_address: "",
    mission_title: "",
    mission_description: "",
    start_date: "",
    end_date: "",
  })

  const updateForm = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleVerify = () => {
    setVerificationStatus("checking")
    setTimeout(() => {
      setVerificationStatus("verified")
      updateForm("registration_number", "21/340051") // Mock auto-fill
    }, 1500)
  }

  const nextStep = () => {
    if (currentStep === STEPS.length - 1) {
      handleSubmit()
    } else {
      setCurrentStep((p) => Math.min(p + 1, STEPS.length - 1))
    }
  }
  const prevStep = () => setCurrentStep((p) => Math.max(p - 1, 0))

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
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
          student_name: data.student_name,
          registration_number: data.registration_number,
          mission_title: data.mission_title,
          mission_description: data.mission_description,
          status: "pending_verification",
          progress: 10,
          current_step: 1,
        }),
      })
      if (!irRes.ok) throw new Error("Failed to create request")
      const ir = await irRes.json()

      // 2. Create Convention (Initial)
      const convRes = await fetch(`${apiUrl}/api/v1/conventions/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          document_name: `Convention_${data.mission_title.replace(/\s+/g, "_")}.pdf`,
          internship_request_id: ir.id,
          status: "pending",
        }),
      })
      if (!convRes.ok) throw new Error("Failed to create convention")
      
      return ir
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["internship-requests"] })
      navigate({ to: "/convention" })
    },
  })

  const handleSubmit = () => {
    mutation.mutate(formData)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 p-2">
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            New Internship Request
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Fill out the form below to initiate your internship administrative workflow.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant={
              verificationStatus === "verified"
                ? "default"
                : verificationStatus === "failed"
                  ? "destructive"
                  : "secondary"
            }
            className={cn(
              "px-4 py-1.5 font-mono text-[10px] tracking-widest gap-2 border-none",
              verificationStatus === "checking" && "animate-pulse",
            )}
          >
            {verificationStatus === "checking" ? (
              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : verificationStatus === "verified" ? (
              <ShieldCheck size={14} />
            ) : (
              <AlertCircle size={14} />
            )}
            {verificationStatus === "idle"
              ? "PROGRES VERIFICATION REQUIRED"
              : verificationStatus === "checking"
                ? "VERIFICATION IN PROGRESS"
                : verificationStatus === "verified"
                  ? "ELIGIBILITY CONFIRMED"
                  : "FAILED"}
          </Badge>
          {verificationStatus === "idle" && (
            <Button
              size="sm"
              onClick={handleVerify}
              className="h-8 rounded-full font-bold text-[10px] tracking-wider uppercase bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900"
            >
              Verify Identity
            </Button>
          )}
        </div>
      </div>

      {/* Stepper */}
      <div className="grid grid-cols-4 gap-4">
        {STEPS.map((step, i) => (
          <div key={step.id} className="relative">
            <div
              className={cn(
                "flex flex-col gap-2 p-4 rounded-xl border transition-all cursor-default",
                currentStep === i
                  ? "bg-zinc-50 dark:bg-zinc-900 border-zinc-900 dark:border-zinc-50 shadow-sm"
                  : currentStep > i
                    ? "bg-zinc-50/50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800"
                    : "bg-transparent border-zinc-100 dark:border-zinc-900",
              )}
            >
              <div className="flex items-center justify-between">
                <step.icon
                  size={16}
                  className={cn(
                    currentStep === i
                      ? "text-zinc-900 dark:text-zinc-50"
                      : currentStep > i
                        ? "text-emerald-500"
                        : "text-zinc-300 dark:text-zinc-700",
                  )}
                />
                {currentStep > i && (
                  <CheckCircle2 size={16} className="text-emerald-500" />
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-bold uppercase tracking-widest",
                  currentStep === i
                    ? "text-zinc-900 dark:text-zinc-50"
                    : "text-zinc-400",
                )}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-20">
                <ChevronRight
                  size={16}
                  className="text-zinc-200 dark:text-zinc-800"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Form Content */}
      <Card className="border-zinc-200 dark:border-zinc-800 shadow-none min-h-[500px] flex flex-col overflow-hidden bg-white dark:bg-zinc-950">
        <CardContent className="p-10 flex-1">
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                      Full Name
                    </Label>
                    <Input
                      type="text"
                      placeholder="Ex: John Doe"
                      value={formData.student_name}
                      onChange={(e) => updateForm("student_name", e.target.value)}
                      className="border-zinc-200 dark:border-zinc-800 bg-zinc-50/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                      Registration Number
                    </Label>
                    <Input
                      type="text"
                      placeholder="Verify to auto-fill"
                      readOnly
                      value={formData.registration_number}
                      className="border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 font-mono"
                    />
                  </div>
                </div>
                <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded-xl flex gap-3 text-emerald-700 dark:text-emerald-400 text-sm">
                  <ShieldCheck size={18} className="shrink-0" />
                  <p>
                    Once verified, your academic record is securely linked to this request.
                  </p>
                </div>
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                      Host Organization / Company Name
                    </Label>
                    <Input
                      placeholder="Ex: Sonatrach, Ooredoo, etc."
                      value={formData.host_organization}
                      onChange={(e) => updateForm("host_organization", e.target.value)}
                      className="border-zinc-200 dark:border-zinc-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                      Organization Address
                    </Label>
                    <Input
                      placeholder="Full legal address of the host entity"
                      value={formData.organization_address}
                      onChange={(e) => updateForm("organization_address", e.target.value)}
                      className="border-zinc-200 dark:border-zinc-800"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                      Internship Title / Mission
                    </Label>
                    <Input
                      placeholder="Ex: Web Application Development Internship"
                      value={formData.mission_title}
                      onChange={(e) => updateForm("mission_title", e.target.value)}
                      className="border-zinc-200 dark:border-zinc-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                      Mission Description
                    </Label>
                    <textarea
                      rows={4}
                      placeholder="Briefly describe your main tasks and objectives…"
                      value={formData.mission_description}
                      onChange={(e) => updateForm("mission_description", e.target.value)}
                      className="flex w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-zinc-900/20 dark:focus-visible:ring-zinc-50/20 resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                        Start Date
                      </Label>
                      <Input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => updateForm("start_date", e.target.value)}
                        className="border-zinc-200 dark:border-zinc-800"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                        End Date
                      </Label>
                      <Input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => updateForm("end_date", e.target.value)}
                        className="border-zinc-200 dark:border-zinc-800"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-10"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Transcript",
                    "Cover Letter",
                    "Updated CV",
                    "Insurance Certificate",
                  ].map((doc) => (
                    <div
                      key={doc}
                      className="p-5 border border-zinc-100 dark:border-zinc-900 rounded-xl hover:border-zinc-900 dark:hover:border-zinc-50 transition-all group flex items-center justify-between bg-zinc-50/30 dark:bg-zinc-950/30"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white dark:bg-zinc-900 shadow-sm rounded-lg flex items-center justify-center text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-50 transition-colors border border-zinc-100 dark:border-zinc-800">
                          <FileText size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-zinc-900 dark:text-zinc-50">
                            {doc}
                          </p>
                          <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">
                            PDF (Max 5MB)
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-[10px] font-bold uppercase tracking-widest px-4 border-zinc-200 dark:border-zinc-800"
                      >
                        Upload
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="p-8 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center">
                  <p className="text-sm text-zinc-500">
                    Submit your request to begin the validation workflow.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>

        <CardFooter className="p-6 bg-zinc-50/50 dark:bg-zinc-950/50 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={prevStep}
            className={cn(
              "gap-2 font-bold text-xs uppercase tracking-widest",
              currentStep === 0 && "opacity-0 pointer-events-none",
            )}
          >
            <ChevronLeft size={16} /> Previous
          </Button>

          <div className="flex items-center gap-4">
            <Button
              onClick={nextStep}
              disabled={verificationStatus !== "verified" || mutation.isPending}
              className={cn(
                "gap-2 px-8 font-bold text-xs uppercase tracking-widest transition-all",
                verificationStatus === "verified"
                  ? "bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 shadow-md hover:opacity-90"
                  : "bg-zinc-100 dark:bg-zinc-900 text-zinc-400 cursor-not-allowed",
              )}
            >
              {mutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : currentStep === STEPS.length - 1 ? (
                "Submit Request"
              ) : (
                "Continue"
              )}
              {mutation.isPending ? null : <ChevronRight size={16} />}
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      {mutation.error && (
        <p className="text-center text-red-500 text-xs font-mono uppercase tracking-widest">
          Error: {mutation.error.message}
        </p>
      )}
    </div>
  )
}

