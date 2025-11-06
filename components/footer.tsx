"use client"

import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-4">WSGV REALTORS®</h3>
            <p className="text-sm text-primary-foreground/80">
              Serving the San Gabriel Valley real estate community with excellence and integrity.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4">For Members</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:text-secondary transition-colors">
                  Member Portal
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-secondary transition-colors">
                  Education
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-secondary transition-colors">
                  Resources
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">For the Public</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:text-secondary transition-colors">
                  Find a REALTOR®
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-secondary transition-colors">
                  Market Data
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-secondary transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Contact</h4>
            <p className="text-sm text-primary-foreground/80">San Gabriel Valley, CA</p>
            <p className="text-sm text-primary-foreground/80">info@wsgvrealtors.org</p>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-primary-foreground/80">
          <p>&copy; 2025 West San Gabriel Valley REALTORS®. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-secondary transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-secondary transition-colors">
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
