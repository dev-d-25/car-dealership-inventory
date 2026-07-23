"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { useQuery } from "@tanstack/react-query"
import { purchases, type ChartDataPoint } from "@/lib/api"

export const description = "An interactive area chart"

const chartConfig = {
  vehicles: {
    label: "Vehicles Sold",
    color: "var(--primary)",
  },
  revenue: {
    label: "Revenue",
    color: "var(--primary)",
  },
} satisfies ChartConfig

const TIME_RANGES = ["90d", "30d", "7d"] as const

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState<string>(
    isMobile ? "7d" : "30d"
  )

  const { data: chartData } = useQuery({
    queryKey: ["dashboard", "chart", timeRange],
    queryFn: () => {
      const days = timeRange === "7d" ? 7 : timeRange === "90d" ? 90 : 30
      return purchases.getChartData(days)
    },
  })

  const filteredData: ChartDataPoint[] = chartData?.data ?? []

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Vehicle Sales</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Total for the last 30 days
          </span>
          <span className="@[540px]/card:hidden">Last 30 days</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            multiple={false}
            value={[timeRange]}
            onValueChange={(value) => {
              if (value && value.length > 0) {
                setTimeRange(value[0])
              }
            }}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            {TIME_RANGES.map((range) => (
              <ToggleGroupItem key={range} value={range}>
                {range === "90d" ? "Last 3 months" : range === "30d" ? "Last 30 days" : "Last 7 days"}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <Select
            value={timeRange}
            onValueChange={(value) => {
              if (value !== null) {
                setTimeRange(value)
              }
            }}
          >
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 30 days" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {TIME_RANGES.map((range) => (
                <SelectItem key={range} value={range} className="rounded-lg">
                  {range === "90d" ? "Last 3 months" : range === "30d" ? "Last 30 days" : "Last 7 days"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillVehicles" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-vehicles)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-vehicles)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="vehiclesSold"
              type="natural"
              fill="url(#fillVehicles)"
              stroke="var(--color-vehicles)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
