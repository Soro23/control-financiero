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

  // Inicializar desde preferences
  useEffect(() => {
    function syncFromPreferences() {
      if (!preferences) return;
      setName(preferences.name ?? "");
      setCurrency(preferences.currency);
      setCurrencySymbol(preferences.currency_symbol);
      setSymbolPosition(preferences.symbol_position);
      setDecimalFormat(preferences.decimal_format);
    }
    syncFromPreferences();
  }, [preferences]);

  // Cargar email del usuario
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u?.email) setEmail(u.email);
    });
    return unsub;
  }, []);

  // Actualizar símbolo cuando cambia la moneda
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

  return (
    <div className="py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black font-headline text-slate-900 tracking-tight">Configuración</h1>
        <p className="text-sm text-on-surface-variant mt-0.5">Personaliza tu cuenta y preferencias</p>
      </div>

      <Tabs defaultValue="perfil">
        <TabsList className="bg-surface-container-low rounded-xl p-1 mb-6">
          <TabsTrigger value="perfil" className="rounded-lg font-headline font-semibold text-sm data-[state=active]:bg-surface-container-lowest data-[state=active]:shadow-sm">
            Perfil
          </TabsTrigger>
          <TabsTrigger value="moneda" className="rounded-lg font-headline font-semibold text-sm data-[state=active]:bg-surface-container-lowest data-[state=active]:shadow-sm">
            Moneda
          </TabsTrigger>
          <TabsTrigger value="categorias" className="rounded-lg font-headline font-semibold text-sm data-[state=active]:bg-surface-container-lowest data-[state=active]:shadow-sm">
            Categorías
          </TabsTrigger>
          <TabsTrigger value="apariencia" className="rounded-lg font-headline font-semibold text-sm data-[state=active]:bg-surface-container-lowest data-[state=active]:shadow-sm">
            Apariencia
          </TabsTrigger>
        </TabsList>

        {/* Pestaña Perfil */}
        <TabsContent value="perfil">
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_2px_12px_rgba(25,28,30,0.06)] space-y-6">
            {loading ? (
              <p className="text-sm text-on-surface-variant">Cargando...</p>
            ) : (
              <>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Nombre</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre"
                    className="bg-surface-container-low border-none rounded-xl focus-visible:ring-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Email</Label>
                  <Input
                    value={email}
                    readOnly
                    className="bg-surface-container-low border-none rounded-xl opacity-60 cursor-not-allowed"
                  />
                  <p className="text-xs text-on-surface-variant">El email no se puede modificar desde aquí</p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="gradient-primary text-on-primary font-bold font-headline rounded-xl px-6 hover:opacity-90 active:scale-95 transition-all"
                  >
                    {savingProfile ? "Guardando..." : "Guardar cambios"}
                  </Button>

                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-sm font-semibold text-error hover:text-error/80 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    Cerrar sesión
                  </button>
                </div>
              </>
            )}
          </div>
        </TabsContent>

        {/* Pestaña Moneda */}
        <TabsContent value="moneda">
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_2px_12px_rgba(25,28,30,0.06)] space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Moneda</Label>
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

            <div className="space-y-3">
              <Label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Posición del símbolo</Label>
              <div className="flex gap-3">
                {(["before", "after"] as const).map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setSymbolPosition(pos)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold font-headline transition-all border ${
                      symbolPosition === pos
                        ? "gradient-primary text-on-primary border-transparent"
                        : "bg-surface-container-low text-slate-600 border-transparent hover:border-outline-variant/30"
                    }`}
                  >
                    {pos === "before" ? `${currencySymbol} Antes` : `Después ${currencySymbol}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Separador decimal</Label>
              <div className="flex gap-3">
                {(["comma", "dot"] as const).map((format) => (
                  <button
                    key={format}
                    type="button"
                    onClick={() => setDecimalFormat(format)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold font-headline transition-all border ${
                      decimalFormat === format
                        ? "gradient-primary text-on-primary border-transparent"
                        : "bg-surface-container-low text-slate-600 border-transparent hover:border-outline-variant/30"
                    }`}
                  >
                    {format === "comma" ? "1.234,56" : "1,234.56"}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="bg-surface-container-low rounded-xl px-5 py-4">
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Vista previa</p>
              <p className="text-xl font-black font-headline text-slate-900">
                {formatCurrency(1234.56, previewPrefs)}
              </p>
            </div>

            <Button
              onClick={handleSaveCurrency}
              disabled={savingCurrency}
              className="w-full gradient-primary text-on-primary font-bold font-headline rounded-xl py-3 hover:opacity-90 active:scale-95 transition-all"
            >
              {savingCurrency ? "Guardando..." : "Guardar preferencias"}
            </Button>
          </div>
        </TabsContent>
        {/* Pestaña Categorías */}
        <TabsContent value="categorias">
          <CategoriesTab />
        </TabsContent>

        {/* Pestaña Apariencia */}
        <TabsContent value="apariencia">
          <AppearanceTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
