"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Search, User, ShoppingCart } from "lucide-react"

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { label: "How It Works", href: "/how-it-works" },
    { label: "The System", href: "/the-system" },
    { label: "Learn More", href: "/learn-more" },
    { label: "Products", href: "/products" },
    { label: "Agent Pricing", href: "/agent-pricing" },
  ]

  return (
    <>
      <div className="bg-accent h-10 flex items-center px-4 text-sm font-medium text-accent-foreground">
        AI-Powered Fire Protection: Detect Threats. Suppress Precisely. Protect Your Home.
      </div>

      <nav className="bg-primary text-primary-foreground sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-2 font-bold text-2xl">
              <div className="w-10 h-10">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cgi-bin_mmwebwx-bin_webwxgetmsgimg__MsgID5202958901379986031skey%40crypt_7d72f99b_bc487fcb6d9402a8598d026bb42e3fdemmweb_appidwx_webfilehelper-e1747815718414-100x100-noihZZciHXU6DZ0iqg6u7Prmw5Vgvz.jpeg"
                  alt="VICON Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span>VICON</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="hover:text-accent transition-colors text-sm font-medium"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <button className="hidden sm:flex hover:text-accent transition-colors">
                <Search size={20} />
              </button>
              <button className="hidden sm:flex hover:text-accent transition-colors">
                <User size={20} />
              </button>
              <button className="relative hover:text-accent transition-colors">
                <ShoppingCart size={20} />
                <span className="absolute -top-2 -right-2 bg-accent text-primary w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold">
                  0
                </span>
              </button>

              <button className="md:hidden ml-4" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {isOpen && (
            <div className="md:hidden pb-4 space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block py-2 px-2 rounded hover:bg-primary-foreground/10 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>
    </>
  )
}
