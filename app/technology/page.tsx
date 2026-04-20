import type { Metadata } from "next";
import Link from "next/link";
import {
  Monitor,
  Shield,
  Zap,
  Cloud,
  BarChart3,
  Lock,
  CheckCircle,
  ArrowRight,
  Truck,
  RefreshCw,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Logistics Technology | McLeod TMS | Kopf Logistics Group",
  description:
    "Kopf Logistics Group uses McLeod TMS, cloud-based disaster recovery, and real-time tracking to deliver enterprise logistics technology for shippers, agents, and carriers.",
};

const techFeatures = [
  {
    icon: Monitor,
    title: "McLeod Transportation Management",
    description:
      "Our operations run on McLeod Software — the gold standard TMS in the freight brokerage industry. Every load, every carrier, every document is tracked in a single enterprise platform used by some of the largest logistics companies in North America.",
    details: ["Load management & dispatch", "Rate confirmation generation", "Carrier compliance tracking", "Document management (BOL, POD)", "Integrated accounting & billing"],
  },
  {
    icon: Cloud,
    title: "Cloud-Based Infrastructure",
    description:
      "Kopf operates on a fully cloud-hosted infrastructure with automated disaster recovery. Your freight data and operational continuity are protected even if a natural disaster or hardware failure affects our physical locations.",
    details: ["99.9% uptime SLA", "Automated daily backups", "Geographic redundancy", "Encrypted data at rest & in transit", "Rapid disaster recovery protocols"],
  },
  {
    icon: BarChart3,
    title: "Real-Time Visibility & Reporting",
    description:
      "Shippers get real-time load tracking and customizable reporting dashboards. Know where your freight is, when it picked up, and when it delivered — without making a phone call.",
    details: ["Real-time GPS tracking integration", "Automated status updates", "On-time performance reporting", "Lane analytics & spend analysis", "Custom shipper dashboards"],
  },
  {
    icon: Shield,
    title: "Carrier Compliance Technology",
    description:
      "Every carrier in our network is vetted and monitored through automated compliance tools. MC authority, insurance certificates, safety ratings, and CSA scores are checked at setup and monitored continuously.",
    details: ["FMCSA authority monitoring", "Insurance certificate tracking", "Safety score alerts", "CSA violation monitoring", "Carrier performance scoring"],
  },
  {
    icon: Zap,
    title: "Digital Load Matching",
    description:
      "Our agents use integrated load boards, lane analytics, and carrier preference data to match the right truck to your freight — faster and more efficiently than manual processes.",
    details: ["Multi-board load posting", "Carrier preference matching", "Rate benchmarking tools", "Automated carrier outreach", "Digital rate confirmation"],
  },
  {
    icon: Lock,
    title: "Data Security & Privacy",
    description:
      "Your shipping data — lanes, volumes, suppliers, and customers — is sensitive business intelligence. Kopf employs enterprise-grade security protocols to keep your data protected.",
    details: ["Role-based access controls", "Multi-factor authentication", "Data encryption (AES-256)", "Audit logging", "Regular security assessments"],
  },
];

const integrations = [
  "McLeod Software TMS",
  "EDI 204/214/990 capable",
  "Digital freight platforms",
  "API load board integrations",
  "Carrier tracking integrations",
  "Automated invoicing & billing",
];

