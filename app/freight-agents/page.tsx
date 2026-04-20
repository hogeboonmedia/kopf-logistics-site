import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  Shield,
  ArrowRight,
  CheckCircle,
  Briefcase,
  BarChart3,
  Star,
  ChevronRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Independent Freight Agent Opportunities | 70/30 Split | Kopf Logistics",
  description:
    "Join Kopf Logistics as an independent freight agent. 70/30 commission split, weekly settlements, 300+ years of combined team experience, full back-office support.",
};

const benefits = [
  {
    icon: DollarSign,
    title: "70/30 Commission Split",
    description:
      "Industry-leading split with no hidden fees, no chargebacks, and no arbitrary deductions. What you earn, you keep — paid weekly upon billing with clean paperwork.",
    highlight: "Best in the Industry",
  },
  {
    icon: Clock,
    title: "Weekly Settlements",
    description:
      "Get paid weekly once billing is complete with clean paperwork. No 30-day net, no excuses. We know cash flow matters when you're building a book.",
    highlight: "Fast Pay",
  },
  {
    icon: Shield,
    title: "Full Back-Office Support",
    description:
      "Billing, carrier setup, collections, claims, and compliance — all handled by our experienced back-office team so you can focus on what you do best: building relationships.",
    highlight: "We Handle the Admin",
  },
  {
    icon: BarChart3,
    title: "McLeod TMS Access",
    description:
      "Operate on the same enterprise-grade platform that powers our entire brokerage. Real-time tracking, quoting tools, and full load visibility from day one.",
    highlight: "Enterprise Technology",
  },
  {
    icon: Users,
    title: "300+ Years Combined Experience",
    description:
      "When you join Kopf, you join a team. Our internal agents have worked every lane, every mode, and every market condition. Pick up the phone and ask.",
    highlight: "Real Mentorship",
  },
  {
    icon: Briefcase,
    title: "Your Book. Your Business.",
    description:
      "We don't compete with our agents. Your shipper relationships are yours. We provide the infrastructure; you maintain ownership of every account you bring.",
    highlight: "You Own It",
  },
];

const differentiators = [
  "No non-compete agreements",
  "No territory restrictions",
  "No minimum volume requirements to start",
  "Established carrier network from day one",
  "Group health insurance options",
  "Errors & Omissions coverage available",
  "Fuel cost visibility tools",
  "Multi-modal capabilities (FTL, LTL, reefer, flatbed, bulk)",
];

const testimonials = [
  {
    quote:
      "I spent 12 years at a larger broker and left a lot on the table. Three years at Kopf and I've tripled my income. The 70/30 is real, the settlements are on time, and these people actually answer the phone.",
    author: "Senior Freight Agent",
    years: "3 years with Kopf",
    rating: 5,
  },
  {
    quote:
      "Starting fresh in freight felt overwhelming. Kopf's back-office handled everything I didn't know how to do yet. I closed my first load in week one. Now I run a six-figure book.",
    author: "Independent Agent",
    years: "2 years with Kopf",
    rating: 5,
  },
];

const steps = [
  { step: "01", title: "Apply Online", description: "Fill out our short application. Tell us about your freight experience and book." },
  { step: "02", title: "Discovery Call", description: "A 30-minute call with our team to discuss your goals, your lanes, and how Kopf fits." },
  { step: "03", title: "Agreement & Onboarding", description: "Simple, transparent agent agreement. Onboarding takes less than a week." },
  { step: "04", title: "First Load", description: "You quote. We back you. Your first load ships and your first settlement hits the next week." },
];

