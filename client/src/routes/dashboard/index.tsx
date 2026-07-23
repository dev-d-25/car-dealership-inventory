import { createFileRoute } from "@tanstack/react-router"
import { Suspense, lazy, useState, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { vehicleQueryOptions, vehicleKeys } from "@/lib/queries"
import { vehicles, purchases, type Vehicle } from "@/lib/api"
import { getVehicleColumns } from "@/components/vehicle-columns"
import { VehicleFormDialog } from "@/components/vehicle-form-dialog"
import { DeleteVehicleDialog } from "@/components/delete-vehicle-dialog"
import type { CreateVehicleInput } from "@/lib/schemas"
import { Button } from "@/components/ui/button"
import { RiAddLine } from "@remixicon/react"

const SectionCards = lazy(() =>
  import("@/components/section-cards").then((m) => ({ default: m.SectionCards }))
)
const ChartAreaInteractive = lazy(() =>
  import("@/components/chart-area-interactive").then((m) => ({ default: m.ChartAreaInteractive }))
)
const DataTable = lazy(() =>
  import("@/components/data-table").then((m) => ({ default: m.DataTable }))
)

function DashboardSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-4 py-4 px-4 lg:px-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
      <div className="h-80 rounded-lg bg-muted animate-pulse" />
      <div className="h-96 rounded-lg bg-muted animate-pulse" />
    </div>
  )
}

const DashboardIndex = () => {
  const queryClient = useQueryClient()
  const { data: response, isLoading: isLoadingVehicles } = useQuery(
    vehicleQueryOptions.search({ limit: 1000 })
  )
  const vehicleList: Vehicle[] = response?.data ?? []

  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () => purchases.getDashboardStats(),
  })
  const stats = statsData?.data

  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null)

  const createMutation = useMutation({
    mutationFn: (data: CreateVehicleInput) => vehicles.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all })
      setFormOpen(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateVehicleInput }) =>
      vehicles.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all })
      setFormOpen(false)
      setEditingVehicle(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => vehicles.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all })
      setDeleteOpen(false)
      setDeletingVehicle(null)
    },
  })

  const handleEdit = useCallback((vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setFormOpen(true)
  }, [])

  const handleDelete = useCallback((vehicle: Vehicle) => {
    setDeletingVehicle(vehicle)
    setDeleteOpen(true)
  }, [])

  const handleFormSubmit = useCallback(
    (data: CreateVehicleInput) => {
      if (editingVehicle) {
        updateMutation.mutate({ id: editingVehicle.id, data })
      } else {
        createMutation.mutate(data)
      }
    },
    [editingVehicle, createMutation, updateMutation]
  )

  const vehicleColumns = getVehicleColumns({ onEdit: handleEdit, onDelete: handleDelete })

  const totalModels = stats?.totalModels ?? 0
  const totalRevenue = stats?.totalRevenue ?? 0
  const outOfStockModels = stats?.outOfStockModels ?? 0

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <div className="flex flex-1 flex-col gap-4 py-4 px-4 lg:px-6">
        <SectionCards
          totalModels={totalModels}
          outOfStockModels={outOfStockModels}
          totalRevenue={totalRevenue}
        />
        <ChartAreaInteractive />
        {isLoadingVehicles || isLoadingStats ? (
          <div className="h-96 rounded-lg bg-muted animate-pulse" />
        ) : (
          <DataTable
            data={vehicleList}
            columns={vehicleColumns as any}
            actions={
              <Button size="sm" onClick={() => { setEditingVehicle(null); setFormOpen(true) }}>
                <RiAddLine className="size-4 mr-1" />
                Add Vehicle
              </Button>
            }
          />
        )}
      </div>

      <VehicleFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        vehicle={editingVehicle}
        onSubmit={handleFormSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteVehicleDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        vehicle={deletingVehicle}
        onConfirm={() => {
          if (deletingVehicle) deleteMutation.mutate(deletingVehicle.id)
        }}
        isPending={deleteMutation.isPending}
      />
    </Suspense>
  )
}

export const Route = createFileRoute("/dashboard/")({
  component: DashboardIndex,
})
