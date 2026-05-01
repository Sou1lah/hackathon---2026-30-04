import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
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
import { cn } from "@/lib/utils"

const STEPS = [
  { id: "personal", label: "Student Info", icon: User },
  { id: "organization", label: "Host Company", icon: Building2 },
  { id: "mission", label: "Mission Details", icon: Calendar },
  { id: "documents", label: "Attachments", icon: Upload },
]

export default function DemandeStage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "checking" | "verified" | "failed"
  >("idle")

  const handleVerify = () => {
    setVerificationStatus("checking")
    setTimeout(() => setVerificationStatus("verified"), 2000)
  }

  const nextStep = () =>
    setCurrentStep((p) => Math.min(p + 1, STEPS.length - 1))
  const prevStep = () => setCurrentStep((p) => Math.max(p - 1, 0))

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 p-2">
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            New Internship Request
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Multi-sector internship submission form.
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
              Start
            </Button>
          )}
        </div>
      </div>

      {/* Stepper - Geist Aesthetic */}
      <div className="grid grid-cols-4 gap-4">
        {STEPS.map((step, i) => (
          <div key={step.id} className="relative">
            <div
              className={cn(
                "flex flex-col gap-2 p-4 rounded-xl border transition-all",
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
      <Card className="border-zinc-200 dark:border-zinc-800 shadow-none min-h-[500px] flex flex-col">
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
                      className="border-zinc-200 dark:border-zinc-800 bg-zinc-50/30"
                      defaultValue="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                      Registration Number
                    </Label>
                    <Input
                      type="text"
                      placeholder="Ex: 20/00123"
                      className="border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 font-mono"
                      defaultValue="21/340051"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                      Date of Birth
                    </Label>
                    <Input
                      type="date"
                      className="border-zinc-200 dark:border-zinc-800 bg-zinc-50/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                      Academic Email
                    </Label>
                    <Input
                      type="email"
                      placeholder="k.elbouni@institution.dz"
                      className="border-zinc-200 dark:border-zinc-800 bg-zinc-50/30"
                    />
                  </div>
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-xl flex gap-3 text-zinc-500 text-sm">
                  <AlertCircle size={18} className="shrink-0 text-zinc-400" />
                  <p className="italic">
                    Student information is synchronized with your PROGRES file.
                  </p>
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
                            PDF, JPG (Max 5MB)
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-[10px] font-bold uppercase tracking-widest px-4 border-zinc-200 dark:border-zinc-800"
                      >
                        Choose
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="p-12 border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-950/30 rounded-2xl flex flex-col items-center text-center space-y-4">
                  <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 text-zinc-400 rounded-full flex items-center justify-center">
                    <Upload size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-50">
                      Global Drop Zone
                    </h3>
                    <p className="text-zinc-500 text-sm">
                      Drag and drop your documents here.
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    className="rounded-full px-8 bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 hover:opacity-90 transition-all"
                  >
                    Browse
                  </Button>
                </div>
              </motion.div>
            )}

            {currentStep !== 0 && currentStep !== 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full text-zinc-400"
              >
                <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-950 rounded-full border border-zinc-100 dark:border-zinc-900 flex items-center justify-center mb-4">
                  {React.createElement(STEPS[currentStep].icon, {
                    size: 32,
                    className: "text-zinc-300",
                  })}
                </div>
                <p className="font-mono text-xs uppercase tracking-widest italic">
                  Configuring "{STEPS[currentStep].label}"...
                </p>
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
              variant="link"
              className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest hover:text-zinc-900 dark:hover:text-zinc-50"
            >
              Save draft
            </Button>
            <Button
              onClick={nextStep}
              disabled={verificationStatus !== "verified"}
              className={cn(
                "gap-2 px-8 font-bold text-xs uppercase tracking-widest transition-all",
                verificationStatus === "verified"
                  ? "bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 shadow-md hover:opacity-90"
                  : "bg-zinc-100 dark:bg-zinc-900 text-zinc-400 cursor-not-allowed",
              )}
            >
              {currentStep === STEPS.length - 1 ? "Submit" : "Continue"}
              <ChevronRight size={16} />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
