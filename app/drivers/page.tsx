import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Shield,
  Truck,
  Heart,
  Clock,
  CheckCircle,
  ArrowRight,
  MapPin,
  Star,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Truck Driver Opportunities | Safety Culture | Kopf Logistics Group",
  description:
    "Kopf Logistics Group prioritizes driver safety, low turnover, and freight that keeps your trailer full. Learn why drivers choose Kopf.",
};

const driverBenefits = [
  {
    icon: Shield,
    title: "Safety-First Culture",
    description:
      "We partner exclusively with carriers who share our commitment to safety. No pressure to run unsafe hours. No tolerance for violations. Your safety record matters to us as much as it matters to you.",
  },
  {
    icon: Truck,
    title: "Freight That Fills Trailers",
    description:
      "We work hard to find freight that keeps your trailer running — not deadheading. Our logistics team prioritizes efficient routing so your wheels stay turning and your revenue stays strong.",
  },
  {
    icon: Heart,
    title: "Low Turnover Network",
    description:
      "We maintain long-term relationships with our carrier partners specifically because of low turnover. When drivers stick around, shippers get consistency. That matters for everyone.",
  },
  {
    icon: Clock,
    title: "24/7 Dispatch Access",
    description:
      "Emergencies don't follow business hours. Our dispatch team is available around the clock — whether you need a reload, have a breakdown, or just need someone to answer the phone at 3 AM.",
  },
  {
    icon: Users,
    title: "Respectful Communication",
    description:
      "We know that how you treat drivers reflects who you are as a company. Our team is trained to communicate respectfully, respond quickly, and treat every driver as the professional they are.",
  },
  {
    icon: MapPin,
    title: "Nationwide Coverage",
    description:
      "From our terminals in Indiana, Georgia, and Delaware, we have freight running in every corridor. Midwest to Southeast, East Coast to Plains — we have lanes you can build a schedule around.",
  },
];

const safetyCommitments = [
  "ELD-compliant partner carriers only",
  "HOS monitoring and compliance support",
  "No pressure to run fatigued or unsafe",
  "Hazmat routing and regulatory guidance",
  "Incident response support available 24/7",
  "Transparent communication on all loads",
];

const testimonials = [
  {
    quote:
      "After 18 years on the road, I've worked with a lot of brokers. Kopf is one of the few who actually respect your time. The freight is real, the rate is what they say it is, and they don't disappear after you pick up.",
    author: "Owner-Operator",
    experience: "18 years driving",
    rating: 5,
  },
  {
    quote:
      "Our turnover is low and that's because we only run for brokers who operate with integrity. Kopf made that list early on. Solid freight, honest pay, and they actually answer the phone.",
    author: "Fleet Safety Manager",
    experience: "Regional dry van carrier",
    rating: 5,
  },
];

export default function DriversPage() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.pexels.com/photos/2449452/pexels-photo-2449452.jpeg?auto=compress&cs=tinysrgb&w=1920&h=800&fit=crop"
            alt="Professional truck driver on the road"
            fill
            priority
            className="object-cover object-center opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/80 via-stone-950/85 to-stone-950" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-orange-600/20 border border-orange-600/40 rounded-full px-4 py-1.5 mb-6">
              <span className="text-orange-400 text-sm font-medium">For Drivers</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Drive for people
              <br />
              <span className="gradient-text">who respect the road.</span>
            </h1>
            <p className="text-xl text-stone-300 leading-relaxed mb-8">
              Kopf Logistics Group is built on relationships with professional
              drivers and the carriers who employ them. Low turnover, safety
              culture, and freight that keeps your trailer earning.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold px-8 py-4 rounded transition-all duration-200"
              >
                Connect With Us
                <ArrowRight className="w-5 h-5" />
              </a>
              <Link
                href="/carriers"
                className="inline-flex items-center justify-center gap-2 border border-stone-700 hover:border-stone-500 text-white font-medium px-8 py-4 rounded transition-colors duration-200"
              >
                Carrier Partners
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── DRIVER BENEFITS ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-3">
            What Drivers Get
          </p>
          <h2 className="text-4xl font-bold text-white mb-4">
            Built around the driver.
          </h2>
          <p className="text-stone-400 max-w-xl mx-auto">
            We know that freight doesn&apos;t move without drivers. Everything
            we do is built to make your job easier, safer, and more profitable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {driverBenefits.map((benefit) => (
            <div
              key={benefit.title}
              className="bg-stone-900 border border-stone-800 hover:border-orange-600/40 rounded-xl p-6 bento-card"
            >
              <div className="w-10 h-10 bg-orange-600/15 rounded-lg flex items-center justify-center mb-4">
                <benefit.icon className="w-5 h-5 text-orange-500" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{benefit.title}</h3>
              <p className="text-stone-400 text-sm leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SAFETY SECTION ── */}
      <section className="py-20 bg-stone-900/50 border-y border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-3">
                Safety First
              </p>
              <h2 className="text-4xl font-bold text-white mb-6">
                We don&apos;t cut corners
                <br />
                <span className="gradient-text">on safety. Ever.</span>
              </h2>
              <p className="text-stone-400 leading-relaxed mb-6">
                Kopf&apos;s safety culture isn&apos;t a checklist — it&apos;s a
                commitment built into every load decision we make. We partner
                with carriers who have strong safety records and we refuse
                freight relationships that compromise driver well-being.
              </p>
              <p className="text-stone-400 leading-relaxed">
                Our faith-based mission drives us to care about the people
                behind the wheel as much as the freight in the trailer. That
                means realistic schedules, compliant operations, and open
                communication when conditions change.
              </p>
            </div>
            <div>
              <div className="bg-stone-900 border border-stone-800 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4">Our Safety Commitments</h3>
                <div className="flex flex-col gap-3">
                  {safetyCommitments.map((commitment) => (
                    <div key={commitment} className="flex items-center gap-3 py-2.5 border-b border-stone-800 last:border-0">
                      <CheckCircle className="w-4 h-4 text-orange-500 shrink-0" />
                      <span className="text-stone-300 text-sm">{commitment}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Drivers on Kopf.</h2>
          <p className="text-stone-400">From drivers who run our freight.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-stone-900 border border-stone-800 rounded-xl p-6">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-orange-500 text-orange-500" />
                ))}
              </div>
              <blockquote className="text-stone-300 text-sm italic leading-relaxed mb-4">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="border-t border-stone-800 pt-4">
                <p className="text-white font-medium text-sm">{t.author}</p>
                <p className="text-stone-500 text-xs">{t.experience}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CONTACT CTA ── */}
      <section id="contact" className="py-20 bg-stone-900/50 border-t border-stone-800">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to run freight with integrity?
          </h2>
          <p className="text-stone-400 mb-8">
            If you&apos;re a driver or fleet looking for a broker that respects
            your professionalism, let&apos;s talk. Reach out through your
            carrier or contact us directly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/carriers#setup"
              className="inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold px-8 py-4 rounded transition-colors duration-200"
            >
              Carrier Setup
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 border border-stone-700 hover:border-stone-500 text-white font-medium px-8 py-4 rounded transition-colors duration-200"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
