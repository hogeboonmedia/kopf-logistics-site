import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Truck,
  Thermometer,
  Package,
  ArrowRight,
  Star,
  Shield,
  Users,
  Clock,
  Award,
  MapPin,
  CheckCircle,
  ChevronRight,
  TrendingUp,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Kopf Logistics Group | Freight Broker Elkhart Indiana",
  description:
    "People Powered Logistics. 50+ years of freight brokerage in Elkhart, Indiana. Truckload, temperature-controlled, open-deck & LTL shipping nationwide.",
};

const services = [
  {
    icon: Truck,
    title: "Truckload (FTL)",
    description:
      "Full truckload capacity across 48 states. Dedicated lanes, spot freight, and contract rates tailored to your shipping volume.",
    href: "/shippers",
    span: "col-span-1",
  },
  {
    icon: Thermometer,
    title: "Temperature-Controlled",
    description:
      "Refrigerated and frozen freight handled with precision. Food-grade equipment and compliant cold chain management.",
    href: "/shippers",
    span: "col-span-1",
  },
  {
    icon: Package,
    title: "Open-Deck & Flatbed",
    description:
      "Oversized, heavy haul, and specialized loads. Step deck, RGN, and lowboy solutions for your most complex freight.",
    href: "/shippers",
    span: "col-span-1",
  },
  {
    icon: Zap,
    title: "LTL & Bulk Transport",
    description:
      "Less-than-truckload consolidation and bulk commodity hauling. Optimized routing for cost-efficient delivery.",
    href: "/shippers",
    span: "col-span-1",
  },
  {
    icon: Shield,
    title: "Power Only & Drop-Trailer",
    description:
      "Seamless power-only solutions for your drop trailer program. Flexible interchanges that maximize your trailer utilization.",
    href: "/shippers",
    span: "col-span-1 md:col-span-2",
  },
];

const stats = [
  { value: "50+", label: "Years in Business", sub: "Founded in the 1970s" },
  { value: "300+", label: "Years Combined Experience", sub: "Our agent team" },
  { value: "70/30", label: "Agent Commission Split", sub: "Best in the industry" },
  { value: "3", label: "Terminal Locations", sub: "IN, GA & DE" },
];

const audiences = [
  {
    title: "Shippers",
    description:
      "Manufacturers and distributors trust Kopf to move their freight on time, every time. Custom solutions across every mode.",
    href: "/shippers",
    cta: "Get a Quote",
    color: "from-orange-600/20 to-orange-900/10",
    icon: Package,
  },
  {
    title: "Freight Agents",
    description:
      "Build your book at 70/30 with back-office support, weekly settlements, and a team with 300+ years of combined experience.",
    href: "/freight-agents",
    cta: "Join Our Team",
    color: "from-amber-600/20 to-amber-900/10",
    icon: TrendingUp,
  },
  {
    title: "Carriers",
    description:
      "Fast ACH payments — up to 40% of line haul after 3 loads. Real freight, real relationships, no games.",
    href: "/carriers",
    cta: "Partner With Us",
    color: "from-stone-600/20 to-stone-900/10",
    icon: Truck,
  },
  {
    title: "Drivers",
    description:
      "Low turnover, strong safety culture, and freight that keeps your trailers full. Kopf puts drivers first.",
    href: "/drivers",
    cta: "Learn More",
    color: "from-orange-700/20 to-stone-900/10",
    icon: Shield,
  },
];

const testimonials = [
  {
    quote:
      "Kopf has been our go-to broker for six years. Their team answers the phone at 2 AM and they always deliver. That's rare in this industry.",
    author: "Regional Operations Director",
    company: "Mid-size Automotive Supplier, Michigan",
    rating: 5,
  },
  {
    quote:
      "I moved my book to Kopf three years ago. The 70/30 split, quick settlements, and real back-office support — I wish I'd made the move sooner.",
    author: "Independent Freight Agent",
    company: "20+ years in the industry",
    rating: 5,
  },
  {
    quote:
      "Quick pay, consistent loads, and a team that actually communicates. Kopf is one of the few brokers we want to keep hauling for.",
    author: "Owner-Operator",
    company: "Flatbed & Specialized Carrier",
    rating: 5,
  },
];

