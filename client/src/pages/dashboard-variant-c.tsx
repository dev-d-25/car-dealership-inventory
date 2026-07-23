import { useState, useEffect } from "react";
import { vehicles, type Vehicle, type PaginatedResponse } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RiSearchLine, RiShoppingCartLine, RiBarChartBoxLine, RiCarLine, RiMoneyDollarCircleLine, RiAlertLine } from "@remixicon/react";

const CATEGORIES = ["Hatchback", "Sedan", "SUV", "Truck", "Coupe"];

export function DashboardVariantC() {
  const [data, setData] = useState<PaginatedResponse<Vehicle> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [maker, setMaker] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const cat = selectedCategory || undefined;
      const res = await vehicles.search({ maker, category: cat, sortBy, sortOrder: "desc", page, limit: 8 });
      setData(res);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchVehicles(); }, [page, maker, sortBy, selectedCategory]);

  const handlePurchase = async (id: string) => {
    await vehicles.purchase(id);
    fetchVehicles();
  };

  const totalStock = data?.data.reduce((sum, v) => sum + v.quantity, 0) ?? 0;
  const outOfStock = data?.data.filter((v) => v.quantity === 0).length ?? 0;
  const avgPrice = data?.data.length ? data.data.reduce((sum, v) => sum + Number(v.price), 0) / data.data.length : 0;

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      <aside className="w-64 border-r bg-white p-4 flex flex-col shrink-0">
        <h2 className="text-lg font-bold text-zinc-900 mb-6">AutoVault</h2>
        <nav className="space-y-1 text-sm">
          <div className="flex items-center gap-2 rounded-md bg-zinc-100 px-3 py-2 font-medium text-zinc-900">
            <RiBarChartBoxLine className="h-4 w-4" /> Dashboard
          </div>
        </nav>

        <Separator className="my-4" />

        <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">Categories</div>
        <nav className="space-y-1 text-sm">
          <button
            onClick={() => { setSelectedCategory(null); setPage(1); }}
            className={`w-full text-left rounded-md px-3 py-2 cursor-pointer transition-colors ${
              !selectedCategory ? "bg-zinc-100 font-medium text-zinc-900" : "text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            All Vehicles
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => { setSelectedCategory(c); setPage(1); }}
              className={`w-full text-left rounded-md px-3 py-2 cursor-pointer transition-colors ${
                selectedCategory === c ? "bg-zinc-100 font-medium text-zinc-900" : "text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              {c}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="border-b bg-white px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-zinc-900">
              {selectedCategory ?? "All Vehicles"}
            </h1>
            <div className="flex items-center gap-3">
              <div className="relative">
                <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  placeholder="Search maker..."
                  value={maker}
                  onChange={(e) => { setMaker(e.target.value); setPage(1); }}
                  className="pl-9 w-64"
                />
              </div>
              <Select value={sortBy} onValueChange={(v) => { setSortBy(v ?? "createdAt"); setPage(1); }}>
                <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Newest</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        <div className="p-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-zinc-500">Total Stock</CardTitle>
                <RiCarLine className="h-4 w-4 text-zinc-400" />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold">{totalStock}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-zinc-500">Avg Price</CardTitle>
                <RiMoneyDollarCircleLine className="h-4 w-4 text-zinc-400" />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold">${Math.round(avgPrice).toLocaleString()}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-zinc-500">Out of Stock</CardTitle>
                <RiAlertLine className="h-4 w-4 text-zinc-400" />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold text-red-600">{outOfStock}</div></CardContent>
            </Card>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-40 rounded-lg bg-zinc-200 animate-pulse" />
              ))}
            </div>
          ) : data?.data.length === 0 ? (
            <p className="text-center text-zinc-400 py-20">No vehicles found</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {data?.data.map((v) => (
                <Card key={v.id} className="flex flex-row overflow-hidden">
                  <div className="w-40 bg-zinc-100 flex items-center justify-center text-2xl font-bold text-zinc-300 shrink-0">
                    {v.imageUrl ? (
                      <img src={v.imageUrl} alt={`${v.maker} ${v.model}`} className="w-full h-full object-cover" />
                    ) : (
                      <span>{v.maker[0]}{v.model[0]}</span>
                    )}
                  </div>
                  <div className="flex-1 p-4 flex flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-zinc-900">{v.maker} {v.model}</h3>
                        <Badge variant="outline" className="mt-1 text-xs">{v.category}</Badge>
                      </div>
                      <Badge variant={v.quantity === 0 ? "destructive" : "secondary"} className="text-xs shrink-0">
                        {v.quantity === 0 ? "Out of Stock" : `${v.quantity} in stock`}
                      </Badge>
                    </div>
                    {v.description && <p className="text-sm text-zinc-500 mt-2 line-clamp-2">{v.description}</p>}
                    <div className="mt-auto pt-3 flex items-center justify-between">
                      <span className="font-bold text-zinc-900">${Number(v.price).toLocaleString()}</span>
                      <Button size="sm" disabled={v.quantity === 0} onClick={() => handlePurchase(v.id)}>
                        <RiShoppingCartLine className="mr-1 h-4 w-4" />
                        Purchase
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
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
      </main>
    </div>
  );
}
