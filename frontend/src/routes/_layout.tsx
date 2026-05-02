import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { useEffect } from "react"
import { OpenAPI } from "@/client"

import { Footer } from "@/components/Common/Footer"
import { Header } from "@/components/Common/Header"
import AppSidebar from "@/components/Sidebar/AppSidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { isLoggedIn } from "@/hooks/useAuth"


export const Route = createFileRoute("/_layout")({
  component: Layout,
  beforeLoad: async () => {
    if (!isLoggedIn()) {
      throw redirect({
        to: "/login",
      })
    }
  },
})

function Layout() {
  useEffect(() => {
    // Run the scraping system every time we enter the site
    fetch(`${OpenAPI.BASE}/api/v1/internships/refresh`).catch(console.error)
  }, [])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex-1 w-full overflow-y-auto">
          <div className="w-full px-6 md:px-10 py-6">
            <Outlet />
          </div>
        </main>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  )
}

export default Layout
