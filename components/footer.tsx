"use client"

import Link from "next/link"
import { Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    Products: [
      { label: "VK-240-25-3000 Fire Sprinkler", href: "#" },
      { label: "Residential Fire Protection", href: "#" },
      { label: "Commercial Fire Systems", href: "#" },
      { label: "Backup Battery Systems", href: "#" },
    ],
    Company: [
      { label: "About VICON", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
    ],
    Support: [
      { label: "Help Center", href: "#" },
      { label: "Contact Us", href: "#" },
      { label: "Warranty", href: "#" },
      { label: "Installation Guide", href: "#" },
    ],
    Legal: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Cookie Policy", href: "#" },
      { label: "Sitemap", href: "#" },
    ],
  }

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-6">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cgi-bin_mmwebwx-bin_webwxgetmsgimg__MsgID5202958901379986031skey%40crypt_7d72f99b_bc487fcb6d9402a8598d026bb42e3fdemmweb_appidwx_webfilehelper-e1747815718414-100x100-noihZZciHXU6DZ0iqg6u7Prmw5Vgvz.jpeg"
                alt="VICON"
                className="w-8 h-8"
              />
              <span>VICON</span>
            </Link>
            <p className="text-primary-foreground/80 mb-6">
              AI-powered fire-protection systems for Southern California. Safer. Greener. Smarter. technology for homes
              and businesses protecting against fire and wildfire threats.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-accent" />
                <span className="text-sm">(904) 945-3280</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-accent" />
                <span className="text-sm">info@vicontech.group</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-accent mt-1 flex-shrink-0" />
                <span className="text-sm">22515 Aspan Street, Suite F-G, Lake Forest, CA 92630</span>
              </div>
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-bold text-lg mb-4">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-primary-foreground/70 hover:text-accent transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-primary-foreground/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-primary-foreground/70">
            <p>&copy; {currentYear} VICON Technologies. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-accent transition-colors">
                Facebook
              </Link>
              <Link href="#" className="hover:text-accent transition-colors">
                Twitter
              </Link>
              <Link href="#" className="hover:text-accent transition-colors">
                LinkedIn
              </Link>
              <Link href="#" className="hover:text-accent transition-colors">
                Instagram
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
