import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  Shield,
  Users,
  Star,
  ArrowRight,
  MapPin,
  CheckCircle,
  Award,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Kopf Logistics Group | Family-Owned Freight Broker Indiana",
  description:
    "50+ years of family-owned freight brokerage in Elkhart, Indiana. Learn about our history, faith-based mission, and people-first approach to logistics.",
};

const timeline = [
  {
    decade: "1970s",
    title: "Founded in Elkhart",
    description:
      "Kopf Logistics Group was founded in Elkhart, Indiana during the early years of the deregulated trucking era. Starting small with a handful of carrier relationships, the company quickly earned a reputation for straight talk and reliable freight matching.",
  },
  {
    decade: "1980s–90s",
    title: "Growth Through Relationships",
    description:
      "As the freight brokerage industry matured, Kopf grew through referrals and repeat business — the only metric that matters in this industry. The company expanded its carrier network and began building the Midwest carrier relationships that still define the business today.",
  },
  {
    decade: "2000s",
    title: "Second Generation Takes the Helm",
    description:
      "The second generation of the Kopf family took leadership, bringing fresh energy while preserving the culture of integrity that built the company. Technology investments began in earnest — dispatch software, load boards, and early TMS platforms.",
  },
  {
    decade: "2010s",
    title: "Expanding the Network",
    description:
      "Terminal expansions to Athens, Georgia and Seaford, Delaware gave Kopf meaningful footholds in the Southeast and Mid-Atlantic freight corridors. The independent freight agent program formalized with the 70/30 split that agents know today.",
  },
  {
    decade: "2020s",
    title: "Technology & People",
    description:
      "McLeod TMS implementation brought enterprise-grade visibility to shippers and agents alike. Through industry disruptions and market volatility, Kopf's people-powered approach continued to outperform transactional competitors.",
  },
];

const values = [
  {
    icon: Shield,
    title: "True to Our Word",
    description:
      "If we say we'll find capacity, we find it. If we quote a rate, we honor it. After 50 years, our reputation for integrity is our most valuable asset — and we treat it that way.",
  },
  {
    icon: Users,
    title: "Small Team, Big Results",
    description:
      "We are intentionally lean. Every member of our team has ownership mentality. There's no layer of management to absorb your request — you talk to the person who can solve your problem.",
  },
  {
    icon: Award,
    title: "Results-Oriented Culture",
    description:
      "We don't measure success in meetings, calls, or activity reports. We measure it in freight delivered, agents thriving, and carriers who return load after load.",
  },
  {
    icon: Heart,
    title: "Higher Purpose",
    description:
      "Faith shapes how we operate. We partner with area food banks and community organizations because we believe business is a platform for service, not just profit. Doing well and doing good are not mutually exclusive.",
  },
];

const locations = [
  {
    name: "Elkhart, Indiana (HQ)",
    address: "2311 Toledo Road",
    city: "Elkhart, IN 46516",
    phone: "(574) 264-0990",
    primary: true,
  },
  {
    name: "Athens, Georgia",
    address: "Terminal Location",
    city: "Athens, GA",
    phone: "(574) 264-0990",
    primary: false,
  },
  {
    name: "Seaford, Delaware",
    address: "Terminal Location",
    city: "Seaford, DE",
    phone: "(574) 264-0990",
    primary: false,
  },
];

