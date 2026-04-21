import { Link } from "react-router-dom"
import { Logo } from "./Logo"

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Log In", href: "/login" },
  { label: "Sign Up", href: "/register" },
]

export function LandingFooter() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#050816]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <Logo size={28} showText />
            <p className="text-sm text-slate-500 mt-1 text-center md:text-left">
              Kanban boards for modern teams.
            </p>
          </div>

          {/* Links */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap justify-center gap-x-8 gap-y-3">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-slate-400 hover:text-violet-400 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-8 pt-8 border-t border-white/[0.06] text-center">
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} <span translate="no">TaskFlow</span>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