export default function FreightAgentsPage() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-stone-950 to-stone-950" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, #EA580C 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-orange-600/20 border border-orange-600/40 rounded-full px-4 py-1.5 mb-6">
              <span className="text-orange-400 text-sm font-medium">For Independent Freight Agents</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Grow your book.
              <br />
              <span className="gradient-text">Keep what you earn.</span>
            </h1>
            <p className="text-xl text-stone-300 leading-relaxed mb-8">
              Kopf Logistics Group offers independent freight agents the most
              competitive split in the industry — backed by 50 years of
              relationships, real back-office support, and a team that actually
              picks up the phone.
            </p>
            <div className="flex flex-wrap gap-6 mb-10">
              {[
                { value: "70/30", label: "Commission Split" },
                { value: "Weekly", label: "Settlements" },
                { value: "300+", label: "Yrs Combined Exp." },
              ].map((stat) => (
                <div key={stat.label} className="bg-stone-900 border border-stone-800 rounded-lg px-5 py-3 text-center">
                  <div className="text-2xl font-bold text-orange-500">{stat.value}</div>
                  <div className="text-stone-400 text-xs mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#apply"
                className="inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold px-8 py-4 rounded transition-all duration-200"
              >
                Apply Now
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
            Agent Benefits
          </p>
          <h2 className="text-4xl font-bold text-white mb-4">
            Everything you need to thrive.
          </h2>
          <p className="text-stone-400 max-w-xl mx-auto">
            We built our agent program for experienced freight professionals who
            want to build something lasting — without the corporate politics.
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

      {/* ── DIFFERENTIATORS ── */}
      <section className="py-20 bg-stone-900/50 border-y border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-3">
                No Fine Print
              </p>
              <h2 className="text-4xl font-bold text-white mb-6">
                We don&apos;t compete
                <br />
                <span className="gradient-text">with our agents.</span>
              </h2>
              <p className="text-stone-400 leading-relaxed mb-8">
                At Kopf, your book is your book. We don't have a house team
                poaching your accounts. We don't enforce non-competes. We don't
                set volume minimums that put you at risk. We just provide the
                best infrastructure in the industry and get out of your way.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-400 font-medium transition-colors"
              >
                Meet the Kopf team <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div>
              <div className="grid grid-cols-1 gap-3">
                {differentiators.map((d) => (
                  <div key={d} className="flex items-center gap-3 py-3 border-b border-stone-800 last:border-0">
                    <CheckCircle className="w-4 h-4 text-orange-500 shrink-0" />
                    <span className="text-stone-300 text-sm">{d}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">From the agents themselves.</h2>
          <p className="text-stone-400">Real people who made the switch to Kopf.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-stone-900 border border-stone-800 rounded-xl p-6">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-orange-500 text-orange-500" />
                ))}
              </div>
              <blockquote className="text-stone-300 text-sm leading-relaxed italic mb-4">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="border-t border-stone-800 pt-4">
                <p className="text-white font-medium text-sm">{t.author}</p>
                <p className="text-stone-500 text-xs mt-0.5">{t.years}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW TO JOIN ── */}
      <section className="py-20 bg-stone-900/50 border-y border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-3">
              How to Join
            </p>
            <h2 className="text-4xl font-bold text-white mb-4">
              Start in under a week.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map((step) => (
              <div key={step.step} className="text-center">
                <div className="text-6xl font-black text-orange-600/15 mb-3">{step.step}</div>
                <h3 className="text-white font-semibold mb-2">{step.title}</h3>
                <p className="text-stone-400 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── APPLICATION FORM ── */}
      <section id="apply" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">Agent Application</h2>
            <p className="text-stone-400">
              Tell us about yourself. We&apos;ll follow up within one business day.
            </p>
          </div>

          <form
            action="https://formspree.io/f/xqaqkqkp"
            method="POST"
            className="bg-stone-900 border border-stone-800 rounded-xl p-8 flex flex-col gap-5"
          >
            <input type="hidden" name="form_type" value="agent_application" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-stone-400 text-sm mb-1.5">Full Name *</label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="Your name"
                  className="w-full bg-stone-950 border border-stone-700 rounded px-4 py-2.5 text-white text-sm placeholder-stone-600 focus:border-orange-600 transition-colors"
                />
              </div>
              <div>
                <label className="block text-stone-400 text-sm mb-1.5">Email *</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@email.com"
                  className="w-full bg-stone-950 border border-stone-700 rounded px-4 py-2.5 text-white text-sm placeholder-stone-600 focus:border-orange-600 transition-colors"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-stone-400 text-sm mb-1.5">Phone *</label>
                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder="(555) 000-0000"
                  className="w-full bg-stone-950 border border-stone-700 rounded px-4 py-2.5 text-white text-sm placeholder-stone-600 focus:border-orange-600 transition-colors"
                />
              </div>
              <div>
                <label className="block text-stone-400 text-sm mb-1.5">Years in Freight</label>
                <select
                  name="experience"
                  className="w-full bg-stone-950 border border-stone-700 rounded px-4 py-2.5 text-white text-sm focus:border-orange-600 transition-colors"
                >
                  <option value="">Select...</option>
                  <option>Less than 2 years</option>
                  <option>2–5 years</option>
                  <option>5–10 years</option>
                  <option>10–20 years</option>
                  <option>20+ years</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-stone-400 text-sm mb-1.5">Current / Previous Employer</label>
              <input
                name="current_employer"
                type="text"
                placeholder="Where are you coming from?"
                className="w-full bg-stone-950 border border-stone-700 rounded px-4 py-2.5 text-white text-sm placeholder-stone-600 focus:border-orange-600 transition-colors"
              />
            </div>
            <div>
              <label className="block text-stone-400 text-sm mb-1.5">Monthly Revenue (approximate)</label>
              <select
                name="monthly_revenue"
                className="w-full bg-stone-950 border border-stone-700 rounded px-4 py-2.5 text-white text-sm focus:border-orange-600 transition-colors"
              >
                <option value="">Select...</option>
                <option>Under $50K/month</option>
                <option>$50K–$150K/month</option>
                <option>$150K–$500K/month</option>
                <option>$500K+/month</option>
                <option>Building my book</option>
              </select>
            </div>
            <div>
              <label className="block text-stone-400 text-sm mb-1.5">Tell us about yourself</label>
              <textarea
                name="message"
                rows={4}
                placeholder="Your freight specialties, top lanes, why you're exploring a move..."
                className="w-full bg-stone-950 border border-stone-700 rounded px-4 py-2.5 text-white text-sm placeholder-stone-600 focus:border-orange-600 transition-colors resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold py-3.5 rounded transition-colors duration-200 flex items-center justify-center gap-2"
            >
              Submit Application
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