export default function TechnologyPage() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-stone-950 to-stone-950" />
        <div className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: "linear-gradient(rgba(234, 88, 12, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(234, 88, 12, 0.4) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-10 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle at 70% 40%, #EA580C, transparent 50%)",
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-orange-600/20 border border-orange-600/40 rounded-full px-4 py-1.5 mb-6">
              <span className="text-orange-400 text-sm font-medium">Technology & Innovation</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Enterprise tech.
              <br />
              <span className="gradient-text">Human execution.</span>
            </h1>
            <p className="text-xl text-stone-300 leading-relaxed mb-8">
              Kopf Logistics Group combines the best-in-class McLeod TMS with
              cloud infrastructure and real-time visibility tools — so your
              freight moves with the precision of a large carrier and the
              responsiveness of a family business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/shippers#quote"
                className="inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold px-8 py-4 rounded transition-all duration-200"
              >
                Get a Quote
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 border border-stone-700 hover:border-stone-500 text-white font-medium px-8 py-4 rounded transition-colors duration-200"
              >
                Schedule a Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TECH FEATURES ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-3">
            Our Tech Stack
          </p>
          <h2 className="text-4xl font-bold text-white mb-4">
            Built for modern freight.
          </h2>
          <p className="text-stone-400 max-w-xl mx-auto">
            Every tool in our stack is selected to give shippers more visibility,
            agents more efficiency, and carriers faster communication.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {techFeatures.map((feature) => (
            <div
              key={feature.title}
              className="bg-stone-900 border border-stone-800 hover:border-orange-600/40 rounded-xl p-6 bento-card"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-orange-600/15 rounded-lg flex items-center justify-center shrink-0">
                  <feature.icon className="w-5 h-5 text-orange-500" />
                </div>
                <h3 className="text-white font-semibold text-lg leading-tight">{feature.title}</h3>
              </div>
              <p className="text-stone-400 text-sm leading-relaxed mb-4">
                {feature.description}
              </p>
              <ul className="flex flex-col gap-1.5">
                {feature.details.map((d) => (
                  <li key={d} className="flex items-center gap-2 text-xs text-stone-500">
                    <CheckCircle className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── MCLEOD SPOTLIGHT ── */}
      <section className="py-20 bg-stone-900/50 border-y border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-3">
                Powered By
              </p>
              <h2 className="text-4xl font-bold text-white mb-6">
                McLeod Software TMS —
                <br />
                <span className="gradient-text">the industry standard.</span>
              </h2>
              <p className="text-stone-400 leading-relaxed mb-4">
                McLeod Software&apos;s Transportation Management System is used by
                the largest and most sophisticated freight brokerages in the
                country. When Kopf invested in McLeod, we made a commitment to
                deliver the operational precision our shippers and agents deserve.
              </p>
              <p className="text-stone-400 leading-relaxed mb-8">
                From load creation to final invoice, every transaction flows
                through McLeod — giving you an unbroken chain of visibility,
                accountability, and documentation.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-400 font-medium transition-colors"
              >
                Ask us about our tech stack <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div>
              <div className="bg-stone-900 border border-orange-600/20 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-orange-500" />
                  Platform Integrations
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {integrations.map((integration) => (
                    <div key={integration} className="flex items-center gap-3 py-2.5 border-b border-stone-800 last:border-0">
                      <CheckCircle className="w-4 h-4 text-orange-500 shrink-0" />
                      <span className="text-stone-300 text-sm">{integration}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DISASTER RECOVERY ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-stone-900 to-stone-900 border border-stone-800 rounded-2xl p-10">
            <div className="flex items-start gap-5 mb-6">
              <div className="w-12 h-12 bg-orange-600/15 rounded-xl flex items-center justify-center shrink-0">
                <Cloud className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Cloud-Based Disaster Recovery
                </h2>
                <p className="text-stone-400">
                  Your freight doesn&apos;t stop for hardware failures, storms, or power outages.
                </p>
              </div>
            </div>
            <p className="text-stone-300 leading-relaxed mb-6">
              Kopf&apos;s operations are fully hosted in the cloud with automated
              failover and disaster recovery protocols. If something disrupts our
              physical office locations, our team can be fully operational from
              anywhere in the country within minutes — keeping your freight moving
              and your supply chain intact.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                { icon: Shield, title: "99.9% Uptime", desc: "Enterprise SLA target" },
                { icon: RefreshCw, title: "Rapid Recovery", desc: "Minutes, not hours" },
                { icon: Lock, title: "Encrypted Data", desc: "AES-256 at rest & transit" },
              ].map((item) => (
                <div key={item.title} className="bg-stone-800/50 rounded-lg p-4 text-center">
                  <item.icon className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                  <div className="text-white font-semibold text-sm">{item.title}</div>
                  <div className="text-stone-500 text-xs mt-0.5">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-stone-900/50 border-t border-stone-800">
        <div className="max-w-3xl mx-auto text-center">
          <Truck className="w-10 h-10 text-orange-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-4">
            Technology that works as hard as your freight.
          </h2>
          <p className="text-stone-400 mb-8">
            Ready to experience enterprise-grade logistics with a team that actually
            answers the phone? Let&apos;s talk.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shippers#quote"
              className="inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold px-8 py-4 rounded transition-colors duration-200"
            >
              Get a Freight Quote
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 border border-stone-700 hover:border-stone-500 text-white font-medium px-8 py-4 rounded transition-colors duration-200"
            >
              Contact Our Team
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
