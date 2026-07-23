import type { ColumnDef } from "@tanstack/react-table"
import { RiMore2Line, RiDeleteBin6Line, RiEditLine } from "@remixicon/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Vehicle } from "@/lib/api"

interface VehicleColumnActions {
  onEdit: (vehicle: Vehicle) => void
  onDelete: (vehicle: Vehicle) => void
}

export function getVehicleColumns(actions: VehicleColumnActions): ColumnDef<Vehicle, unknown>[] {
  return [
    {
      accessorKey: "createdAt",
      header: "Date Added",
      size: 110,
      meta: { className: "text-left" },
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt)
        return (
          <div className="text-sm text-muted-foreground whitespace-nowrap">
            {date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        )
      },
    },
    {
      accessorKey: "maker",
      header: "Maker",
      size: 140,
      meta: { className: "text-left" },
      cell: ({ row }) => (
        <div className="font-medium truncate" title={row.original.maker}>{row.original.maker}</div>
      ),
    },
    {
      accessorKey: "model",
      header: "Model",
      size: 140,
      meta: { className: "text-left" },
      cell: ({ row }) => (
        <div className="truncate" title={row.original.model}>{row.original.model}</div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      size: 110,
      meta: { className: "text-left" },
      cell: ({ row }) => (
        <Badge variant="outline" className="px-1.5 text-muted-foreground whitespace-nowrap">
          {row.original.category}
        </Badge>
      ),
    },
    {
      accessorKey: "price",
      header: "Price",
      size: 130,
      meta: { className: "text-right" },
      cell: ({ row }) => (
        <div className="text-right font-medium whitespace-nowrap">
          ${row.original.price.toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "quantity",
      header: "Qty",
      size: 70,
      meta: { className: "text-right" },
      filterFn: "quantityRange" as unknown as ColumnDef<Vehicle, unknown>["filterFn"],
      cell: ({ row }) => (
        <div className="text-right">
          <Badge
            variant="outline"
            className={`px-1.5 ${
              row.original.quantity > 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {row.original.quantity}
          </Badge>
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      size: 40,
      meta: { className: "text-right" },
      cell: ({ row }) => {
        const vehicle = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="size-8 text-muted-foreground" />}>
              <RiMore2Line />
              <span className="sr-only">Open menu</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={() => actions.onEdit(vehicle)}>
                <RiEditLine className="size-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => actions.onDelete(vehicle)}
              >
                <RiDeleteBin6Line className="size-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
