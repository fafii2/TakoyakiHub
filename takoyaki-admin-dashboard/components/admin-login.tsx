"use client"

import { useState } from "react"
import { Lock } from "lucide-react"
import { Input } from "@/components/ui/input"

interface AdminLoginProps {
    onLogin: () => void
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
    const [pin, setPin] = useState("")
    const [error, setError] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Hardcoded PIN for now
        if (pin === "123456") {
            onLogin()
        } else {
            setError("Invalid PIN. Please try again.")
            setPin("")
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <div className="flex flex-col items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <Lock className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900">Admin Access</h1>
                        <p className="text-sm text-gray-500 mt-1">Enter PIN to access dashboard</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Input
                            type="password"
                            placeholder="Enter 6-digit PIN"
                            value={pin}
                            onChange={(e) => {
                                setPin(e.target.value)
                                setError("")
                            }}
                            maxLength={6}
                            className="text-center text-lg tracking-widest"
                            autoFocus
                        />
                        {error && (
                            <p className="text-sm text-red-500 text-center animate-in fade-in slide-in-from-top-1">
                                {error}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full text-lg h-12 bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                    >
                        Unlock Dashboard
                    </button>
                </form>
            </div>
        </div>
    )
}
