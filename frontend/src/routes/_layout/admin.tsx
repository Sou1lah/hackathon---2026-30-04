import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/admin")({
  component: () => <Outlet />,
  beforeLoad: async () => {
    // Note: We can't use useAuth here easily as it's a hook,
    // but we can check the context if it's provided in __root or similar.
    // However, usually we do it in the component or use a specialized check.
  },
})
