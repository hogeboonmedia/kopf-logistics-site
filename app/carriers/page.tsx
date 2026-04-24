import type { Metadata } from "next";
import Image from "next/image";
import Button from "@/components/ui/Button";
import SectionHeader from "@/components/ui/SectionHeader";
import PhoneEmailBlock from "@/components/ui/PhoneEmailBlock";
import { Quote, Shield, Truck, Clock, Route, FileCheck, Award, CircuitBoard } from "lucide-react";

export const metadata: Metadata = {
  title: "Carriers",
  description:
    "Become a Kopf Logistics Group contract carrier and enjoy a seamless, automated onboarding process for efficient and reliable service.",
  alternates: { canonical: "/carriers" },
};

const advantages = [
  { label: "A Second Generation Truck Brokerage", Icon: Award },
  { label: "Sound Financial Strength", Icon: Shield },
  { label: "Freight to Fill Your Trailers", Icon: Truck },
  { label: "Tri-haul Routing to Reduce Deadhead Miles", Icon: Route },
  { label: "Brokerage Insurance that Meets or Exceeds Industry Requirements", Icon: FileCheck },
  { label: "$100K Property Surety Bond", Icon: Shield },
  { label: "Internet Truckstop Diamond Broker", Icon: Award },
  { label: "EDI", Icon: CircuitBoard },
];

const driverTypes = [
  { label: "Over the Road", icon: "drivers_road.png" },
  { label: "Regional", icon: "drivers_regional.png" },
  { label: "Part-Time", icon: "drivers_part-time.png" },
  { label: "Casual", icon: "drivers_casual.png" },
];

const safetyRatings = [
  {
    rating: "Satisfactory",
    body: "Per US DOT safety rating, carrier has in place adequate safety management controls that function effectively to make certain acceptable compliance with applicable safety requirements are met to reduce safety risks and may be approved to haul.",
    tone: "positive",
  },
  {
    rating: "Conditional",
    body: "Per US DOT safety rating, \"Conditional\" rated carrier may be subject to additional qualification processing and in some circumstances may be approved to haul.",
    tone: "caution",
  },
  {
    rating: "Unsatisfactory",
    body: "Per US DOT safety rating, carrier SHALL NOT be approved if it has an \"Unsatisfactory\" DOT safety rating.",
    tone: "negative",
  },
  {
    rating: "Unrated",
    body: "Per US DOT, a carrier who has not been rated by the US DOT may qualify to haul freight, but will be subject to additional carrier qualification procedures prior to approval.",
    tone: "caution",
  },
] as const;

const insuranceRequirements = [
  "Carrier must maintain and provide proof of insurance coverage with required coverage limits and A.M. Best's Financial Strength Rating of \"Good\" or better.",
  "Minimum of $1 Million Auto Liability Policy with Current Effective Dates.",
  "Minimum of $100,000 Motor Cargo Policy with Current Effective Dates.",
  "Must List Reefer Breakdown Coverage and/or Exclusions for any Refrigerated Loads.",
  "Must List Workers Compensation Policy with Limits According to State Requirements.",
];

const settlements = [
  {
    title: "Advances",
    body: "A carrier may request a load advance up to 40% of the line haul, with a maximum of $2,500 issued per load. There is a $20 fee for fuel advances and a $5 fee for accessorial advances.",
  },
  {
    title: "Standard Terms",
    body: "24-day Standard Pay/ACH or Check by Mail, No Fees.",
  },
  {
    title: "ACH Payments",
    body: "We are pleased to offer the ACH Payment option for freight settlements via direct deposit to your bank checking or savings account. Participation in the ACH Payments Program is dependent on the carrier remitting all required paperwork for payment. There are no ACH participation fees.",
  },
];

