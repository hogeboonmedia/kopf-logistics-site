import type { Metadata } from "next";
import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowRight,
  Truck,
  TrendingUp,
  Package,
  Shield,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Kopf Logistics Group | Elkhart Indiana Freight Broker",
  description:
    "Contact Kopf Logistics Group at (574) 264-0990. Headquarters at 2311 Toledo Road, Elkhart, IN. Terminals in Athens, GA and Seaford, DE.",
};

const locations = [
  {
    name: "Elkhart, Indiana",
    label: "Headquarters",
    address: "2311 Toledo Road",
    city: "Elkhart, IN 46516",
    phone: "(574) 264-0990",
    hours: "Mon–Fri 7:00 AM – 6:00 PM CT",
    primary: true,
  },
  {
    name: "Athens, Georgia",
    label: "Terminal",
    address: "Terminal Location",
    city: "Athens, GA",
    phone: "(574) 264-0990",
    hours: "Mon–Fri 8:00 AM – 5:00 PM ET",
    primary: false,
  },
  {
    name: "Seaford, Delaware",
    label: "Terminal",
    address: "Terminal Location",
    city: "Seaford, DE",
    phone: "(574) 264-0990",
    hours: "Mon–Fri 8:00 AM – 5:00 PM ET",
    primary: false,
  },
];

const quickLinks = [
  {
    icon: Package,
    title: "Get a Freight Quote",
    description: "Shippers: get competitive rates in under an hour.",
    href: "/shippers#quote",
    cta: "Request a Quote",
  },
  {
    icon: TrendingUp,
    title: "Agent Application",
    description: "Independent agents: apply for a 70/30 split.",
    href: "/freight-agents#apply",
    cta: "Apply Now",
  },
  {
    icon: Truck,
    title: "Carrier Setup",
    description: "Carriers: start hauling Kopf freight this week.",
    href: "/carriers#setup",
    cta: "Set Up Now",
  },
  {
    icon: Shield,
    title: "Driver Inquiries",
    description: "Questions about safety, freight, or partnerships.",
    href: "/drivers",
    cta: "Learn More",
  },
];

