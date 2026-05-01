import { ShieldOff } from "lucide-react"

interface AccessDeniedProps {
  page?: string
}

/**
 * Shown when the current user's DB permission flags do not grant access
 * to the requested page. No role inference — purely based on DB boolean fields.
 */
export default function AccessDenied({ page }: AccessDeniedProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
      <div className="rounded-full bg-destructive/10 p-6">
        <ShieldOff className="size-12 text-destructive" strokeWidth={1.5} />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Accès refusé</h1>
        {page && (
          <p className="text-muted-foreground text-sm">
            Vous n'avez pas la permission d'accéder à{" "}
            <span className="font-medium text-foreground">{page}</span>.
          </p>
        )}
        <p className="text-muted-foreground text-sm">
          Contactez votre administrateur pour obtenir l'accès nécessaire.
        </p>
      </div>

      <div className="rounded-lg border bg-muted/40 px-6 py-3 text-xs text-muted-foreground max-w-sm">
        Les droits d'accès sont gérés par votre compte dans la base de données.
        Aucun rôle n'est codé en dur.
      </div>
    </div>
  )
}