export default function CarriersPage() {
  return (
    <>
      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative overflow-hidden isolate">
        <Image
          src="/pexels/truck_fleet.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center -z-20 opacity-55"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-br from-[var(--color-kopf-ink)] via-[var(--color-kopf-ink)]/95 to-[var(--color-kopf-ink-2)]" />

        <div className="relative px-6 lg:px-10 pt-20 pb-24 md:pt-28 md:pb-32 max-w-6xl">
          <div className="flex items-center gap-3 mb-6 kopf-fade-up">
            <span className="kopf-chapter">§ Carriers</span>
            <span className="h-px w-10 bg-[var(--color-kopf-orange)]" />
            <span className="kopf-eyebrow">Contract Carrier Onboarding</span>
          </div>

          <h1 className="font-[var(--font-anton)] uppercase leading-[0.9] tracking-tight text-[var(--color-kopf-bone)] text-[10vw] sm:text-6xl md:text-7xl lg:text-[6.5rem] max-w-5xl kopf-fade-up kopf-fade-up-delay-1">
            How to Become a{" "}
            <span className="text-[var(--color-kopf-orange)]">Contract Carrier</span>
          </h1>

          <p className="mt-8 max-w-3xl text-base md:text-lg leading-relaxed text-[var(--color-kopf-bone-muted)] kopf-fade-up kopf-fade-up-delay-2">
            Are you looking to become a contract carrier with Kopf? Our experienced team
            at Kopf Logistics Group is here to help you succeed. We provide a seamless
            automated carrier onboarding process to help you comply with necessary
            regulations and ensure you get started quickly. Our goal is to make the
            automated carrier onboarding process simple and intuitive for all Drivers. We
            believe our flexible rates and fees can be tailored to meet the individual
            needs of our carrier partners.
          </p>

          <div className="mt-10 flex flex-wrap items-start gap-8 kopf-fade-up kopf-fade-up-delay-3">
            <div>
              <span className="block kopf-eyebrow mb-3">Get Started Today!</span>
              <PhoneEmailBlock />
            </div>
            <div className="flex gap-3 pt-5">
              <Button
                href="https://intelliapp.driverapponline.com/c/kopflogisticsgroup"
                external
                variant="solid"
              >
                Join Our Carrier Network
              </Button>
              <Button href="https://mycarrierpackets.com/" external>
                MyCarrierPackets.com
              </Button>
            </div>
          </div>
        </div>
        <div className="tread-divider" aria-hidden="true" />
      </section>

      {/* ═══════════════ §01 CARRIERS ARE OUR BACKBONE ═══════════════ */}
      <section className="relative px-6 lg:px-10 py-24 md:py-28">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <SectionHeader
              chapter="01"
              eyebrow="Family-Owned · 48 States"
              title={
                <>
                  Carriers Are<br />
                  <span className="text-[var(--color-kopf-orange)]">Our Backbone</span>
                </>
              }
            />
          </div>
          <div className="lg:col-span-7 space-y-6 text-[var(--color-kopf-bone-muted)] text-base md:text-lg leading-relaxed">
            <p>
              We are a family-owned and operated business serving the transportation
              industry through our broker division as a transportation property broker.
              We service reefers, vans and flatbeds throughout the contiguous 48 states.
              We have immediate freight hauling opportunities and view our contract
              carrier network as the backbone of our company.
            </p>
            <p>
              Our carrier partners find joining Kopf Logistics Group is quick, simple, and
              intuitive. With automated carrier onboarding, the carrier approval process
              starts right away. The entire setup process was designed to suit the needs
              of Drivers. With new online workflow tools and digital logging systems that
              simplify operations, joining our network will undoubtedly set new carriers
              up for success. Contact us today to learn more about how we can help you
              grow your business.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════ §02 YOU CAN RELY ON US ═══════════════ */}
      <section className="relative bg-[var(--color-kopf-ink-2)] border-y border-white/[0.05] px-6 lg:px-10 py-24 md:py-32">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6 text-[var(--color-kopf-bone-muted)] text-base md:text-lg leading-relaxed">
            <SectionHeader
              chapter="02"
              eyebrow="Built for Cash Flow"
              title="You Can Rely On Us"
            />
            <p>
              At Kopf Logistics Group, we excel at matching our contract carrier's
              equipment to available freight and take on the tedious work required to
              keep your trucks moving. We're committed to building strong relationships
              with our carrier partners and offer a range of payment options, including
              standard pay/ACH, and ACH payments. After successfully hauling and
              delivering three loads, we also provide up to 40% of the line haul, with a
              maximum of $2,500 per load.
            </p>
          </div>
          <div className="lg:col-span-5 grid gap-4">
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src="/pexels/driver_cab.jpg"
                alt="Truck driver relying on Kopf's carrier network"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[5/2] grid place-items-center p-6 text-center overflow-hidden" style={{ background: "var(--accent)" }}>
              <span aria-hidden="true" className="kopf-grain" />
              <div className="relative" style={{ color: "var(--on-accent)" }}>
                <span className="block font-[var(--font-jetbrains)] text-[10px] uppercase tracking-[0.22em] mb-1 opacity-80">
                  After 3 Loads · Max $2,500
                </span>
                <span className="block font-[var(--font-anton)] text-6xl leading-none">40%</span>
                <span className="block mt-1 font-[var(--font-anton)] text-sm uppercase tracking-tight">Line-Haul Advance</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ §03 ADVANTAGES GRID ═══════════════ */}
      <section className="relative px-6 lg:px-10 py-24 md:py-32">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            chapter="03"
            eyebrow="8 Pillars of Carrier Support"
            title={
              <>
                A Second Generation<br />
                <span className="text-[var(--color-kopf-orange)]">Truck Brokerage</span>
              </>
            }
            kicker="Our second-generation truck brokerage is built on a foundation of sound financial strength, which enables us to offer:"
          />
          <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {advantages.map(({ label, Icon }, i) => (
              <li
                key={label}
                className="group relative border border-white/[0.08] bg-[var(--color-kopf-ink-2)] p-6 hover:border-[var(--color-kopf-orange)] transition flex flex-col"
              >
                <span className="font-[var(--font-jetbrains)] text-xs tabular-nums text-[var(--color-kopf-concrete)] group-hover:text-[var(--color-kopf-orange)] transition">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Icon className="w-8 h-8 mt-4 text-[var(--color-kopf-orange)]" strokeWidth={1.3} />
                <p className="mt-4 text-[var(--color-kopf-bone)] leading-snug font-[var(--font-anton)] uppercase tracking-tight">
                  {label}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ═══════════════ TESTIMONIAL ═══════════════ */}
      <section className="relative bg-[var(--color-kopf-ink-2)] border-y border-white/[0.05] px-6 lg:px-10 py-24 md:py-28">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <span className="kopf-chapter">§ 04</span>
            <span className="h-px w-10 bg-[var(--color-kopf-orange)]" />
            <span className="kopf-eyebrow">What They Say</span>
          </div>

          <Quote className="w-14 h-14 text-[var(--color-kopf-orange)] mb-4" strokeWidth={1.2} />
          <blockquote className="font-[var(--font-anton)] uppercase text-3xl md:text-5xl leading-[1.05] tracking-tight text-[var(--color-kopf-bone)] max-w-4xl">
            "Kopf is a trusted name. They're a well-established company with a courteous,
            professional and knowledgeable staff. We really appreciate their genuine
            attitude and effort."
          </blockquote>
          <footer className="mt-8 flex items-center gap-4 pt-5 border-t border-white/[0.08] max-w-md">
            <span className="block w-12 h-12 bg-[var(--color-kopf-orange)] grid place-items-center font-[var(--font-anton)] uppercase text-2xl text-[var(--color-kopf-ink)]">K</span>
            <span>
              <span className="block font-[var(--font-anton)] uppercase text-xl">Kyle</span>
              <span className="block font-[var(--font-jetbrains)] text-xs uppercase tracking-[0.22em] text-[var(--color-kopf-concrete)]">
                Contract Carrier
              </span>
            </span>
          </footer>
        </div>
      </section>

      {/* ═══════════════ §05 CARRIER REQUIREMENTS ═══════════════ */}
      <section className="relative px-6 lg:px-10 py-24 md:py-32">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            chapter="05"
            eyebrow="Qualification Standards"
            title="Carrier Requirements"
            kicker="To help us qualify your company as an approved contract carrier, please review the following requirements:"
          />

          {/* Operating Authority */}
          <div className="mt-14 border-t border-white/[0.08] pt-10">
            <h3 className="kopf-eyebrow mb-3">§ Operating Authority</h3>
            <p className="text-[var(--color-kopf-bone-muted)] text-base md:text-lg leading-relaxed max-w-4xl">
              Carrier must be licensed by the FMCSA and have active common, contract, or
              both authorities for a minimum of six months. If the carrier's authority
              has been revoked and reinstated more than 30 days apart, the carrier must
              wait six months for requalification. If the carrier's authority has been
              revoked and reinstated less than 30 days apart, it may be reviewed for
              requalification at the time of request.
            </p>
          </div>

          {/* Safety Rating */}
          <div className="mt-14 border-t border-white/[0.08] pt-10">
            <h3 className="kopf-eyebrow mb-6">§ Safety Rating</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {safetyRatings.map((r) => {
                const color =
                  r.tone === "positive"
                    ? "border-[var(--color-kopf-orange)]"
                    : r.tone === "negative"
                      ? "border-red-700"
                      : "border-white/20";
                return (
                  <div key={r.rating} className={`border-l-4 ${color} pl-5 py-3`}>
                    <div className="font-[var(--font-anton)] uppercase text-2xl leading-tight text-[var(--color-kopf-bone)]">
                      {r.rating}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--color-kopf-bone-muted)]">
                      {r.body}
                    </p>
                  </div>
                );
              })}
            </div>
            <p className="mt-6 text-[var(--color-kopf-bone-muted)] text-sm leading-relaxed max-w-4xl italic">
              Carrier is required to notify Kopf by phone and email immediately if its
              safety rating is changed to "Unsatisfactory" or "Conditional" and stop any
              transportation of freight in progress until notice by Kopf.
            </p>
          </div>

          {/* Insurance */}
          <div className="mt-14 border-t border-white/[0.08] pt-10">
            <h3 className="kopf-eyebrow mb-6">§ Insurance</h3>
            <ul className="space-y-4 max-w-4xl">
              {insuranceRequirements.map((r, i) => (
                <li key={r} className="flex gap-4 border-t border-white/[0.06] pt-3 first:border-t-0 first:pt-0">
                  <span className="font-[var(--font-jetbrains)] text-xs tabular-nums text-[var(--color-kopf-orange)] min-w-[24px]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[var(--color-kopf-bone-muted)] text-base leading-relaxed">{r}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Broker-Carrier Agreement */}
          <div className="mt-14 border-t border-white/[0.08] pt-10">
            <h3 className="kopf-eyebrow mb-3">§ Broker-Carrier Agreement</h3>
            <p className="text-[var(--color-kopf-bone-muted)] text-base md:text-lg leading-relaxed max-w-4xl">
              Contract carrier must agree to Kopf's Broker-Motor Carrier Agreement by
              signing the document. Carrier agrees that any violation of the
              Broker-Motor Carrier Agreement is grounds for immediate termination for
              conducting business with the company.
            </p>
          </div>

          {/* Other */}
          <div className="mt-14 border-t border-white/[0.08] pt-10">
            <h3 className="kopf-eyebrow mb-3">§ Other Qualifications</h3>
            <p className="text-[var(--color-kopf-bone-muted)] text-base md:text-lg leading-relaxed max-w-4xl">
              Kopf engages in other carrier qualification processes which are
              proprietary. Kopf reserves the right to deny a carrier the ability to
              conduct business if any or all of these qualifications are not met. Terms
              and qualifications may be revised as deemed necessary by the company.
            </p>
            <ul className="mt-6 space-y-3 max-w-4xl">
              <li className="flex gap-4">
                <span className="font-[var(--font-jetbrains)] text-xs tabular-nums text-[var(--color-kopf-orange)] min-w-[24px]">01</span>
                <span className="text-[var(--color-kopf-bone-muted)]">
                  No Major Complaints on File with any External Websites (ex.: TIA WatchDog, Carrier 411 or Internet Truckstop).
                </span>
              </li>
              <li className="flex gap-4">
                <span className="font-[var(--font-jetbrains)] text-xs tabular-nums text-[var(--color-kopf-orange)] min-w-[24px]">02</span>
                <span className="text-[var(--color-kopf-bone-muted)]">
                  No Major Internal Complaints from Kopf Business Affiliates or Corporate Office.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ═══════════════ §06 DRIVER TYPES (4-icon grid) ═══════════════ */}
      <section className="relative bg-[var(--color-kopf-ink-2)] border-y border-white/[0.05] px-6 lg:px-10 py-24 md:py-28">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            chapter="06"
            eyebrow="Automated Carrier Onboarding"
            title={
              <>
                Streamlined Process<br />
                <span className="text-[var(--color-kopf-orange)]">for All Driver Types</span>
              </>
            }
            kicker="As a new Independent Freight Agent, getting started in the industry can be challenging. However, Kopf Logistics Group can help make the transition easier by sourcing the best carriers with our streamlined carrier setup process. Our carrier setup process will help you get started and ensure compliance with all necessary regulations."
          />
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4">
            {driverTypes.map((d, i) => (
              <div
                key={d.label}
                className="group relative border border-white/[0.08] bg-[var(--color-kopf-ink)] p-6 hover:border-[var(--color-kopf-orange)] transition flex flex-col items-center text-center"
              >
                <span className="font-[var(--font-jetbrains)] text-[10px] tabular-nums text-[var(--color-kopf-concrete)] self-start">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="mt-2 relative w-14 h-16">
                  <Image
                    src={`/kopf-original/images/${d.icon}`}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-contain theme-icon"
                  />
                </div>
                <p className="mt-4 text-[var(--color-kopf-bone)] font-[var(--font-anton)] uppercase tracking-tight text-lg">
                  {d.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ §07 FREIGHT SETTLEMENTS ═══════════════ */}
      <section className="relative px-6 lg:px-10 py-24 md:py-32">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            chapter="07"
            eyebrow="Cash in the Door"
            title="Freight Settlements"
          />
          <div className="mt-14 grid md:grid-cols-3 gap-6">
            {settlements.map((s, i) => (
              <div key={s.title} className="relative border border-white/[0.08] p-8 bg-[var(--color-kopf-ink-2)]">
                <Clock className="w-8 h-8 text-[var(--color-kopf-orange)] mb-5" strokeWidth={1.3} />
                <span className="font-[var(--font-jetbrains)] text-xs tabular-nums text-[var(--color-kopf-concrete)]">
                  0{i + 1}
                </span>
                <h3 className="mt-2 font-[var(--font-anton)] uppercase text-3xl leading-none tracking-tight">
                  {s.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-[var(--color-kopf-bone-muted)]">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ §08 JOIN CTA ═══════════════ */}
      <section className="relative bg-[var(--color-kopf-ink-2)] border-t border-white/[0.05] px-6 lg:px-10 py-24 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <SectionHeader
            chapter="08"
            eyebrow="574.971.8182"
            title="Join Our Carrier Network"
            kicker="Thank you for your interest in becoming a contract carrier with Kopf Logistics Group! It's easier than ever to become a part of our robust carrier network with MyCarrierPackets.com. It simplifies the paperwork process, eliminating the need to mail or fax carrier setup packets or insurance updates. Please contact one of our friendly and helpful Carrier Representatives at 574.971.8182 to find a load that best suits your needs."
            align="center"
          />
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button
              href="https://mycarrierpackets.com/"
              external
              variant="solid"
            >
              MyCarrierPackets.com
            </Button>
            <Button href="/contact">Talk to a Rep</Button>
          </div>
        </div>
      </section>
    </>
  );
}