export default function ContactPage() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-orange-600/20 border border-orange-600/40 rounded-full px-4 py-1.5 mb-6">
              <span className="text-orange-400 text-sm font-medium">Get In Touch</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Let&apos;s talk
              <br />
              <span className="gradient-text">freight.</span>
            </h1>
            <p className="text-xl text-stone-300 leading-relaxed">
              Whether you need a spot rate, want to discuss a long-term
              partnership, or are ready to join our agent team — our people pick
              up the phone.
            </p>
          </div>
        </div>
      </section>

      {/* ── QUICK LINKS ── */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((link) => (
              <Link
                key={link.title}
                href={link.href}
                className="bg-stone-900 border border-stone-800 hover:border-orange-600/40 rounded-xl p-5 group bento-card"
              >
                <div className="w-9 h-9 bg-orange-600/15 rounded-lg flex items-center justify-center mb-3 group-hover:bg-orange-600/25 transition-colors">
                  <link.icon className="w-4 h-4 text-orange-500" />
                </div>
                <h3 className="text-white font-semibold text-sm mb-1.5">{link.title}</h3>
                <p className="text-stone-400 text-xs leading-relaxed mb-3">{link.description}</p>
                <span className="text-orange-500 text-xs font-medium flex items-center gap-1">
                  {link.cta} <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 border-t border-stone-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Send us a message</h2>
              <p className="text-stone-400 text-sm mb-8">
                We respond to all inquiries within one business hour during office
                hours. For urgent freight needs, call us directly.
              </p>

              <form
                action="https://formspree.io/f/xqaqkqkp"
                method="POST"
                className="flex flex-col gap-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-stone-400 text-sm mb-1.5">Full Name *</label>
                    <input
                      name="name"
                      type="text"
                      required
                      placeholder="Jane Smith"
                      className="w-full bg-stone-900 border border-stone-700 rounded px-4 py-2.5 text-white text-sm placeholder-stone-600 focus:border-orange-600 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 text-sm mb-1.5">Company</label>
                    <input
                      name="company"
                      type="text"
                      placeholder="Your company"
                      className="w-full bg-stone-900 border border-stone-700 rounded px-4 py-2.5 text-white text-sm placeholder-stone-600 focus:border-orange-600 transition-colors"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-stone-400 text-sm mb-1.5">Email *</label>
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="jane@company.com"
                      className="w-full bg-stone-900 border border-stone-700 rounded px-4 py-2.5 text-white text-sm placeholder-stone-600 focus:border-orange-600 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 text-sm mb-1.5">Phone</label>
                    <input
                      name="phone"
                      type="tel"
                      placeholder="(555) 000-0000"
                      className="w-full bg-stone-900 border border-stone-700 rounded px-4 py-2.5 text-white text-sm placeholder-stone-600 focus:border-orange-600 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-stone-400 text-sm mb-1.5">I am a...</label>
                  <select
                    name="inquiry_type"
                    className="w-full bg-stone-900 border border-stone-700 rounded px-4 py-2.5 text-white text-sm focus:border-orange-600 transition-colors"
                  >
                    <option value="">Select...</option>
                    <option>Shipper needing freight services</option>
                    <option>Independent freight agent interested in joining</option>
                    <option>Carrier wanting to partner with Kopf</option>
                    <option>Driver with questions</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-400 text-sm mb-1.5">Message *</label>
                  <textarea
                    name="message"
                    rows={5}
                    required
                    placeholder="How can we help you?"
                    className="w-full bg-stone-900 border border-stone-700 rounded px-4 py-2.5 text-white text-sm placeholder-stone-600 focus:border-orange-600 transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold py-3.5 rounded transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  Send Message
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-stone-600 text-xs">
                  For urgent freight, call us directly at (574) 264-0990. 24/7 dispatch available.
                </p>
              </form>
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Contact information</h2>
              <p className="text-stone-400 text-sm mb-8">
                Reach us by phone, email, or visit one of our three terminal locations.
              </p>

              {/* Direct contact */}
              <div className="flex flex-col gap-4 mb-10">
                <a
                  href="tel:5742640990"
                  className="flex items-center gap-4 p-4 bg-stone-900 border border-stone-800 rounded-xl hover:border-stone-700 transition-colors group"
                >
                  <div className="w-10 h-10 bg-orange-600/15 rounded-lg flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-white font-medium">(574) 264-0990</p>
                    <p className="text-stone-500 text-xs">Main line — 24/7 dispatch</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-600 group-hover:text-orange-500 transition-colors ml-auto" />
                </a>
                <a
                  href="mailto:info@kopflogisticsgroup.com"
                  className="flex items-center gap-4 p-4 bg-stone-900 border border-stone-800 rounded-xl hover:border-stone-700 transition-colors group"
                >
                  <div className="w-10 h-10 bg-orange-600/15 rounded-lg flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-white font-medium">info@kopflogisticsgroup.com</p>
                    <p className="text-stone-500 text-xs">General inquiries</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-600 group-hover:text-orange-500 transition-colors ml-auto" />
                </a>
              </div>

              {/* Locations */}
              <h3 className="text-white font-semibold mb-4">Our Locations</h3>
              <div className="flex flex-col gap-4">
                {locations.map((loc) => (
                  <div
                    key={loc.name}
                    className={`p-5 rounded-xl border ${
                      loc.primary
                        ? "bg-orange-600/10 border-orange-600/30"
                        : "bg-stone-900 border-stone-800"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                      <span className="text-white font-semibold text-sm">{loc.name}</span>
                      {loc.primary && (
                        <span className="text-xs text-orange-400 bg-orange-600/10 border border-orange-600/20 rounded-full px-2 py-0.5">
                          HQ
                        </span>
                      )}
                    </div>
                    <div className="pl-6 flex flex-col gap-1">
                      <p className="text-stone-400 text-sm">{loc.address}</p>
                      <p className="text-stone-400 text-sm">{loc.city}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3.5 h-3.5 text-stone-600" />
                        <p className="text-stone-500 text-xs">{loc.hours}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── EMERGENCY DISPATCH ── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 mt-10 bg-stone-900/50 border-t border-stone-800">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-orange-600/10 to-transparent border border-orange-600/20 rounded-xl p-8 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center shrink-0">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-white font-bold text-xl mb-1">24/7 Dispatch & Emergency Line</h3>
              <p className="text-stone-400 text-sm">
                Load emergencies don&apos;t follow business hours. Our dispatch team is available around
                the clock for breakdowns, weather delays, and urgent capacity needs.
              </p>
            </div>
            <a
              href="tel:5742640990"
              className="shrink-0 inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold px-6 py-3 rounded transition-colors duration-200"
            >
              <Phone className="w-4 h-4" />
              (574) 264-0990
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
