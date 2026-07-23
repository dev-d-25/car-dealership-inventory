import { useState, useEffect } from "react";
import { vehicles, type Vehicle, type PaginatedResponse } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RiShoppingCartLine, RiSearchLine } from "@remixicon/react";

const CATEGORIES = ["Hatchback", "Sedan", "SUV", "Truck", "Coupe"];

function VehicleCard({ v, onPurchase }: { v: Vehicle; onPurchase: (id: string) => void }) {
  const outOfStock = v.quantity === 0;
  return (
    <Card className="flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <div className="aspect-video bg-zinc-100 flex items-center justify-center text-zinc-400 text-4xl font-bold">
        {v.imageUrl ? (
          <img src={v.imageUrl} alt={`${v.maker} ${v.model}`} className="w-full h-full object-cover" />
        ) : (
          <span>{v.maker[0]}{v.model[0]}</span>
        )}
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-tight">{v.maker} {v.model}</CardTitle>
          <Badge variant={outOfStock ? "destructive" : "secondary"} className="shrink-0 text-xs">
            {outOfStock ? "Out of Stock" : `${v.quantity} in stock`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-2">
        <Badge variant="outline" className="mb-2 text-xs">{v.category}</Badge>
        {v.description && <p className="text-sm text-zinc-500 line-clamp-2">{v.description}</p>}
      </CardContent>
      <CardFooter className="flex items-center justify-between pt-2 border-t">
        <span className="text-lg font-bold text-zinc-900">${Number(v.price).toLocaleString()}</span>
        <Button size="sm" disabled={outOfStock} onClick={() => onPurchase(v.id)}>
          <RiShoppingCartLine className="mr-1 h-4 w-4" />
          Purchase
        </Button>
      </CardFooter>
    </Card>
  );
}

export function DashboardVariantA() {
  const [data, setData] = useState<PaginatedResponse<Vehicle> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [maker, setMaker] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await vehicles.search({ maker, category, sortBy, sortOrder: "desc", page, limit: 9 });
      setData(res);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchVehicles(); }, [page, maker, category, sortBy]);

  const handlePurchase = async (id: string) => {
    await vehicles.purchase(id);
    fetchVehicles();
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-zinc-900">AutoVault</h1>
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            {data?.pagination.total ?? 0} vehicles
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search by maker..."
              value={maker}
              onChange={(e) => { setMaker(e.target.value); setPage(1); }}
              className="pl-9"
            />
          </div>
          <Select value={category} onValueChange={(v) => { setCategory(v ?? ""); setPage(1); }}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="All categories" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v) => { setSortBy(v ?? "createdAt"); setPage(1); }}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Newest</SelectItem>
              <SelectItem value="price">Price</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 rounded-lg bg-zinc-200 animate-pulse" />
            ))}
          </div>
        ) : data?.data.length === 0 ? (
          <p className="text-center text-zinc-400 py-20">No vehicles found</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.data.map((v) => <VehicleCard key={v.id} v={v} onPurchase={handlePurchase} />)}
          </div>
        )}

        {data && data.pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</Button>
            <span className="text-sm text-zinc-500">Page {page} of {data.pagination.totalPages}</span>
            <Button variant="outline" size="sm" disabled={page === data.pagination.totalPages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        )}
      </div>
    </div>
  );
}
