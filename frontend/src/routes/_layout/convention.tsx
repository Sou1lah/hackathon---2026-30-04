import { createFileRoute } from "@tanstack/react-router"
import { ConventionManagement } from "@/components/Admin/ConventionManagement"
import AccessDenied from "@/components/Common/AccessDenied"
import StaticConvention from "@/components/Mobility/StaticConvention"
import PartnershipsView from "@/components/Partnerships/PartnershipsView"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import useAuth from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout/convention")({
  component: ConventionPage,
  head: () => ({
    meta: [{ title: "Conventions & Contracts - UBMA" }],
  }),
})

function ConventionPage() {
  const { user } = useAuth()

  if (!user) return null

  // DB-driven access control — render only if can_view_convention is true
  if (!user.can_view_convention && !user.is_superuser) {
    return <AccessDenied page="Internship Convention" />
  }

  const isAdmin = user.can_review_applications || user.is_superuser

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      <div className="space-y-2">
        <h1 className="text-4xl font-serif tracking-tight">
          {isAdmin ? "Administrative" : "My"}{" "}
          <span className="gradient-text">Space</span>
        </h1>
        <p className="text-muted-foreground">
          {isAdmin 
            ? "Consolidated view of internship conventions and institutional contracts." 
            : "Manage your personal internship agreements and view university partnerships."}
        </p>
      </div>

      <Tabs defaultValue="applications" className="space-y-8">
        <TabsList className="bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="applications" className="rounded-lg px-6 py-2.5 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
            {isAdmin ? "Internship Applications" : "My Convention"}
          </TabsTrigger>
          <TabsTrigger value="contracts" className="rounded-lg px-6 py-2.5 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
            Institutional Contracts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-4 outline-none">
          {isAdmin ? <ConventionManagement /> : <StaticConvention />}
        </TabsContent>

        <TabsContent value="contracts" className="space-y-4 outline-none">
          <PartnershipsView />
        </TabsContent>
      </Tabs>
    </div>
  )
}
