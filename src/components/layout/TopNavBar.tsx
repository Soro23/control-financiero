import { getServerUser } from "@/lib/firebase/session";

export async function TopNavBar() {
  const user = await getServerUser();

  const name = typeof user?.name === "string" ? user.name : null;
  const initials = name
    ? name.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? "CF";

  return (
    <header className="h-20 sticky top-0 z-40 bg-transparent flex justify-between items-center px-12">
      {/* Left */}
      <div className="flex items-center gap-8">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl">
            search
          </span>
          <input
            className="bg-surface-container-low border-none rounded-full pl-10 pr-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="Buscar movimientos..."
            type="text"
            readOnly
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <button
          disabled
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-on-surface-variant rounded-xl cursor-not-allowed opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          Exportar
        </button>

        <div className="h-8 w-px bg-outline-variant/30 mx-2" />

        <button className="p-2 text-slate-500 hover:text-primary transition-colors rounded-lg">
          <span className="material-symbols-outlined">notifications</span>
        </button>

        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-primary-fixed text-primary font-bold text-sm flex items-center justify-center ring-2 ring-white shadow-sm">
          {initials}
        </div>
      </div>
    </header>
  );
}
