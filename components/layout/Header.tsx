"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Truck } from "lucide-react";

const navLinks = [
  { href: "/shippers", label: "Shippers" },
  { href: "/freight-agents", label: "Freight Agents" },
  { href: "/carriers", label: "Carriers" },
  { href: "/drivers", label: "Drivers" },
  { href: "/technology", label: "Technology" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#1C1917]/95 backdrop-blur-md border-b border-stone-800 shadow-xl"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-[#EA580C] rounded flex items-center justify-center group-hover:bg-orange-500 transition-colors">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-white font-bold text-sm tracking-wide">KOPF</span>
              <span className="text-stone-400 text-[10px] tracking-widest uppercase">Logistics Group</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-stone-300 hover:text-white text-sm font-medium transition-colors duration-200 relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#EA580C] group-hover:w-full transition-all duration-200" />
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/contact"
              className="text-sm font-medium text-stone-300 hover:text-white transition-colors"
            >
              (574) 264-0990
            </Link>
            <Link
              href="/shippers#quote"
              className="bg-[#EA580C] hover:bg-orange-500 text-white text-sm font-semibold px-4 py-2 rounded transition-colors duration-200"
            >
              Get a Quote
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden text-stone-300 hover:text-white transition-colors p-1"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#1C1917]/98 backdrop-blur-md border-b border-stone-800">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-stone-300 hover:text-white text-base font-medium py-2 border-b border-stone-800 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 flex flex-col gap-3">
              <a href="tel:5742640990" className="text-stone-400 text-sm">
                (574) 264-0990
              </a>
              <Link
                href="/shippers#quote"
                className="bg-[#EA580C] hover:bg-orange-500 text-white text-sm font-semibold px-4 py-3 rounded text-center transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Get a Quote
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
