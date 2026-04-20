import type { Metadata } from "next";
import Link from "next/link";
import {
  Truck,
  DollarSign,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  Star,
  Users,
  BarChart3,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Carrier Partnerships | Fast ACH Pay | Kopf Logistics Group",
  description:
    "Partner with Kopf Logistics Group. ACH payments, up to 40% of line haul (max $2,500/load) after 3 loads, consistent freight, and a team that communicates.",
};

const benefits = [
  {
    icon: DollarSign,
    title: "Fast ACH Pay",
    description:
      "After your first 3 loads, earn up to 40% of line haul — maximum $2,500 per load — paid via ACH. No factoring fees, no delays. We pay when we say we'll pay.",
    highlight: "Up to 40% Line Haul",
  },
  {
    icon: Shield,
    title: "Real Freight, Real Rates",
    description:
      "We don't play rate games. You'll know exactly what you're getting paid before you accept a load. Transparent pricing, no post-delivery deductions.",
    highlight: "No Surprises",
  },
  {
    icon: Truck,
    title: "Consistent Load Volume",
    description:
      "We work hard to keep our preferred carriers loaded — because we know empty miles cost you money. Once you're in our network, we think of you first.",
    highlight: "Preferred Partners",
  },
  {
    icon: Clock,
    title: "24/7 Dispatch Support",
    description:
      "Breakdowns, weather, delays — our team picks up the phone anytime. You're never left stranded on the side of the road without support.",
    highlight: "Always Reachable",
  },
  {
    icon: Users,
    title: "No-Hassle Setup",
    description:
      "Fast carrier setup with our compliance team. MC, DOT, W-9, and insurance verification handled efficiently so you can start hauling.",
    highlight: "Quick Onboarding",
  },
  {
    icon: BarChart3,
    title: "Rate Transparency",
    description:
      "We provide market intel on lane rates when you ask. We want you profitable — a carrier that makes money keeps hauling for us.",
    highlight: "Open Communication",
  },
];

const onboardingSteps = [
  { step: "01", title: "Contact Us", description: "Call or complete the carrier setup form below. Have your MC number and insurance certificate ready." },
  { step: "02", title: "Compliance Check", description: "Our carrier compliance team verifies your FMCSA authority, safety rating, and insurance within 24 hours." },
  { step: "03", title: "First Load", description: "Our team will match you with a load that fits your equipment and preferred lanes. Standard pay terms apply for loads 1–3." },
  { step: "04", title: "Preferred Status", description: "After 3 loads, you unlock our preferred carrier tier — faster pay, better rates, and first-call status on new freight." },
];

const requirements = [
  "Active FMCSA operating authority (MC number)",
  "Minimum $1,000,000 cargo insurance",
  "Minimum $1,000,000 general liability",
  "Satisfactory FMCSA safety rating",
  "Active DOT number",
  "Signed carrier agreement and W-9",
];

const testimonials = [
  {
    quote:
      "Kopf always has my rate confirmed before I pick up. They answer at 11 PM when my driver is stuck. That's all I ask — reliability. They deliver.",
    author: "Small Fleet Owner",
    company: "Dry Van, 4 trucks",
    rating: 5,
  },
  {
    quote:
      "Quick pay, honest rates, and they don't waste your time. I've been hauling for Kopf for two years and they're one of three brokers I actually trust.",
    author: "Owner-Operator",
    company: "Flatbed Specialist",
    rating: 5,
  },
];

