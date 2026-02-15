"use client"

import { LayoutDashboard, Utensils, ClipboardList, LogOut } from "lucide-react"
import type { TabKey } from "./bottom-nav"

interface SidebarProps {
    active: TabKey
    onChange: (tab: TabKey) => void
}

export function Sidebar({ active, onChange }: SidebarProps) {
    return (
        <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card/50 backdrop-blur-sm h-full">
            <div className="p-6">
                <h1 className="font-display text-2xl font-bold text-foreground">Takoyaki</h1>
                <p className="text-xs text-muted-foreground tracking-widest uppercase">Admin Panel</p>
            </div>

            <nav className="flex-1 px-4 py-4 flex flex-col gap-2">
                <button
                    onClick={() => onChange("queue")}
                    className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 ${active === "queue"
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        }`}
                >
                    <LayoutDashboard className="w-5 h-5" />
                    <span className="font-medium">Live Queue</span>
                </button>

                <button
                    onClick={() => onChange("menu")}
                    className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 ${active === "menu"
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        }`}
                >
                    <Utensils className="w-5 h-5" />
                    <span className="font-medium">Menu Stock</span>
                </button>

                <button
                    onClick={() => onChange("records")}
                    className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 ${active === "records"
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        }`}
                >
                    <ClipboardList className="w-5 h-5" />
                    <span className="font-medium">Records</span>
                </button>
            </nav>

            <div className="p-4 border-t border-border">
                <button className="flex items-center gap-3 px-4 py-3 w-full rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
    )
}
