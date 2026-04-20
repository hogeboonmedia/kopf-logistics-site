import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Truck,
  Thermometer,
  Package,
  ArrowRight,
  CheckCircle,
  Clock,
  Shield,
  Zap,
  BarChart3,
  RefreshCw,
  ChevronRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Freight Shipping Services for Shippers | Kopf Logistics Group",
  description:
    "Truckload, temperature-controlled, open-deck, LTL & bulk transport across 48 states. Get a freight quote from Kopf Logistics Group — Elkhart, Indiana.",
};

const services = [
  {
    icon: Truck,
    title: "Truckload (FTL)",
    description:
      "Full truckload freight across the continental US. We source van, reefer, and flatbed capacity on your lanes — dedicated, spot, or contract. Our relationships with thousands of carrier partners mean we find the right truck at the right price.",
    features: ["Van, reefer & flatbed options", "Spot & contract rates", "Dedicated lane management", "24/7 load tracking"],
  },
  {
    icon: Thermometer,
    title: "Temperature-Controlled",
    description:
      "Refrigerated and frozen freight handled with the precision it demands. From produce to pharmaceuticals, we match your commodity to food-grade, FDA-compliant carriers with continuous temp monitoring.",
    features: ["Continuous temperature monitoring", "Food-grade equipment", "FDA-compliant carriers", "Precooling & pre-trip inspection"],
  },
  {
    icon: Package,
    title: "Open-Deck & Flatbed",
    description:
      "Specialized freight is our specialty. Oversized loads, heavy haul, step deck, RGN, and lowboy — we navigate permitting, route surveys, and pilot car requirements so you don't have to.",
    features: ["Step deck & flatbed", "RGN & lowboy", "Oversize permitting", "Pilot car coordination"],
  },
  {
    icon: Zap,
    title: "LTL Shipping",
    description:
      "Less-than-truckload freight optimized for cost and transit time. We consolidate your LTL shipments and negotiate carrier rates based on our collective volume — savings you can't get on your own.",
    features: ["National LTL network", "Volume-based pricing", "Shipment consolidation", "Bill of lading management"],
  },
  {
    icon: BarChart3,
    title: "Bulk Transport",
    description:
      "Grain, aggregate, liquid, and bulk commodity hauling with specialized equipment. Tanker, hopper, pneumatic, and dump trailer solutions for agriculture, manufacturing, and construction freight.",
    features: ["Tanker & liquid bulk", "Dry bulk & pneumatic", "Hopper & dump trailer", "Agricultural commodities"],
  },
  {
    icon: RefreshCw,
    title: "Power Only & Drop-Trailer",
    description:
      "Maximize your trailer utilization with our power-only and drop-trailer programs. We provide the truck; you keep control of your equipment and loading schedule.",
    features: ["Owner-operator power units", "Drop & hook efficiency", "Trailer interchange programs", "Flexible scheduling"],
  },
];

const whyKopf = [
  {
    icon: Shield,
    title: "One Call, Total Coverage",
    description:
      "Every mode. Every lane. Stop managing multiple brokers and consolidate your freight program with a single partner who can handle it all.",
  },
  {
    icon: Clock,
    title: "24/7 Dispatch & Support",
    description:
      "Your freight doesn't sleep and neither do we. Our dispatch team is available around the clock for load updates, exceptions, and urgent capacity.",
  },
  {
    icon: CheckCircle,
    title: "Carrier Compliance",
    description:
      "Every carrier in our network is thoroughly vetted — FMCSA authority, insurance, safety ratings, and on-site inspections for high-value freight.",
  },
  {
    icon: Truck,
    title: "McLeod TMS Visibility",
    description:
      "Real-time visibility powered by McLeod TMS. Track your shipments, access BOLs, and pull reporting — all in one cloud-based platform.",
  },
];

