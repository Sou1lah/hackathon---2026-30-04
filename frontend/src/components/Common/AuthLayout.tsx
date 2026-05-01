import { motion } from "motion/react"
import { Appearance } from "@/components/Common/Appearance"
import { Logo } from "@/components/Common/Logo"
import { Footer } from "./Footer"

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-background">
      <div className="relative hidden lg:flex lg:items-center lg:justify-center overflow-hidden bg-foreground">
        {/* Animated Background for Auth */}
        <div className="absolute inset-0 dot-pattern opacity-[0.05] text-accent" />
        <div className="absolute -bottom-24 -left-24 size-96 bg-accent/20 rounded-full blur-[120px]" />
        <div className="absolute -top-24 -right-24 size-96 bg-accent-secondary/10 rounded-full blur-[120px]" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10"
        >
          <Logo variant="full" className="h-20 invert" asLink={false} />
        </motion.div>
      </div>

      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-end">
          <Appearance />
        </div>
        <main className="flex flex-1 items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-sm"
          >
            {children}
          </motion.div>
        </main>
        <Footer />
      </div>
    </div>
  )
}
