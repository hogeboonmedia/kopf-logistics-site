import Link from "next/link";
import { Truck, MapPin, Phone, Mail, Clock } from "lucide-react";

const footerLinks = {
  services: [
    { href: "/shippers", label: "Shippers" },
    { href: "/freight-agents", label: "Freight Agents" },
    { href: "/carriers", label: "Carriers" },
    { href: "/drivers", label: "Drivers" },
  ],
  company: [
    { href: "/about", label: "About Us" },
    { href: "/technology", label: "Technology" },
    { href: "/contact", label: "Contact" },
  ],
  legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-stone-950 border-t border-stone-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#EA580C] rounded flex items-center justify-center">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-white font-bold text-sm tracking-wide">KOPF</span>
                <span className="text-stone-500 text-[10px] tracking-widest uppercase">Logistics Group</span>
              </div>
            </Link>
            <p className="text-stone-400 text-sm leading-relaxed mb-4">
              People Powered Logistics. Serving shippers, agents, carriers, and drivers for over 50 years from Elkhart, Indiana.
            </p>
            <div className="flex flex-col gap-2 text-sm text-stone-400">
              <a href="tel:5742640990" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="w-4 h-4 text-[#EA580C]" />
                (574) 264-0990
              </a>
              <a href="mailto:info@kopflogistics.com" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="w-4 h-4 text-[#EA580C]" />
                info@kopflogistics.com
              </a>
              <span className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#EA580C] mt-0.5 shrink-0" />
                2311 Toledo Road<br />Elkhart, IN 46516
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#EA580C]" />
                Mon–Fri 7:00 AM – 6:00 PM CT
              </span>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Services</h3>
            <ul className="flex flex-col gap-2">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-stone-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Company</h3>
            <ul className="flex flex-col gap-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-stone-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA column */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Get Started</h3>
            <p className="text-stone-400 text-sm mb-4">
              Ready to move freight or grow your business? Let&apos;s talk.
            </p>
            <Link
              href="/shippers#quote"
              className="inline-block bg-[#EA580C] hover:bg-orange-500 text-white text-sm font-semibold px-4 py-2.5 rounded transition-colors duration-200 mb-3"
            >
              Get a Quote
            </Link>
            <br />
            <Link
              href="/freight-agents#apply"
              className="inline-block border border-stone-700 hover:border-stone-500 text-stone-300 hover:text-white text-sm font-medium px-4 py-2.5 rounded transition-colors duration-200"
            >
              Agent Application
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-stone-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Kopf Logistics Group. All rights reserved.</p>
          <div className="flex gap-4">
            {footerLinks.legal.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-stone-300 transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