export default function AboutPage() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.pexels.com/photos/1427541/pexels-photo-1427541.jpeg?auto=compress&cs=tinysrgb&w=1920&h=800&fit=crop"
            alt="Kopf Logistics — people powered logistics"
            fill
            priority
            className="object-cover object-center opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/80 via-stone-950/90 to-stone-950" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-orange-600/20 border border-orange-600/40 rounded-full px-4 py-1.5 mb-6">
              <span className="text-orange-400 text-sm font-medium">Our Story</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              50 years of doing
              <br />
              <span className="gradient-text">freight right.</span>
            </h1>
            <p className="text-xl text-stone-300 leading-relaxed mb-8">
              Kopf Logistics Group is a second-generation, family-owned freight
              brokerage headquartered in Elkhart, Indiana. We&apos;ve built our
              business the same way every generation: one relationship at a time.
            </p>
            <div className="flex flex-wrap gap-6">
              {[
                { value: "50+", label: "Years in Business" },
                { value: "2nd Gen", label: "Family Ownership" },
                { value: "3", label: "Terminal Locations" },
              ].map((stat) => (
                <div key={stat.label} className="bg-stone-900 border border-stone-800 rounded-lg px-5 py-3 text-center">
                  <div className="text-2xl font-bold text-orange-500">{stat.value}</div>
                  <div className="text-stone-400 text-xs mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── MISSION ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-orange-600/10 to-stone-900 border border-orange-600/20 rounded-2xl p-10 lg:p-16">
            <div className="max-w-3xl">
              <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-4">
                Our Mission
              </p>
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                &ldquo;People Powered Logistics.&rdquo;
              </h2>
              <p className="text-stone-300 text-lg leading-relaxed mb-6">
                That tagline isn&apos;t marketing. It&apos;s a commitment. We believe
                freight brokerage is fundamentally a people business — and no
                amount of technology changes that. The best lane rate means
                nothing if the person quoting it doesn&apos;t pick up the phone when
                the load breaks down at 2 AM.
              </p>
              <p className="text-stone-400 leading-relaxed">
                Our faith-based mission shapes how we treat everyone in our
                ecosystem — shippers, agents, carriers, and drivers. We partner
                with area food banks and invest in our community because we
                believe every business has a higher purpose than profit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section className="py-20 bg-stone-900/50 border-y border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-3">
              50 Years
            </p>
            <h2 className="text-4xl font-bold text-white mb-4">Our history.</h2>
            <p className="text-stone-400 max-w-xl mx-auto">
              Five decades of freight, relationships, and relentless improvement.
            </p>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-stone-800 -translate-x-1/2" />

            <div className="flex flex-col gap-12">
              {timeline.map((item, i) => (
                <div key={item.decade} className={`relative flex gap-8 ${i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"}`}>
                  <div className="flex-1 lg:max-w-[calc(50%-2rem)]">
                    <div className="bg-stone-900 border border-stone-800 rounded-xl p-6">
                      <div className="text-orange-500 font-bold text-sm mb-2">{item.decade}</div>
                      <h3 className="text-white font-semibold text-xl mb-3">{item.title}</h3>
                      <p className="text-stone-400 text-sm leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                  <div className="hidden lg:flex flex-col items-center justify-center w-16">
                    <div className="w-4 h-4 bg-orange-600 rounded-full border-2 border-stone-950" />
                  </div>
                  <div className="flex-1 hidden lg:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-3">
            Our Values
          </p>
          <h2 className="text-4xl font-bold text-white mb-4">
            What we believe.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {values.map((value) => (
            <div key={value.title} className="flex gap-5 p-6 bg-stone-900 border border-stone-800 rounded-xl hover:border-stone-700 transition-colors">
              <div className="w-10 h-10 bg-orange-600/15 rounded-lg flex items-center justify-center shrink-0">
                <value.icon className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-2">{value.title}</h3>
                <p className="text-stone-400 text-sm leading-relaxed">{value.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── LOCATIONS ── */}
      <section className="py-20 bg-stone-900/50 border-y border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-3">
              Our Locations
            </p>
            <h2 className="text-4xl font-bold text-white mb-4">
              Three terminals. Nationwide reach.
            </h2>
            <p className="text-stone-400 max-w-xl mx-auto">
              Headquartered in Elkhart with strategic terminals in Georgia and Delaware
              to serve the Midwest, Southeast, and Mid-Atlantic freight corridors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {locations.map((loc) => (
              <div
                key={loc.name}
                className={`p-6 rounded-xl border ${loc.primary ? "bg-orange-600/10 border-orange-600/30" : "bg-stone-900 border-stone-800"}`}
              >
                {loc.primary && (
                  <span className="text-xs text-orange-400 font-medium bg-orange-600/10 border border-orange-600/20 rounded-full px-3 py-1 mb-4 inline-block">
                    Headquarters
                  </span>
                )}
                <div className="flex items-start gap-3 mb-4">
                  <MapPin className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-white font-semibold">{loc.name}</h3>
                    <p className="text-stone-400 text-sm mt-1">{loc.address}</p>
                    <p className="text-stone-400 text-sm">{loc.city}</p>
                  </div>
                </div>
                <a
                  href={`tel:${loc.phone.replace(/\D/g, "")}`}
                  className="text-orange-500 hover:text-orange-400 text-sm font-medium transition-colors"
                >
                  {loc.phone}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to work with a freight partner that actually gives a damn?
          </h2>
          <p className="text-stone-400 mb-8">
            Whether you&apos;re shipping freight, building a book, or hauling loads —
            Kopf is the logistics partner built for the long term.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold px-8 py-4 rounded transition-colors duration-200"
            >
              Contact Us
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/freight-agents"
              className="inline-flex items-center justify-center gap-2 border border-stone-700 hover:border-stone-500 text-white font-medium px-8 py-4 rounded transition-colors duration-200"
            >
              Agent Opportunities
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
