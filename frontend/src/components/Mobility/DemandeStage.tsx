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
import { cn } from "@/lib/utils"

const STEPS = [
  { id: "personal", label: "Infos Étudiant", icon: User },
  { id: "organization", label: "Entreprise d'Accueil", icon: Building2 },
  { id: "mission", label: "Détails Mission", icon: Calendar },
  { id: "documents", label: "Pièces Jointes", icon: Upload },
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

  const inputCls =
    "w-full px-4 py-3 bg-accent border border-border rounded-xl outline-none text-sm transition-all focus:bg-card focus:border-primary focus:ring-2 focus:ring-primary/20"

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Nouvelle Demande de Stage</h1>
          <p className="text-muted-foreground">
            Formulaire multisectoriel de soumission de stage.
          </p>
        </div>
        <div
          className={cn(
            "flex items-center gap-3 px-4 py-2 rounded-full border transition-all shadow-sm",
            verificationStatus === "idle" &&
              "bg-card border-border text-muted-foreground",
            verificationStatus === "checking" &&
              "bg-blue-500/10 border-blue-500/30 text-blue-500 animate-pulse",
            verificationStatus === "verified" &&
              "bg-green-500/10 border-green-500/30 text-green-500",
            verificationStatus === "failed" &&
              "bg-red-500/10 border-red-500/30 text-red-500",
          )}
        >
          {verificationStatus === "idle" && <AlertCircle size={18} />}
          {verificationStatus === "checking" && (
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          )}
          {verificationStatus === "verified" && <ShieldCheck size={18} />}
          <span className="text-sm font-bold">
            {verificationStatus === "idle"
              ? "Vérification PROGRES requise"
              : verificationStatus === "checking"
                ? "Vérification en cours..."
                : verificationStatus === "verified"
                  ? "Éligibilité Confirmée"
                  : "Échec"}
          </span>
          {verificationStatus === "idle" && (
            <button
              onClick={handleVerify}
              className="ml-2 text-xs bg-foreground text-background px-3 py-1 rounded-full font-bold hover:opacity-80"
            >
              Lancer
            </button>
          )}
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center justify-between">
          {STEPS.map((step, i) => (
            <React.Fragment key={step.id}>
              <div
                className={cn(
                  "flex flex-col items-center gap-2 relative z-10",
                  currentStep >= i ? "text-primary" : "text-muted-foreground",
                )}
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-all border-2",
                    currentStep === i
                      ? "bg-primary text-primary-foreground border-primary shadow-lg"
                      : currentStep > i
                        ? "bg-green-500 text-white border-green-500"
                        : "bg-card border-border",
                  )}
                >
                  {currentStep > i ? (
                    <CheckCircle2 size={22} />
                  ) : (
                    <step.icon size={22} />
                  )}
                </div>
                <span className="text-xs font-bold whitespace-nowrap uppercase tracking-wider">
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 px-4 -mt-6">
                  <div className="h-[2px] w-full bg-accent rounded-full">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: currentStep > i ? "100%" : "0%" }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden min-h-[500px] flex flex-col">
        <div className="p-8 flex-1">
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Nom Complet</label>
                    <input
                      type="text"
                      placeholder="Ex: El Bouni Khaled"
                      className={inputCls}
                      defaultValue="El Bouni Khaled"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">
                      Numéro d'Inscription
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 20/00123"
                      className={cn(inputCls, "font-mono")}
                      defaultValue="21/340051"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">
                      Date de Naissance
                    </label>
                    <input type="date" className={inputCls} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">
                      Email Académique
                    </label>
                    <input
                      type="email"
                      placeholder="k.elbouni@institution.dz"
                      className={inputCls}
                    />
                  </div>
                </div>
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex gap-3 text-blue-500 text-sm italic">
                  <AlertCircle size={20} className="shrink-0" />
                  Les informations étudiant sont synchronisées avec votre
                  dossier PROGRES.
                </div>
              </motion.div>
            )}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    "Relevé de notes",
                    "Lettre de Motivation",
                    "CV à jour",
                    "Attestation d'Assurance",
                  ].map((doc) => (
                    <div
                      key={doc}
                      className="p-6 border-2 border-dashed border-border rounded-2xl hover:border-primary transition-all group flex items-center justify-between bg-accent/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-card shadow-sm rounded-lg flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{doc}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                            PDF, JPG (Max 5MB)
                          </p>
                        </div>
                      </div>
                      <button className="bg-card border border-border px-4 py-2 rounded-lg text-xs font-bold hover:bg-foreground hover:text-background transition-all shadow-sm">
                        Choisir
                      </button>
                    </div>
                  ))}
                </div>
                <div className="p-8 border-2 border-dashed border-primary/30 bg-primary/5 rounded-3xl flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                    <Upload size={32} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Zone de dépôt globale</h3>
                    <p className="text-muted-foreground text-sm">
                      Glissez-déposez vos documents ici.
                    </p>
                  </div>
                  <button className="bg-primary text-primary-foreground px-6 py-2 rounded-full text-sm font-bold hover:opacity-90 shadow-lg transition-all">
                    Parcourir
                  </button>
                </div>
              </motion.div>
            )}
            {currentStep !== 0 && currentStep !== 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full text-muted-foreground italic"
              >
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-4">
                  {React.createElement(STEPS[currentStep].icon, { size: 32 })}
                </div>
                Contenu de l'étape "{STEPS[currentStep].label}" en cours de
                configuration...
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="p-6 bg-accent/50 border-t border-border flex items-center justify-between">
          <button
            onClick={prevStep}
            className={cn(
              "flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all",
              currentStep === 0
                ? "opacity-0 pointer-events-none"
                : "text-muted-foreground hover:bg-card border border-transparent hover:border-border",
            )}
          >
            <ChevronLeft size={18} /> Précédent
          </button>
          <div className="flex items-center gap-4">
            <button className="text-muted-foreground text-sm font-bold hover:text-foreground transition-colors">
              Sauvegarder brouillon
            </button>
            <button
              onClick={nextStep}
              disabled={verificationStatus !== "verified"}
              className={cn(
                "flex items-center gap-2 px-8 py-2 rounded-xl text-sm font-bold transition-all",
                verificationStatus !== "verified"
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-primary text-primary-foreground shadow-lg hover:opacity-90",
              )}
            >
              {currentStep === STEPS.length - 1 ? "Soumettre" : "Continuer"}{" "}
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
