"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { AppearanceTab } from "@/components/configuracion/AppearanceTab";
import { CategoriesTab } from "@/components/configuracion/CategoriesTab";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { useRouter } from "next/navigation";

const CURRENCIES = [
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "USD", symbol: "$", name: "Dólar estadounidense" },
  { code: "GBP", symbol: "£", name: "Libra esterlina" },
  { code: "MXN", symbol: "$", name: "Peso mexicano" },
  { code: "ARS", symbol: "$", name: "Peso argentino" },
  { code: "COP", symbol: "$", name: "Peso colombiano" },
];

const CARD = "bg-surface-container-lowest rounded-2xl shadow-[0_2px_12px_rgba(25,28,30,0.06)] overflow-hidden";
const CARD_BODY = "p-6";

export default function ConfiguracionPage() {
  const { preferences, loading, updatePreferences } = useUserPreferences();
  const router = useRouter();

  // Perfil
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Moneda
  const [currency, setCurrency] = useState("EUR");
  const [currencySymbol, setCurrencySymbol] = useState("€");
  const [symbolPosition, setSymbolPosition] = useState<"before" | "after">("after");
  const [decimalFormat, setDecimalFormat] = useState<"comma" | "dot">("comma");
  const [savingCurrency, setSavingCurrency] = useState(false);

  useEffect(() => {
    if (!preferences) return;
    setName(preferences.name ?? "");
    setCurrency(preferences.currency);
    setCurrencySymbol(preferences.currency_symbol);
    setSymbolPosition(preferences.symbol_position);
    setDecimalFormat(preferences.decimal_format);
  }, [preferences]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u?.email) setEmail(u.email);
    });
    return unsub;
  }, []);

  function handleCurrencyChange(code: string) {
    const found = CURRENCIES.find((c) => c.code === code);
    setCurrency(code);
    if (found) setCurrencySymbol(found.symbol);
  }

  async function handleSaveProfile() {
    setSavingProfile(true);
    const ok = await updatePreferences({ name: name || null });
    setSavingProfile(false);
    if (ok) toast.success("Perfil actualizado");
    else toast.error("Error al actualizar el perfil");
  }

  async function handleSaveCurrency() {
    setSavingCurrency(true);
    const ok = await updatePreferences({
      currency,
      currency_symbol: currencySymbol,
      symbol_position: symbolPosition,
      decimal_format: decimalFormat,
    });
    setSavingCurrency(false);
    if (ok) toast.success("Preferencias de moneda guardadas");
    else toast.error("Error al guardar las preferencias");
  }

  async function handleSignOut() {
    await signOut(auth);
    await fetch("/api/auth/session", { method: "DELETE" });
    router.push("/login");
  }

  const previewPrefs = {
    currency_symbol: currencySymbol,
    symbol_position: symbolPosition,
    decimal_format: decimalFormat,
  };

  const initials = name
    ? name.trim().split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : email
      ? email.slice(0, 2).toUpperCase()
      : "CF";

  return (
    <div className="py-8 max-w-2xl space-y-5">

      {/* Page title */}
      <div>
        <h1 className="text-2xl font-black font-headline text-on-surface tracking-tight">Configuración</h1>
        <p className="text-sm text-on-surface-variant mt-0.5">Gestiona tu cuenta y preferencias</p>
      </div>

      {/* Hero — user identity card */}
      <div className="gradient-primary rounded-2xl px-6 py-5 flex items-center gap-4 shadow-lg shadow-primary/10">
        <div className="w-14 h-14 rounded-full bg-white/15 flex items-center justify-center text-xl font-black font-headline text-on-primary shrink-0 ring-2 ring-white/20">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="font-bold font-headline text-on-primary text-lg leading-tight truncate">
            {loading ? "Cargando..." : name || "Sin nombre"}
          </p>
          <p className="text-on-primary/60 text-sm truncate mt-0.5">{email}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="perfil" className="flex-col">
        <TabsList className="bg-surface-container-low rounded-xl p-1 w-full grid grid-cols-4">
          <TabsTrigger
            value="perfil"
            className="rounded-lg font-headline font-semibold text-sm data-[state=active]:bg-surface-container-lowest data-[state=active]:shadow-sm flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">person</span>
            <span className="hidden sm:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger
            value="moneda"
            className="rounded-lg font-headline font-semibold text-sm data-[state=active]:bg-surface-container-lowest data-[state=active]:shadow-sm flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">payments</span>
            <span className="hidden sm:inline">Moneda</span>
          </TabsTrigger>
          <TabsTrigger
            value="categorias"
            className="rounded-lg font-headline font-semibold text-sm data-[state=active]:bg-surface-container-lowest data-[state=active]:shadow-sm flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">category</span>
            <span className="hidden sm:inline">Categorías</span>
          </TabsTrigger>
          <TabsTrigger
            value="apariencia"
            className="rounded-lg font-headline font-semibold text-sm data-[state=active]:bg-surface-container-lowest data-[state=active]:shadow-sm flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">palette</span>
            <span className="hidden sm:inline">Apariencia</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab: Perfil */}
        <TabsContent value="perfil" className="mt-4">
          <div className={CARD}>
            <div className={CARD_BODY}>
              {loading ? (
                <div className="flex items-center gap-3 py-4 text-sm text-on-surface-variant">
                  <div className="w-4 h-4 border-2 border-outline-variant/30 border-t-primary rounded-full animate-spin" />
                  Cargando...
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                      Nombre
                    </Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Tu nombre"
                      className="bg-surface-container-low border-none rounded-xl focus-visible:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                      Email
                    </Label>
                    <Input
                      value={email}
                      readOnly
                      className="bg-surface-container-low border-none rounded-xl opacity-60 cursor-not-allowed"
                    />
                    <p className="text-xs text-on-surface-variant">El email no se puede modificar desde aquí</p>
                  </div>

                  <Button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="gradient-primary text-on-primary font-bold font-headline rounded-xl px-6 hover:opacity-90 active:scale-95 transition-all"
                  >
                    {savingProfile ? "Guardando..." : "Guardar cambios"}
                  </Button>

                  <div className="pt-4 border-t border-outline-variant/10">
                    <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
                      Sesión
                    </p>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2.5 text-sm font-semibold text-error hover:text-error/80 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Tab: Moneda */}
        <TabsContent value="moneda" className="mt-4">
          <div className={CARD}>
            <div className={CARD_BODY}>
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    Moneda
                  </Label>
                  <Select value={currency} onValueChange={(v) => v && handleCurrencyChange(v)}>
                    <SelectTrigger className="bg-surface-container-low border-none rounded-xl focus:ring-primary/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.symbol} · {c.name} ({c.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                      Posición del símbolo
                    </Label>
                    <div className="flex gap-2">
                      {(["before", "after"] as const).map((pos) => (
                        <button
                          key={pos}
                          type="button"
                          onClick={() => setSymbolPosition(pos)}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold font-headline transition-all ${symbolPosition === pos
                              ? "gradient-primary text-on-primary"
                              : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                            }`}
                        >
                          {pos === "before" ? `${currencySymbol} Antes` : `Después ${currencySymbol}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                      Separador decimal
                    </Label>
                    <div className="flex gap-2">
                      {(["comma", "dot"] as const).map((format) => (
                        <button
                          key={format}
                          type="button"
                          onClick={() => setDecimalFormat(format)}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold font-headline transition-all ${decimalFormat === format
                              ? "gradient-primary text-on-primary"
                              : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                            }`}
                        >
                          {format === "comma" ? "1.234,56" : "1,234.56"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-low rounded-xl px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Vista previa</p>
                    <p className="text-2xl font-black font-headline text-on-surface mt-1">
                      {formatCurrency(1234.56, previewPrefs)}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-outline-variant text-[32px]">preview</span>
                </div>

                <Button
                  onClick={handleSaveCurrency}
                  disabled={savingCurrency}
                  className="w-full gradient-primary text-on-primary font-bold font-headline rounded-xl py-3 hover:opacity-90 active:scale-95 transition-all"
                >
                  {savingCurrency ? "Guardando..." : "Guardar preferencias"}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab: Categorías */}
        <TabsContent value="categorias" className="mt-4">
          <div className={CARD}>
            <CategoriesTab />
          </div>
        </TabsContent>

        {/* Tab: Apariencia */}
        <TabsContent value="apariencia" className="mt-4">
          <div className={CARD}>
            <div className={CARD_BODY}>
              <AppearanceTab />
            </div>
          </div>
        </TabsContent>
      </Tabs>

    </div>
  );
}
