"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { label: "Member Services", href: "#" },
    { label: "Education", href: "#" },
    { label: "Resources", href: "#" },
    { label: "News & Events", href: "#" },
    { label: "About", href: "#" },
  ]

  return (
    <header className="bg-primary text-primary-foreground sticky top-0 z-50 shadow-lg">
      <div className="flex items-center justify-between px-4 py-4 md:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-primary text-lg">
            🏠
          </div>
          <span className="font-bold text-sm md:text-base">WSGV REALTORS®</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} className="text-sm hover:text-secondary transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex gap-3">
          <Button variant="outline" className="border-white text-white hover:bg-white/10 bg-transparent">
            My Account
          </Button>
          <Button className="bg-secondary hover:bg-secondary/90 text-black font-bold">Login</Button>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-primary/95 border-t border-white/20 px-4 py-4 flex flex-col gap-4">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm hover:text-secondary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 mt-2">
            <Button variant="outline" className="border-white text-white hover:bg-white/10 w-full bg-transparent">
              My Account
            </Button>
            <Button className="bg-secondary hover:bg-secondary/90 text-black font-bold w-full">Login</Button>
          </div>
        </nav>
      )}
    </header>
  )
}