const values = [
  {
    icon: CheckCircle,
    title: "True to Our Word",
    description:
      "Every commitment we make — to shippers, agents, and carriers — is backed by 50 years of trust. No hidden fees, no excuses.",
  },
  {
    icon: Users,
    title: "Small Team, Big Results",
    description:
      "Our lean, experienced team moves millions of pounds of freight annually. We outperform larger brokers because every person owns the outcome.",
  },
  {
    icon: Award,
    title: "Results-Oriented Culture",
    description:
      "We don't measure success in activity — we measure it in freight moved, agents thriving, and carriers who keep coming back.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.pexels.com/photos/2199293/pexels-photo-2199293.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop"
            alt="Semi truck on open highway at sunset"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="hero-overlay absolute inset-0" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-orange-600/20 border border-orange-600/40 rounded-full px-4 py-1.5 mb-6">
              <div className="w-2 h-2 bg-orange-500 rounded-full pulse-orange" />
              <span className="text-orange-400 text-sm font-medium tracking-wide">
                50+ Years of Freight Expertise
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              People Powered
              <br />
              <span className="gradient-text">Logistics.</span>
            </h1>

            <p className="text-xl text-stone-300 leading-relaxed mb-10 max-w-2xl">
              Kopf Logistics Group connects shippers to capacity, independent
              agents to opportunity, and carriers to consistent freight —
              backed by five decades of Midwest integrity.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/shippers#quote"
                className="inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold px-8 py-4 rounded text-base transition-all duration-200 hover:shadow-lg hover:shadow-orange-600/30"
              >
                Ship With Us
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/freight-agents"
                className="inline-flex items-center justify-center gap-2 border border-white/20 hover:border-white/40 text-white hover:bg-white/5 font-semibold px-8 py-4 rounded text-base transition-all duration-200"
              >
                Become an Agent
              </Link>
            </div>

            <div className="mt-16 flex flex-wrap gap-8">
              {[
                { icon: MapPin, text: "Elkhart, IN · Athens, GA · Seaford, DE" },
                { icon: Clock, text: "24/7 Dispatch Support" },
                { icon: Shield, text: "Licensed, Bonded & Insured" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2 text-stone-400">
                  <item.icon className="w-4 h-4 text-orange-500 shrink-0" />
                  <span className="text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-1">
            <div className="w-1.5 h-3 bg-orange-500 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="bg-stone-900 border-y border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.value} className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-orange-500 mb-1">
                  {stat.value}
                </div>
                <div className="text-white font-semibold text-sm mb-0.5">{stat.label}</div>
                <div className="text-stone-500 text-xs">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES BENTO GRID ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-3">
            Transportation Services
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Every mode. Every lane.
          </h2>
          <p className="text-stone-400 text-lg max-w-2xl mx-auto">
            From temperature-controlled reefers to heavy haul flatbeds, Kopf
            sources the right capacity for your most demanding freight.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {services.map((service) => (
            <Link
              key={service.title}
              href={service.href}
              className={`${service.span} group bg-stone-900 border border-stone-800 hover:border-orange-600/50 rounded-xl p-6 bento-card`}
            >
              <div className="w-10 h-10 bg-orange-600/15 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-600/25 transition-colors">
                <service.icon className="w-5 h-5 text-orange-500" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{service.title}</h3>
              <p className="text-stone-400 text-sm leading-relaxed mb-4">
                {service.description}
              </p>
              <div className="flex items-center gap-1 text-orange-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Learn more <ChevronRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/shippers"
            className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-400 font-medium transition-colors"
          >
            View all shipping services <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── WHO WE SERVE ── */}
      <section className="py-24 bg-stone-900/50 border-y border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-3">
              Who We Serve
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Built for everyone in freight.
            </h2>
            <p className="text-stone-400 text-lg max-w-xl mx-auto">
              Whether you're shipping product, building a book, or hauling loads
              — Kopf has a program built for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {audiences.map((audience) => (
              <div
                key={audience.title}
                className={`bg-gradient-to-br ${audience.color} border border-stone-800 rounded-xl p-8 hover:border-stone-700 transition-all duration-300 group`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-600/20 rounded-xl flex items-center justify-center">
                    <audience.icon className="w-6 h-6 text-orange-500" />
                  </div>
                  <Link
                    href={audience.href}
                    className="text-orange-500 hover:text-orange-400 text-sm font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {audience.cta} <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <h3 className="text-white text-2xl font-bold mb-3">{audience.title}</h3>
                <p className="text-stone-400 text-sm leading-relaxed mb-6">
                  {audience.description}
                </p>
                <Link
                  href={audience.href}
                  className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold px-5 py-2.5 rounded transition-colors duration-200"
                >
                  {audience.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OUR VALUES ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-3">
              Why Kopf
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              50 years built on
              <br />
              <span className="gradient-text">doing it right.</span>
            </h2>
            <p className="text-stone-400 text-lg leading-relaxed mb-8">
              We are a second-generation, family-owned freight brokerage. That
              means every relationship matters. Every load counts. We don't hide
              behind an algorithm — you talk to a person who knows your lane,
              your freight, and your standards.
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-400 font-medium transition-colors"
            >
              Our story <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex flex-col gap-5">
            {values.map((value) => (
              <div
                key={value.title}
                className="flex gap-4 p-5 bg-stone-900 border border-stone-800 rounded-xl hover:border-stone-700 transition-colors"
              >
                <div className="w-10 h-10 bg-orange-600/15 rounded-lg flex items-center justify-center shrink-0">
                  <value.icon className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1.5">{value.title}</h3>
                  <p className="text-stone-400 text-sm leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 bg-stone-900/50 border-y border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-3">
              What They Say
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Real people. Real freight.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className="bg-stone-900 border border-stone-800 rounded-xl p-6 flex flex-col gap-4"
              >
                <div className="flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-orange-500 text-orange-500" />
                  ))}
                </div>
                <blockquote className="text-stone-300 text-sm leading-relaxed italic flex-1">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <div className="border-t border-stone-800 pt-4">
                  <p className="text-white font-medium text-sm">{testimonial.author}</p>
                  <p className="text-stone-500 text-xs mt-0.5">{testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA STRIP ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-2xl p-10 sm:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-white rounded-full" />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white rounded-full" />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                Ready to move freight?
              </h2>
              <p className="text-orange-100 text-lg mb-8 max-w-xl mx-auto">
                Get a competitive quote in minutes or speak with a logistics specialist
                who knows your lane.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 bg-white text-orange-700 hover:bg-orange-50 font-semibold px-8 py-4 rounded transition-colors duration-200"
                >
                  Request a Quote
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="tel:5742640990"
                  className="inline-flex items-center justify-center gap-2 border border-white/40 hover:bg-white/10 text-white font-semibold px-8 py-4 rounded transition-colors duration-200"
                >
                  Call (574) 264-0990
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
