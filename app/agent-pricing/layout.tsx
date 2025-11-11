"use client"

import type React from "react"

import { useState } from "react"
import { Mail } from "lucide-react"

export default function AgentPricingLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState("")
  const [verificationSent, setVerificationSent] = useState(false)
  const [code, setCode] = useState("")
  const [error, setError] = useState("")

  // Simulate email verification - in production, this would connect to a backend
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError("Please enter an email address")
      return
    }
    // Simulate sending code
    setVerificationSent(true)
    setError("")
    console.log("[v0] Verification code sent to:", email)
  }

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault()
    // Simple verification: accept any 6-digit code
    if (code.length === 6) {
      setIsAuthenticated(true)
      setError("")
    } else {
      setError("Please enter a valid 6-digit code")
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="text-white" size={24} />
            </div>
            <h1 className="text-3xl font-bold text-primary mb-2">Agent Pricing</h1>
            <p className="text-muted-foreground">Exclusive pricing for authorized agents</p>
          </div>

          {verificationSent ? (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-foreground mb-2">
                  Verification Code
                </label>
                <input
                  id="code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-center text-2xl tracking-widest"
                />
              </div>

              {error && <div className="text-red-600 text-sm">{error}</div>}

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 rounded-lg font-semibold transition-colors"
              >
                Verify & Access Agent Pricing
              </button>

              <button
                type="button"
                onClick={() => {
                  setVerificationSent(false)
                  setCode("")
                  setEmail("")
                }}
                className="w-full text-primary hover:underline text-sm"
              >
                Use different email
              </button>
            </form>
          ) : (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {error && <div className="text-red-600 text-sm">{error}</div>}

              <p className="text-xs text-muted-foreground">
                We'll send a verification code to your email address to confirm agent access.
              </p>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 rounded-lg font-semibold transition-colors"
              >
                Send Verification Code
              </button>
            </form>
          )}

          <div className="mt-8 pt-8 border-t border-border">
            <p className="text-xs text-center text-muted-foreground">
              Don't have agent access? Contact our sales team at{" "}
              <a href="mailto:sales@vicontech.group" className="text-primary hover:underline font-semibold">
                sales@vicontech.group
              </a>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 z-50">
        <div className="w-2 h-2 bg-white rounded-full" />
        Verified Agent Access
      </div>
      {children}
    </div>
  )
}
