"use client"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { vehicleCategories } from "@/lib/schemas"

export function SectionCards({
  totalModels = 0,
  outOfStockModels = 0,
  totalRevenue = 0,
}: {
  totalModels?: number
  outOfStockModels?: number
  totalRevenue?: number
}) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card py-6">
        <CardHeader className="px-6">
          <CardDescription>Total Models Available</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalModels.toLocaleString()}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card py-6">
        <CardHeader className="px-6">
          <CardDescription>Total Revenue</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ${totalRevenue.toLocaleString()}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card py-6">
        <CardHeader className="px-6">
          <CardDescription>Car Categories</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {vehicleCategories.length}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card py-6">
        <CardHeader className="px-6">
          <CardDescription>Out of Stock Models</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {outOfStockModels}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}
