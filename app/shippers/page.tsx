import type { Metadata } from "next";
import Image from "next/image";
import Button from "@/components/ui/Button";
import SectionHeader from "@/components/ui/SectionHeader";
import PhoneEmailBlock from "@/components/ui/PhoneEmailBlock";
import { Quote } from "lucide-react";

export const metadata: Metadata = {
  title: "Shippers",
  description:
    "Customized truckload, temperature-controlled, open-deck, LTL, bulk, and power-only transportation solutions for manufacturers and distributors — from Elkhart, Indiana.",
  alternates: { canonical: "/shippers" },
};

const provisionList = [
  "Service Reliability",
  "Proactive Customer Service",
  "Accurate Invoicing & Documentation",
  "Operational Efficiency",
  "Scalable Technology",
  "Stellar Reputation",
  "Multiple Service Lanes",
  "Dedication & Accountability",
  "Integrity in Executing Shipper Terms",
];

const servicesOffered = [
  "Truckload",
  "Temperature-Controlled",
  "Open-Deck",
  "Less-Than-Truckload (LTL)",
  "Bulk Transport",
  "Power Only",
  "Drop-Trailer Service",
  "Drop & Hook Service",
  "Trailer Interchange",
  "Owner Operator",
];

export default function ShippersPage() {
  return (
    <>
      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative overflow-hidden isolate">
        <Image
          src="/kopf-original/images/shippers_bg2.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center -z-20 opacity-55"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-br from-[var(--color-kopf-ink)] via-[var(--color-kopf-ink)]/88 to-[var(--color-kopf-ink)]/72" />

        <div className="relative px-6 lg:px-10 pt-20 pb-24 md:pt-28 md:pb-32 max-w-6xl">
          <div className="flex items-center gap-3 mb-6 kopf-fade-up">
            <span className="kopf-chapter">§ Shippers</span>
            <span className="h-px w-10 bg-[var(--color-kopf-orange)]" />
            <span className="kopf-eyebrow">Manufacturers · Distributors</span>
          </div>

          <h1 className="font-[var(--font-anton)] uppercase leading-[0.9] tracking-tight text-[var(--color-kopf-bone)] text-[14vw] sm:text-7xl md:text-[7rem] lg:text-[9rem] kopf-fade-up kopf-fade-up-delay-1">
            Shippers
          </h1>

          <p className="mt-8 max-w-3xl text-base md:text-lg leading-relaxed text-[var(--color-kopf-bone-muted)] kopf-fade-up kopf-fade-up-delay-2">
            At Kopf Logistics Group, we work with manufacturers, distributors, and
            shippers to provide customized transportation solutions to meet the specific
            needs of our customers. We partner with freight carriers to ensure the best
            possible service is provided. We offer Truckload, Temperature-Controlled,
            Open-Deck, Less-Than-Truckload (LTL), Bulk Transport, Power Only, Drop-Trailer
            Service, Drop & Hook Service, Trailer Interchange and Owner Operator
            transportation services across our contract carrier network. We care about
            delivering your quality product efficiently and safely, which is why we strive
            to offer the best transportation solutions for our customers.
          </p>

          <div className="mt-10 flex flex-wrap items-start gap-8 kopf-fade-up kopf-fade-up-delay-3">
            <div>
              <span className="block kopf-eyebrow mb-3">Get Started Today!</span>
              <PhoneEmailBlock />
            </div>
            <div className="flex gap-3 pt-5">
              <Button href="#apply" variant="solid">Shipper Questionnaire</Button>
            </div>
          </div>
        </div>

        <div className="tread-divider" aria-hidden="true" />
      </section>

      {/* ═══════════════ SERVICES OFFERED ═══════════════ */}
      <section className="relative px-6 lg:px-10 py-24 md:py-28">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            chapter="01"
            eyebrow="10 Transportation Options"
            title="Services We Operate"
            kicker="One contract carrier network. Ten distinct service lines — matched to the exact requirements of your freight, your schedule, and your budget."
          />
          <ul className="mt-14 grid gap-x-10 gap-y-3 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl">
            {servicesOffered.map((svc, i) => (
              <li key={svc} className="flex items-baseline gap-4 border-t border-white/[0.08] pt-3">
                <span className="font-[var(--font-jetbrains)] text-xs tabular-nums text-[var(--color-kopf-concrete)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[var(--color-kopf-bone)] font-[var(--font-anton)] uppercase tracking-tight text-lg">
                  {svc}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ═══════════════ TESTIMONIAL ═══════════════ */}
      <section className="relative bg-[var(--color-kopf-ink-2)] border-y border-white/[0.05] px-6 lg:px-10 py-24 md:py-28">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <span className="kopf-chapter">§ 02</span>
            <span className="h-px w-10 bg-[var(--color-kopf-orange)]" />
            <span className="kopf-eyebrow">What They Say</span>
          </div>

          <Quote className="w-14 h-14 text-[var(--color-kopf-orange)] mb-4" strokeWidth={1.2} />

          <blockquote className="font-[var(--font-anton)] uppercase text-3xl md:text-5xl leading-[1.05] tracking-tight text-[var(--color-kopf-bone)] max-w-4xl">
            "Kopf has been a time tested source for reliable transportation of our
            materials to support production. Always prompt, efficient and courteous, a
            pleasure to work with covering a broad spectrum of locations."
          </blockquote>

          <footer className="mt-8 flex items-center gap-4 pt-5 border-t border-white/[0.08] max-w-md">
            <span className="block w-12 h-12 bg-[var(--color-kopf-orange)] grid place-items-center font-[var(--font-anton)] uppercase text-2xl text-[var(--color-kopf-ink)]">
              B
            </span>
            <span>
              <span className="block font-[var(--font-anton)] uppercase text-xl">Bob</span>
              <span className="block font-[var(--font-jetbrains)] text-xs uppercase tracking-[0.22em] text-[var(--color-kopf-concrete)]">
                RV Industry
              </span>
            </span>
          </footer>
        </div>
      </section>

      {/* ═══════════════ WHY ELKHART? (Location) ═══════════════ */}
      <section className="relative px-6 lg:px-10 py-24 md:py-28">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <SectionHeader
              chapter="03"
              eyebrow="The RV Capital Advantage"
              title={
                <>
                  Shippers Served<br />
                  <span className="text-[var(--color-kopf-orange)]">Nationwide</span>
                </>
              }
            />
          </div>
          <div className="lg:col-span-7 space-y-6 text-base md:text-lg leading-relaxed" style={{ color: "var(--text-muted)" }}>
            <p>
              We are committed to understanding our customer&apos;s freight and offer superior
              customer service with each delivery. Our location is a major benefit to our
              customers, allowing Kopf to dispatch its equipment quickly to all regions of
              the country.
            </p>
            <p>
              Kopf&apos;s main truck terminal is located in Elkhart County, Indiana, &ldquo;the RV
              Capital of the World.&rdquo; Several interstate highways crisscross in
              Indianapolis and connect our state to the rest of the United States. Kopf
              operates two additional truck terminals. Our terminal in Seaford, Delaware
              allows us to service Northeast lanes. Our terminal in Athens, Georgia allows
              us to service Southeast lanes.
            </p>

            <div className="relative aspect-[16/9] overflow-hidden mt-6">
              <Image
                src="/pexels/loading_dock2.jpg"
                alt="Kopf shipper loading dock operations"
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-4 pt-6">
              {[
                { city: "Elkhart, IN", label: "HQ · RV Capital" },
                { city: "Athens, GA", label: "Southeast Lanes" },
                { city: "Seaford, DE", label: "Northeast Lanes" },
              ].map((t) => (
                <div key={t.city} className="border-l-2 pl-4 py-2" style={{ borderColor: "var(--accent)" }}>
                  <div className="font-[var(--font-anton)] uppercase text-lg leading-tight" style={{ color: "var(--text)" }}>
                    {t.city}
                  </div>
                  <div className="mt-1 font-[var(--font-jetbrains)] text-[10px] uppercase tracking-[0.22em]" style={{ color: "var(--text-concrete)" }}>
                    {t.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ PROVISION (9 items) ═══════════════ */}
      <section className="relative bg-[var(--color-kopf-ink-2)] border-y border-white/[0.05] px-6 lg:px-10 py-24 md:py-32">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            chapter="04"
            eyebrow="Provision"
            title="We Provide What Shippers Want"
          />
          <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {provisionList.map((item, i) => (
              <li
                key={item}
                className="group relative border border-white/[0.08] bg-[var(--color-kopf-ink)]/60 p-6 hover:border-[var(--color-kopf-orange)]/70 transition"
              >
                <span className="font-[var(--font-jetbrains)] text-xs tabular-nums text-[var(--color-kopf-concrete)] group-hover:text-[var(--color-kopf-orange)] transition">
                  0{i + 1}
                </span>
                <p className="mt-3 text-[var(--color-kopf-bone)] text-lg leading-snug font-[var(--font-anton)] uppercase tracking-tight">
                  {item}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ═══════════════ APPLY (Form link) ═══════════════ */}
      <section id="apply" className="relative px-6 lg:px-10 py-24 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <SectionHeader
            chapter="05"
            eyebrow="Confidential Questionnaire"
            title="Apply Now"
            kicker="The information obtained from this questionnaire is kept strictly confidential and will not be shared. Our team will follow up within one business day."
            align="center"
          />

          <div className="mt-10 inline-flex flex-col gap-6 items-center">
            <PhoneEmailBlock align="center" />
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                href="https://kopflogisticsgroup.com/shippers/#apply"
                external
                variant="solid"
              >
                Start Shipper Questionnaire
              </Button>
              <Button href="/contact">Contact Our Team</Button>
            </div>
          </div>

          <p className="mt-10 text-xs font-[var(--font-jetbrains)] uppercase tracking-[0.22em] text-[var(--color-kopf-concrete)]">
            By providing a telephone number and submitting this form you are consenting to
            be contacted by SMS text message. Message & data rates may apply.
          </p>
        </div>
      </section>
    </>
  );
}
