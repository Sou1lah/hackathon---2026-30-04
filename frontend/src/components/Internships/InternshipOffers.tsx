import { useQuery } from "@tanstack/react-query"
import { Briefcase, Calendar, ExternalLink, RefreshCcw } from "lucide-react"
import { OpenAPI } from "@/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface InternshipOffer {
  id: string
  title: string
  description: string | null
  source_url: string
  published_date: string | null
}

interface InternshipOffersResponse {
  data: InternshipOffer[]
  count: number
}

const fetchOffers = async (): Promise<InternshipOffersResponse> => {
  const response = await fetch(`${OpenAPI.BASE}/api/v1/internships/`)
  if (!response.ok) {
    throw new Error("Failed to fetch internship offers")
  }
  return response.json()
}

export default function InternshipOffers() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["internship-offers"],
    queryFn: fetchOffers,
  })

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden border-none shadow-md">
              <CardHeader className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-6 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-red-500 mb-4">
          Error loading offers: {(error as Error).message}
        </p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            University Internship Offers
          </h1>
          <p className="text-muted-foreground mt-1">
            Latest cooperation and internship opportunities from the official
            source.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 text-sm font-medium">
            {data?.count || 0} Offers Found
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="text-muted-foreground"
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.data.map((offer) => (
          <Card
            key={offer.id}
            className="group relative flex flex-col overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur-sm ring-1 ring-border/50 hover:ring-primary/20"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <CardHeader>
              <div className="flex items-center gap-2 mb-2 text-xs font-medium text-primary uppercase tracking-wider">
                <Briefcase className="h-3 w-3" />
                Cooperation
              </div>
              <CardTitle
                className="line-clamp-2 text-lg leading-snug group-hover:text-primary transition-colors cursor-pointer"
                dir="rtl"
              >
                {offer.title}
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-grow">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {offer.published_date
                  ? new Date(offer.published_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Date not available"}
              </div>
            </CardContent>

            <CardFooter className="pt-0">
              <Button
                asChild
                variant="secondary"
                className="w-full group/btn overflow-hidden relative"
              >
                <a
                  href={offer.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    View Details
                    <ExternalLink className="h-4 w-4 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
                  </span>
                  <div className="absolute inset-0 bg-primary opacity-0 group-hover/btn:opacity-10 transition-opacity" />
                </a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {data?.data.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed rounded-xl border-muted/20">
          <Briefcase className="h-12 w-12 mx-auto text-muted/30 mb-4" />
          <h3 className="text-lg font-medium">No offers found</h3>
          <p className="text-muted-foreground">
            Check back later for new opportunities.
          </p>
        </div>
      )}
    </div>
  )
}
