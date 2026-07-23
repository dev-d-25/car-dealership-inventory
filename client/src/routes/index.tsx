import { createFileRoute, Link } from "@tanstack/react-router"
import { useState, useMemo, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { useAuth } from "@/contexts/auth-context"
import { vehicles, type Vehicle } from "@/lib/api"
import { vehicleKeys, vehicleQueryOptions } from "@/lib/queries"
import { vehicleCategories } from "@/lib/schemas"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ModeToggle } from "@/components/mode-toggle"
import { RiCarLine, RiSearchLine } from "@remixicon/react"

const CATEGORIES = ["All", ...vehicleCategories] as const

function CarGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-72 rounded-lg bg-muted animate-pulse" />
      ))}
    </div>
  )
}

function CarCard({ vehicle }: { vehicle: Vehicle }) {
  const queryClient = useQueryClient()
  const purchaseMutation = useMutation({
    mutationFn: () => vehicles.purchase(vehicle.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all })
    },
  })

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
      <div className="aspect-video bg-muted relative">
        {vehicle.imageUrl ? (
          <img
            src={vehicle.imageUrl}
            alt={`${vehicle.maker} ${vehicle.model}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <RiCarLine className="size-12 text-muted-foreground/50" />
          </div>
        )}
        <Badge className="absolute top-2 right-2" variant="secondary">
          {vehicle.category}
        </Badge>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          {vehicle.maker} {vehicle.model}
        </CardTitle>
        <CardDescription>
          {vehicle.quantity > 0 ? `${vehicle.quantity} in stock` : "Out of stock"}
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-auto">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <span className="text-xl font-bold truncate">
            ${vehicle.price.toLocaleString()}
          </span>
          <Button
            size="sm"
            className="whitespace-nowrap"
            disabled={vehicle.quantity === 0 || purchaseMutation.isPending}
            onClick={() => purchaseMutation.mutate()}
          >
            {purchaseMutation.isPending ? "Buying..." : "Purchase"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function HomePage() {
  const { user, loading: authLoading, isAuthorized } = useAuthGuard()
  const { signOut } = useAuth()

  const [makerSearch, setMakerSearch] = useState("")
  const [modelSearch, setModelSearch] = useState("")
  const [category, setCategory] = useState("All")
  const [sortBy, setSortBy] = useState<"createdAt" | "price">("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)

  const debouncedMaker = useMemo(() => makerSearch, [makerSearch])
  const debouncedModel = useMemo(() => modelSearch, [modelSearch])

  useEffect(() => {
    setPage(1)
  }, [debouncedMaker, debouncedModel, category, sortBy, sortOrder])

  const { data: vehiclesData, isLoading: vehiclesLoading } = useQuery(
    vehicleQueryOptions.search({
      maker: debouncedMaker || undefined,
      model: debouncedModel || undefined,
      category: category === "All" ? undefined : category,
      sortBy,
      sortOrder,
      page,
      limit: 12,
    })
  )

  const pagination = vehiclesData?.pagination

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
      </div>
    )
  }

  if (!isAuthorized || !user) {
    return null
  }

  const isAdmin = user.role === "admin" || user.role === "superadmin"

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold flex items-center gap-2">
            <RiCarLine className="size-5" />
            kata
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user.name}
            </span>
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              Logout
            </Button>
            <ModeToggle />
            {isAdmin && (
              <Button render={<Link to="/dashboard" />}>
                Dashboard
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Featured Vehicles</h2>
            <p className="text-muted-foreground mt-2">
              Browse our latest inventory of premium vehicles
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by maker..."
                value={makerSearch}
                onChange={(e) => setMakerSearch(e.target.value)}
                className="pl-9 w-full sm:w-48"
              />
            </div>
            <div className="relative">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by model..."
                value={modelSearch}
                onChange={(e) => setModelSearch(e.target.value)}
                className="pl-9 w-full sm:w-48"
              />
            </div>
            <Select value={category} onValueChange={(val) => val && setCategory(val)}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select
              value={`${sortBy}-${sortOrder}`}
              onValueChange={(value) => {
                if (!value) return
                const [newSortBy, newSortOrder] = value.split("-") as ["createdAt" | "price", "asc" | "desc"]
                setSortBy(newSortBy)
                setSortOrder(newSortOrder)
              }}
            >
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue>
                  {sortBy === "createdAt" && sortOrder === "desc" && "Newest First"}
                  {sortBy === "createdAt" && sortOrder === "asc" && "Oldest First"}
                  {sortBy === "price" && sortOrder === "asc" && "Price: Low to High"}
                  {sortBy === "price" && sortOrder === "desc" && "Price: High to Low"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="createdAt-desc">Newest First</SelectItem>
                  <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {vehiclesLoading ? (
            <CarGridSkeleton />
          ) : vehiclesData?.data && vehiclesData.data.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {vehiclesData.data.map((vehicle: Vehicle) => (
                  <CarCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-8">
                  <p className="text-sm text-muted-foreground">
                    Showing {((pagination.currentPage - 1) * pagination.limit) + 1}–{Math.min(pagination.currentPage * pagination.limit, pagination.total)} of {pagination.total} vehicles
                  </p>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page >= pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <RiCarLine className="mx-auto size-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No vehicles found matching your search.</p>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground">
          kata - Premium Car Dealership Inventory System
        </div>
      </footer>
    </div>
  )
}

export const Route = createFileRoute("/")({
  component: HomePage,
})
