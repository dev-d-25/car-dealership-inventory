import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { vehicleCategories } from "@/lib/schemas"

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    className?: string
  }
}

type SortOption = "newest" | "oldest" | "price-asc" | "price-desc"

export function DataTable<TData>({
  data: initialData,
  columns,
  sortOptions = true,
  categoryFilter = true,
  actions,
}: {
  data: TData[]
  columns: ColumnDef<TData, unknown>[]
  sortOptions?: boolean
  categoryFilter?: boolean
  actions?: React.ReactNode
}) {
  const [data, setData] = React.useState(() => initialData)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [sortOption, setSortOption] = React.useState<SortOption>("newest")
  const [selectedCategory, setSelectedCategory] = React.useState("all")
  const [minQuantity, setMinQuantity] = React.useState("")
  const [maxQuantity, setMaxQuantity] = React.useState("")
  const [makerFilter, setMakerFilter] = React.useState("")
  const [modelFilter, setModelFilter] = React.useState("")

  React.useEffect(() => {
    setData(initialData)
  }, [initialData])

  const handleSortChange = (value: string | null) => {
    if (!value) return
    setSortOption(value as SortOption)
    switch (value) {
      case "newest":
        setSorting([{ id: "createdAt", desc: true }])
        break
      case "oldest":
        setSorting([{ id: "createdAt", desc: false }])
        break
      case "price-asc":
        setSorting([{ id: "price", desc: false }])
        break
      case "price-desc":
        setSorting([{ id: "price", desc: true }])
        break
    }
  }

  const handleCategoryChange = (value: string | null) => {
    if (!value) return
    setSelectedCategory(value)
    const categoryColumn = table.getColumn("category")
    if (categoryColumn) {
      categoryColumn.setFilterValue(value === "all" ? "" : value)
    }
  }

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    filterFns: {
      quantityRange: (row, columnId, filterValue) => {
        const quantity = row.getValue(columnId) as number
        const { min, max } = filterValue as { min?: number; max?: number }
        if (min !== undefined && quantity < min) return false
        if (max !== undefined && quantity > max) return false
        return true
      },
    },
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Maker..."
          value={makerFilter}
          onChange={(event) => {
            setMakerFilter(event.target.value)
            table.getColumn("maker")?.setFilterValue(event.target.value)
          }}
          className="w-[140px]"
        />
        <Input
          placeholder="Model..."
          value={modelFilter}
          onChange={(event) => {
            setModelFilter(event.target.value)
            table.getColumn("model")?.setFilterValue(event.target.value)
          }}
          className="w-[140px]"
        />
        {sortOptions && (
          <Select value={sortOption} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[150px]" id="sort">
              <SelectValue>
                {sortOption === "newest" && "Newest First"}
                {sortOption === "oldest" && "Oldest First"}
                {sortOption === "price-asc" && "Price: Low to High"}
                {sortOption === "price-desc" && "Price: High to Low"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
        {categoryFilter && (
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-[130px]" id="category-filter">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Categories</SelectItem>
                {vehicleCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
        <div className="flex items-center gap-1">
          <Input
            id="min-qty"
            type="number"
            placeholder="Min"
            value={minQuantity}
            onChange={(e) => {
              setMinQuantity(e.target.value)
              const qtyColumn = table.getColumn("quantity")
              if (qtyColumn) {
                const min = e.target.value ? Number(e.target.value) : undefined
                const max = maxQuantity ? Number(maxQuantity) : undefined
                qtyColumn.setFilterValue(min !== undefined || max !== undefined ? { min, max } : "")
              }
            }}
            className="w-16"
          />
          <span className="text-muted-foreground text-sm">-</span>
          <Input
            id="max-qty"
            type="number"
            placeholder="Max"
            value={maxQuantity}
            onChange={(e) => {
              setMaxQuantity(e.target.value)
              const qtyColumn = table.getColumn("quantity")
              if (qtyColumn) {
                const min = minQuantity ? Number(minQuantity) : undefined
                const max = e.target.value ? Number(e.target.value) : undefined
                qtyColumn.setFilterValue(min !== undefined || max !== undefined ? { min, max } : "")
              }
            }}
            className="w-16"
          />
        </div>
        {actions && <div className="ml-auto">{actions}</div>}
      </div>
      <div className="overflow-hidden rounded-lg border">
        <Table className="table-fixed">
          <TableHeader className="bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={header.column.columnDef.meta?.className}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No vehicles found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between px-4">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} vehicle(s)
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="rows-per-page" className="text-sm">
              Rows per page
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger className="w-20" id="rows-per-page">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top">
                <SelectGroup>
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
