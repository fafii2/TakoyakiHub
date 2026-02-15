"use client"

import { useState } from "react"
import { TopBar } from "./top-bar"
import { BottomNav, type TabKey } from "./bottom-nav"
import { Sidebar } from "./sidebar"
import { LiveQueue } from "./live-queue"
import { MenuStock } from "./menu-stock"
import { Records } from "./records"

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabKey>("queue")

  return (
    <div className="flex h-dvh bg-background">
      {/* Desktop Sidebar */}
      <Sidebar active={activeTab} onChange={setActiveTab} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8" role="tabpanel">
          <div className="max-w-6xl mx-auto w-full">
            {activeTab === "queue" && <LiveQueue />}
            {activeTab === "menu" && <MenuStock />}
            {activeTab === "records" && <Records />}
          </div>
        </main>
        {/* Mobile Bottom Nav */}
        <div className="md:hidden">
          <BottomNav active={activeTab} onChange={setActiveTab} />
        </div>
      </div>
    </div>
  )
}
