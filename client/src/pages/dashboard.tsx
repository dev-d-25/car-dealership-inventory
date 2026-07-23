import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { DashboardVariantA } from "./dashboard-variant-a";
import { DashboardVariantB } from "./dashboard-variant-b";
import { DashboardVariantC } from "./dashboard-variant-c";
import { PrototypeSwitcher } from "@/components/prototype-switcher";
import { Button } from "@/components/ui/button";

const VARIANTS = ["A", "B", "C"];
const NAMES: Record<string, string> = {
  A: "Card Grid",
  B: "Dense Table",
  C: "Sidebar Dashboard",
};

const VariantComponents: Record<string, React.ComponentType> = {
  A: DashboardVariantA,
  B: DashboardVariantB,
  C: DashboardVariantC,
};

export function DashboardPage() {
  const params = new URLSearchParams(window.location.search);
  const initial = params.get("variant");
  const [variant, setVariant] = useState(
    VARIANTS.includes(initial as string) ? (initial as string) : "A"
  );

  const { user, signOut } = useAuth();

  const handleVariantChange = (v: string) => {
    setVariant(v);
    const url = new URL(window.location.href);
    url.searchParams.set("variant", v);
    window.history.replaceState(null, "", url.toString());
  };

  const Variant = VariantComponents[variant];

  return (
    <div>
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <span className="text-xs text-zinc-500 bg-white/80 backdrop-blur rounded px-2 py-1 border">
          {user?.name} ({user?.role})
        </span>
        <Button variant="outline" size="sm" onClick={signOut}>Sign Out</Button>
      </div>
      <Variant />
      <PrototypeSwitcher variants={VARIANTS} current={variant} onChange={handleVariantChange} names={NAMES} />
    </div>
  );
}
