import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavBar } from "@/components/layout/TopNavBar";

export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <div className="ml-72 flex flex-col min-h-screen">
        <TopNavBar />
        <main className="flex-1 px-12 pb-12">
          {children}
        </main>
      </div>
    </div>
  );
}
