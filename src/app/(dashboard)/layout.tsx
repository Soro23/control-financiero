"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavBar } from "@/components/layout/TopNavBar";

export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:ml-72 flex flex-col min-h-screen">
        <TopNavBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 px-4 md:px-8 lg:px-12 pb-12 w-full pt-16 lg:pt-0">
          {children}
        </main>
      </div>
    </div>
  );
}
