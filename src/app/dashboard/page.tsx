
"use client";

import { useState } from "react";
import DashboardSidebar from "@/app/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/app/components/dashboard/DashboardHeader";
import DashboardContent from "@/app/components/dashboard/DashboardContent";

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f5f6fb] text-slate-900">
      <DashboardSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="min-h-screen lg:pl-64">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />

        <main>
          <DashboardContent />
        </main>
      </div>
    </div>
  );
}