import { useState, useEffect } from "react";
import { vehicles, type Vehicle, type PaginatedResponse } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RiSearchLine, RiDeleteBinLine, RiShoppingCartLine } from "@remixicon/react";

const CATEGORIES = ["Hatchback", "Sedan", "SUV", "Truck", "Coupe"];

export function DashboardVariantB() {
  const [data, setData] = useState<PaginatedResponse<Vehicle> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [maker, setMaker] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await vehicles.search({ maker, category, sortBy, sortOrder, page, limit: 12 });
      setData(res);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchVehicles(); }, [page, maker, category, sortBy, sortOrder]);

  const handlePurchase = async (id: string) => {
    await vehicles.purchase(id);
    fetchVehicles();
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const sortIndicator = (field: string) => sortBy === field ? (sortOrder === "asc" ? " ↑" : " ↓") : "";

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-zinc-900">AutoVault</h1>
          <div className="text-sm text-zinc-500">{data?.pagination.total ?? 0} vehicles</div>
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
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-12 rounded bg-zinc-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border bg-white overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer hover:text-zinc-900" onClick={() => toggleSort("maker")}>
                    Maker{sortIndicator("maker")}
                  </TableHead>
                  <TableHead className="cursor-pointer hover:text-zinc-900" onClick={() => toggleSort("model")}>
                    Model{sortIndicator("model")}
                  </TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="cursor-pointer hover:text-zinc-900 text-right" onClick={() => toggleSort("price")}>
                    Price{sortIndicator("price")}
                  </TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-zinc-400">No vehicles found</TableCell>
                  </TableRow>
                ) : (
                  data?.data.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium">{v.maker}</TableCell>
                      <TableCell>{v.model}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{v.category}</Badge></TableCell>
                      <TableCell className="text-right font-mono">${Number(v.price).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={v.quantity === 0 ? "destructive" : "secondary"} className="text-xs">
                          {v.quantity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={v.quantity === 0}
                            onClick={() => handlePurchase(v.id)}
                          >
                            <RiShoppingCartLine className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600">
                            <RiDeleteBinLine className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {data && data.pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</Button>
            <span className="text-sm text-zinc-500">Page {page} of {data.pagination.totalPages}</span>
            <Button variant="outline" size="sm" disabled={page === data.pagination.totalPages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        )}
      </div>
    </div>
  );
}