const process = [
  { step: "01", title: "Request a Quote", description: "Tell us your freight details — origin, destination, commodity, weight, and timeline. We respond within the hour." },
  { step: "02", title: "We Source Capacity", description: "Our team works our carrier network to find the best fit for your load — price, transit time, and equipment." },
  { step: "03", title: "Load Confirmation", description: "You receive a rate confirmation and carrier assignment. BOL and tracking are set up immediately." },
  { step: "04", title: "Freight Moves", description: "We monitor the load door-to-door. Any exception? You'll hear from us before you have to ask." },
];

export default function ShippersPage() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.pexels.com/photos/906494/pexels-photo-906494.jpeg?auto=compress&cs=tinysrgb&w=1920&h=800&fit=crop"
            alt="Freight warehouse and logistics operations"
            fill
            priority
            className="object-cover object-center opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/70 via-stone-950/80 to-stone-950" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-orange-600/20 border border-orange-600/40 rounded-full px-4 py-1.5 mb-6">
              <span className="text-orange-400 text-sm font-medium">For Shippers</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Move freight with
              <br />
              <span className="gradient-text">confidence.</span>
            </h1>
            <p className="text-xl text-stone-300 leading-relaxed mb-8">
              Manufacturers and distributors across North America trust Kopf
              Logistics Group to source reliable capacity, navigate complexity,
              and deliver — every time. Every mode. Every lane.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#quote"
                className="inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold px-8 py-4 rounded transition-all duration-200"
              >
                Get a Freight Quote
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="tel:5742640990"
                className="inline-flex items-center justify-center gap-2 border border-stone-700 hover:border-stone-500 text-white font-medium px-8 py-4 rounded transition-colors duration-200"
              >
                Call (574) 264-0990
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-3">
            Transportation Modes
          </p>
          <h2 className="text-4xl font-bold text-white mb-4">
            Every mode of transport, covered.
          </h2>
          <p className="text-stone-400 max-w-2xl mx-auto">
            From a single pallet to a multi-stop mega-load, Kopf has the
            carrier relationships and expertise to move any freight, anywhere in
            the continental US.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.title}
              className="bg-stone-900 border border-stone-800 hover:border-orange-600/40 rounded-xl p-6 transition-all duration-300 bento-card"
            >
              <div className="w-10 h-10 bg-orange-600/15 rounded-lg flex items-center justify-center mb-4">
                <service.icon className="w-5 h-5 text-orange-500" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-3">{service.title}</h3>
              <p className="text-stone-400 text-sm leading-relaxed mb-4">
                {service.description}
              </p>
              <ul className="flex flex-col gap-2">
                {service.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-stone-500">
                    <CheckCircle className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 bg-stone-900/50 border-y border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-3">
              Process
            </p>
            <h2 className="text-4xl font-bold text-white mb-4">
              How it works.
            </h2>
            <p className="text-stone-400 max-w-xl mx-auto">
              From your first call to final delivery, here's what working with
              Kopf looks like.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {process.map((step, i) => (
              <div key={step.step} className="relative">
                {i < process.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-full w-full h-0.5 bg-stone-800 z-0" style={{ width: "calc(100% - 48px)", left: "48px" }} />
                )}
                <div className="relative z-10">
                  <div className="text-5xl font-black text-orange-600/20 mb-3">{step.step}</div>
                  <h3 className="text-white font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-stone-400 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY KOPF ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-3">
              The Kopf Advantage
            </p>
            <h2 className="text-4xl font-bold text-white mb-6">
              Not just a broker.
              <br />
              <span className="gradient-text">Your logistics partner.</span>
            </h2>
            <p className="text-stone-400 leading-relaxed mb-8">
              After 50+ years in freight, we've learned that shippers don't
              just need capacity — they need a partner who understands their
              business. Kopf assigns you a dedicated team that learns your
              freight, your deadlines, and your customers.
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-400 font-medium transition-colors"
            >
              Learn about Kopf <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {whyKopf.map((item) => (
              <div
                key={item.title}
                className="bg-stone-900 border border-stone-800 rounded-xl p-5"
              >
                <div className="w-9 h-9 bg-orange-600/15 rounded-lg flex items-center justify-center mb-3">
                  <item.icon className="w-4 h-4 text-orange-500" />
                </div>
                <h3 className="text-white font-semibold text-sm mb-1.5">{item.title}</h3>
                <p className="text-stone-400 text-xs leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUOTE FORM ── */}
      <section id="quote" className="py-20 bg-stone-900/50 border-y border-stone-800">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">Request a Freight Quote</h2>
            <p className="text-stone-400">
              Fill out the form below and a Kopf logistics specialist will
              respond within one business hour.
            </p>
          </div>

          <form
            action="https://formspree.io/f/xqaqkqkp"
            method="POST"
            className="bg-stone-900 border border-stone-800 rounded-xl p-8 flex flex-col gap-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-stone-400 text-sm mb-1.5">Full Name *</label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="Jane Smith"
                  className="w-full bg-stone-950 border border-stone-700 rounded px-4 py-2.5 text-white text-sm placeholder-stone-600 focus:border-orange-600 focus:ring-0 transition-colors"
                />
              </div>
              <div>
                <label className="block text-stone-400 text-sm mb-1.5">Company *</label>
                <input
                  name="company"
                  type="text"
                  required
                  placeholder="Acme Manufacturing"
                  className="w-full bg-stone-950 border border-stone-700 rounded px-4 py-2.5 text-white text-sm placeholder-stone-600 focus:border-orange-600 focus:ring-0 transition-colors"
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
                  className="w-full bg-stone-950 border border-stone-700 rounded px-4 py-2.5 text-white text-sm placeholder-stone-600 focus:border-orange-600 focus:ring-0 transition-colors"
                />
              </div>
              <div>
                <label className="block text-stone-400 text-sm mb-1.5">Phone</label>
                <input
                  name="phone"
                  type="tel"
                  placeholder="(555) 000-0000"
                  className="w-full bg-stone-950 border border-stone-700 rounded px-4 py-2.5 text-white text-sm placeholder-stone-600 focus:border-orange-600 focus:ring-0 transition-colors"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-stone-400 text-sm mb-1.5">Origin (City, State)</label>
                <input
                  name="origin"
                  type="text"
                  placeholder="Chicago, IL"
                  className="w-full bg-stone-950 border border-stone-700 rounded px-4 py-2.5 text-white text-sm placeholder-stone-600 focus:border-orange-600 focus:ring-0 transition-colors"
                />
              </div>
              <div>
                <label className="block text-stone-400 text-sm mb-1.5">Destination (City, State)</label>
                <input
                  name="destination"
                  type="text"
                  placeholder="Dallas, TX"
                  className="w-full bg-stone-950 border border-stone-700 rounded px-4 py-2.5 text-white text-sm placeholder-stone-600 focus:border-orange-600 focus:ring-0 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-stone-400 text-sm mb-1.5">Freight Type / Commodity</label>
              <select
                name="freight_type"
                className="w-full bg-stone-950 border border-stone-700 rounded px-4 py-2.5 text-white text-sm focus:border-orange-600 focus:ring-0 transition-colors"
              >
                <option value="">Select a mode...</option>
                <option>Truckload (FTL)</option>
                <option>LTL</option>
                <option>Temperature-Controlled / Reefer</option>
                <option>Flatbed / Open-Deck</option>
                <option>Bulk / Tanker</option>
                <option>Power Only / Drop-Trailer</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-stone-400 text-sm mb-1.5">Additional Details</label>
              <textarea
                name="message"
                rows={4}
                placeholder="Commodity, weight, pickup date, special requirements..."
                className="w-full bg-stone-950 border border-stone-700 rounded px-4 py-2.5 text-white text-sm placeholder-stone-600 focus:border-orange-600 focus:ring-0 transition-colors resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold py-3.5 rounded transition-colors duration-200 flex items-center justify-center gap-2"
            >
              Submit Quote Request
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-stone-600 text-xs text-center">
              We respond within 1 business hour. Or call us directly at (574) 264-0990.
            </p>
          </form>
        </div>
      </section>
    </>
  );
}