export default function CarriersPage() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-stone-950 to-stone-950" />
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-5 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle at 80% 50%, #EA580C, transparent 60%)",
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-orange-600/20 border border-orange-600/40 rounded-full px-4 py-1.5 mb-6">
              <span className="text-orange-400 text-sm font-medium">For Carriers</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Freight that pays.
              <br />
              <span className="gradient-text">Partners that communicate.</span>
            </h1>
            <p className="text-xl text-stone-300 leading-relaxed mb-8">
              Kopf Logistics Group is built on long-term carrier relationships.
              We pay on time, we answer the phone, and we don&apos;t play games
              with your rate. Period.
            </p>
            <div className="flex flex-wrap gap-5 mb-10">
              {[
                { value: "Up to 40%", label: "of Line Haul" },
                { value: "$2,500", label: "Max Per Load" },
                { value: "3 Loads", label: "to Preferred Status" },
              ].map((stat) => (
                <div key={stat.label} className="bg-stone-900 border border-stone-800 rounded-lg px-5 py-3 text-center">
                  <div className="text-2xl font-bold text-orange-500">{stat.value}</div>
                  <div className="text-stone-400 text-xs mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#setup"
                className="inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold px-8 py-4 rounded transition-all duration-200"
              >
                Set Up as a Carrier
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

      {/* ── BENEFITS ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-3">
            Why Haul for Kopf
          </p>
          <h2 className="text-4xl font-bold text-white mb-4">
            A broker worth hauling for.
          </h2>
          <p className="text-stone-400 max-w-xl mx-auto">
            We know you have options. Here&apos;s why our preferred carriers
            keep coming back load after load.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="bg-stone-900 border border-stone-800 hover:border-orange-600/40 rounded-xl p-6 bento-card"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-orange-600/15 rounded-lg flex items-center justify-center">
                  <benefit.icon className="w-5 h-5 text-orange-500" />
                </div>
                <span className="text-xs text-orange-400 font-medium bg-orange-600/10 border border-orange-600/20 rounded-full px-3 py-1">
                  {benefit.highlight}
                </span>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{benefit.title}</h3>
              <p className="text-stone-400 text-sm leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ONBOARDING ── */}
      <section className="py-20 bg-stone-900/50 border-y border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-3">
              Getting Started
            </p>
            <h2 className="text-4xl font-bold text-white mb-4">
              Setup takes 24 hours.
            </h2>
            <p className="text-stone-400 max-w-xl mx-auto">
              Our carrier onboarding is fast and painless. From first contact to first
              load in less than 48 hours.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {onboardingSteps.map((step) => (
              <div key={step.step} className="text-center">
                <div className="text-6xl font-black text-orange-600/15 mb-3">{step.step}</div>
                <h3 className="text-white font-semibold mb-2">{step.title}</h3>
                <p className="text-stone-400 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REQUIREMENTS & TESTIMONIALS ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16">
          <div>
            <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-3">
              Requirements
            </p>
            <h2 className="text-3xl font-bold text-white mb-6">What you&apos;ll need.</h2>
            <p className="text-stone-400 mb-6 text-sm leading-relaxed">
              Standard requirements for all carriers in our network. If you have
              an active authority and clean safety rating, you&apos;re likely a good
              fit.
            </p>
            <div className="flex flex-col gap-3">
              {requirements.map((req) => (
                <div key={req} className="flex items-center gap-3 py-2.5 border-b border-stone-800">
                  <CheckCircle className="w-4 h-4 text-orange-500 shrink-0" />
                  <span className="text-stone-300 text-sm">{req}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-3">
              What Carriers Say
            </p>
            <h2 className="text-3xl font-bold text-white mb-6">From our carriers.</h2>
            <div className="flex flex-col gap-5">
              {testimonials.map((t, i) => (
                <div key={i} className="bg-stone-900 border border-stone-800 rounded-xl p-5">
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-orange-500 text-orange-500" />
                    ))}
                  </div>
                  <blockquote className="text-stone-300 text-sm italic mb-3">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <div className="border-t border-stone-800 pt-3">
                    <p className="text-white text-sm font-medium">{t.author}</p>
                    <p className="text-stone-500 text-xs">{t.company}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SETUP FORM ── */}
      <section id="setup" className="py-20 bg-stone-900/50 border-y border-stone-800">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">Carrier Setup Form</h2>
            <p className="text-stone-400">
              Submit your information and our compliance team will reach out within one
              business day.
            </p>
          </div>

          <form
            action="https://formspree.io/f/xqaqkqkp"
            method="POST"
            className="bg-stone-900 border border-stone-800 rounded-xl p-8 flex flex-col gap-5"
          >
            <input type="hidden" name="form_type" value="carrier_setup" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-stone-400 text-sm mb-1.5">Company Name *</label>
                <input name="company" type="text" required placeholder="ABC Trucking LLC"
                  className="w-full bg-stone-950 border border-stone-700 rounded px-4 py-2.5 text-white text-sm placeholder-stone-600 focus:border-orange-600 transition-colors" />
              </div>
              <div>
                <label className="block text-stone-400 text-sm mb-1.5">MC Number *</label>
                <input name="mc_number" type="text" required placeholder="MC-123456"
                  className="w-full bg-stone-950 border border-stone-700 rounded px-4 py-2.5 text-white text-sm placeholder-stone-600 focus:border-orange-600 transition-colors" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-stone-400 text-sm mb-1.5">Contact Name *</label>
                <input name="contact_name" type="text" required placeholder="John Smith"
                  className="w-full bg-stone-950 border border-stone-700 rounded px-4 py-2.5 text-white text-sm placeholder-stone-600 focus:border-orange-600 transition-colors" />
              </div>
              <div>
                <label className="block text-stone-400 text-sm mb-1.5">Phone *</label>
                <input name="phone" type="tel" required placeholder="(555) 000-0000"
                  className="w-full bg-stone-950 border border-stone-700 rounded px-4 py-2.5 text-white text-sm placeholder-stone-600 focus:border-orange-600 transition-colors" />
              </div>
            </div>
            <div>
              <label className="block text-stone-400 text-sm mb-1.5">Email *</label>
              <input name="email" type="email" required placeholder="dispatch@company.com"
                className="w-full bg-stone-950 border border-stone-700 rounded px-4 py-2.5 text-white text-sm placeholder-stone-600 focus:border-orange-600 transition-colors" />
            </div>
            <div>
              <label className="block text-stone-400 text-sm mb-1.5">Equipment Type</label>
              <select name="equipment" className="w-full bg-stone-950 border border-stone-700 rounded px-4 py-2.5 text-white text-sm focus:border-orange-600 transition-colors">
                <option value="">Select...</option>
                <option>Dry Van</option>
                <option>Refrigerated / Reefer</option>
                <option>Flatbed</option>
                <option>Step Deck</option>
                <option>RGN / Lowboy</option>
                <option>Tanker</option>
                <option>Bulk / Hopper</option>
                <option>Power Only</option>
                <option>Multiple Types</option>
              </select>
            </div>
            <div>
              <label className="block text-stone-400 text-sm mb-1.5">Number of Trucks</label>
              <select name="fleet_size" className="w-full bg-stone-950 border border-stone-700 rounded px-4 py-2.5 text-white text-sm focus:border-orange-600 transition-colors">
                <option value="">Select...</option>
                <option>Owner-Operator (1 truck)</option>
                <option>2–5 trucks</option>
                <option>6–20 trucks</option>
                <option>21–50 trucks</option>
                <option>50+ trucks</option>
              </select>
            </div>
            <div>
              <label className="block text-stone-400 text-sm mb-1.5">Preferred Lanes / Notes</label>
              <textarea name="message" rows={3} placeholder="Home base, preferred regions, any notes..."
                className="w-full bg-stone-950 border border-stone-700 rounded px-4 py-2.5 text-white text-sm placeholder-stone-600 focus:border-orange-600 transition-colors resize-none" />
            </div>
            <button type="submit"
              className="w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold py-3.5 rounded transition-colors duration-200 flex items-center justify-center gap-2">
              Submit Carrier Setup
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
