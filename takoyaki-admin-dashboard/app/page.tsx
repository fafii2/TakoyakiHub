"use client"

import { useState, useEffect } from "react"
import { Dashboard } from "@/components/dashboard"
import { AdminLogin } from "@/components/admin-login"

export default function Page() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const auth = localStorage.getItem("takoyaki_admin_auth")
    if (auth === "true") {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const handleLogin = () => {
    setIsAuthenticated(true)
    localStorage.setItem("takoyaki_admin_auth", "true")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />
  }

  return <Dashboard />
}
