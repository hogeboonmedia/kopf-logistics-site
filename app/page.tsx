import type { Metadata } from "next";
import Image from "next/image";
import Button from "@/components/ui/Button";
import SectionHeader from "@/components/ui/SectionHeader";
import VideoEmbed from "@/components/ui/VideoEmbed";
import PhoneEmailBlock from "@/components/ui/PhoneEmailBlock";
import TestimonialsMarquee from "@/components/sections/TestimonialsMarquee";
import EquipmentBento from "@/components/sections/EquipmentBento";
import { equipment, equipmentJsonLd } from "@/lib/equipment";
import { Check } from "lucide-react";
import reviewsData from "@/.planning/google-reviews.json";

export const metadata: Metadata = {
  title: { absolute: "Home - Kopf Logistics Group" },
  description:
    "Explore Kopf Logistics Group's 50+ years of excellence in trucking logistics with our advanced TMS, 24/7 support, and tailored solutions.",
  alternates: { canonical: "/" },
};

const heroPills = [
  "70/30 Commission Split",
  "Dedicated 24/7 Office Support",
  "Weekly Settlements",
  "Award-Winning TMS",
];

const advantages = [
  "Sound Financial Strength",
  "Ability to Repower",
  "Over 300+ Years Combined Industry Experience",
  "24/7/365 Service and Accessibility",
  "Low Driver Turnover & Safety Culture",
  "Lower Transaction Risk Due to Long-Term Relationships",
  "Freight to Fill Your Trailers",
];

const tmsCapabilities = [
  "eLoad Confirmations",
  "Order Entry & Load Planning",
  "Dispatch",
  "Track & Trace",
  "Driver & Carrier Management",
  "Real-time Scoring & Workflow",
  "Telemarketing",
  "OS&D Claims",
  "Business Process Automation",
  "Revenue Analysis",
  "Disaster Recovery",
];

export default function HomePage() {
  return (
    <>
      {/* Service ItemList JSON-LD — discrete schema entry per freight mode.
        * Plain <script> (not next/script) so it lands in the SSR HTML at
        * first paint, indexed by every crawler without needing JS execution. */}
      <script
        id="ld-equipment-itemlist"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(equipmentJsonLd()) }}
      />
      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative overflow-hidden isolate">
        <Image
          src="/pexels/truck_sunset_hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center -z-20"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 kopf-photo-overlay" />
        <div className="kopf-grain -z-10" aria-hidden="true" />

        <div className="relative px-6 lg:px-10 pt-16 pb-24 md:pt-24 md:pb-32 grid lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-16 items-center">
          <div>
            <div className="flex items-center gap-3 mb-6 kopf-fade-up">
              <span className="kopf-chapter">§ 00</span>
              <span className="h-px w-10" style={{ background: "var(--accent)" }} />
              <span className="kopf-eyebrow">Est. 1966 · Elkhart, Indiana</span>
            </div>

            <h1 className="font-[var(--font-anton)] uppercase leading-[0.85] tracking-tight kopf-fade-up kopf-fade-up-delay-1" style={{ color: "var(--text)" }}>
              <span className="block text-[11vw] sm:text-7xl md:text-[6.5rem] lg:text-[7.5rem]">Kopf Logistics</span>
              <span className="block text-[11vw] sm:text-7xl md:text-[6.5rem] lg:text-[7.5rem]" style={{ color: "var(--accent)" }}>Group</span>
            </h1>

            <div
              className="mt-8 inline-flex items-center gap-4 border-l-4 pl-5 kopf-fade-up kopf-fade-up-delay-2"
              style={{ borderColor: "var(--accent)" }}
            >
              <span className="font-[var(--font-anton)] text-3xl md:text-4xl uppercase tracking-tight leading-none" style={{ color: "var(--text)" }}>
                50 Years
              </span>
              <span className="font-[var(--font-anton)] text-3xl md:text-4xl uppercase tracking-tight leading-none" style={{ color: "var(--text-muted)" }}>
                of Excellence!
              </span>
            </div>

            <p className="mt-8 max-w-2xl text-base md:text-lg leading-relaxed kopf-fade-up kopf-fade-up-delay-3" style={{ color: "var(--text-muted)" }}>
              For over 50 years, Kopf Logistics Group has been a pioneer in the trucking
              logistics sector, offering a 70/30 commission split, dedicated 24/7 office
              support, weekly settlements, and an award-winning Transportation Management
              System (TMS). We pride ourselves on being a one-stop solution for independent
              freight agents, shippers, drivers, and carriers, addressing their unique
              challenges and pain points with innovative solutions and unparalleled support.
            </p>

            <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-2 kopf-fade-up kopf-fade-up-delay-3">
              {heroPills.map((pill) => (
                <li
                  key={pill}
                  className="flex items-center gap-3 px-4 py-3 backdrop-blur-sm"
                  style={{ border: "1px solid var(--hairline-strong)", background: "color-mix(in srgb, var(--bg) 60%, transparent)" }}
                >
                  <Check className="w-4 h-4 shrink-0" strokeWidth={3} style={{ color: "var(--accent)" }} />
                  <span className="text-sm font-[var(--font-jetbrains)] uppercase tracking-[0.08em]" style={{ color: "var(--text)" }}>
                    {pill}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap items-center gap-4 kopf-fade-up kopf-fade-up-delay-4">
              <Button href="/agent" variant="solid">Become a Freight Agent</Button>
              <a href="tel:5743495600" className="kopf-btn">
                Call Now
                <span className="font-[var(--font-jetbrains)] tabular-nums ml-2" style={{ color: "var(--accent)" }}>
                  574.349.5600
                </span>
              </a>
            </div>

            <div className="mt-8 kopf-fade-up kopf-fade-up-delay-4">
              <PhoneEmailBlock />
            </div>
          </div>

          {/* Hero graphic: offset truck */}
          <div className="relative hidden lg:block kopf-fade-up kopf-fade-up-delay-2">
            <div className="absolute -top-6 -left-6 h-full w-full" style={{ border: "1px solid color-mix(in srgb, var(--accent) 60%, transparent)" }} />
            <div className="relative aspect-[5/4]" style={{ background: "var(--bg-steel)" }}>
              <Image
                src="/kopf-original/images/truck_full_5-1000x670-1.png"
                alt="Kopf Logistics Group truck"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain p-8"
                priority
              />
              <span className="absolute top-6 right-6 font-[var(--font-jetbrains)] uppercase text-[10px] tracking-[0.3em]" style={{ color: "var(--text-concrete)" }}>
                Fleet · Since &apos;66
              </span>
            </div>
          </div>
        </div>

        <div className="tread-divider" aria-hidden="true" />
      </section>

      {/* ═══════════════ §01 WHY KOPF + VIDEO ═══════════════ */}
      <section id="why-kopf" className="relative px-6 lg:px-10 py-24 md:py-32">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-16 items-center">
          <SectionHeader
            chapter="01"
            eyebrow="Our Story in 3 Minutes"
            title="Why Kopf?"
            kicker={
              <>
                A second-generation, family-owned truck brokerage built on sound financial
                strength and relationships that stand the test of time. Hear why independent
                freight agents choose Team Kopf.
              </>
            }
          />
          <VideoEmbed
            youTubeId="KuJq8F-uSkM"
            title="What does an Independent Freight Agent do? Accelerate Your Success With Kopf"
          />
        </div>
      </section>

      {/* ═══════════════ TESTIMONIALS — REAL GOOGLE REVIEWS ═══════════════ */}
      <section id="testimonials" className="relative px-6 lg:px-10 py-24 md:py-32" style={{ background: "var(--bg-elevated)", borderTop: "1px solid var(--hairline)", borderBottom: "1px solid var(--hairline)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <div className="flex items-center gap-3 mb-4 justify-center">
              <span className="kopf-chapter">§ TESTIMONIALS</span>
              <span className="h-px w-10" style={{ background: "var(--accent)" }} />
              <span className="kopf-eyebrow">Verified Google Reviews</span>
            </div>
            <h2 className="font-[var(--font-anton)] uppercase text-4xl md:text-5xl lg:text-6xl leading-[0.95] tracking-tight" style={{ color: "var(--text)" }}>
              What They Say<br />
              <span style={{ color: "var(--accent)" }}>About Working With Kopf</span>
            </h2>
            <p className="mt-5 text-base md:text-lg leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Unedited reviews from shippers, carriers, owner operators and freight agents
              who&apos;ve moved loads with us — pulled directly from Google Business.
            </p>
          </div>

          <TestimonialsMarquee
            testimonials={reviewsData.fiveStarReviews}
            rating={reviewsData.overallRating}
            total={reviewsData.totalReviews}
          />
        </div>
      </section>

      {/* ═══════════════ §02 OPERATIONAL EXCELLENCE + PHOTO ═══════════════ */}
      <section className="relative px-6 lg:px-10 py-24 md:py-32">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5">
            <SectionHeader
              chapter="02"
              eyebrow="The Discipline of Shipping"
              title={
                <>
                  Operational<br />
                  <span style={{ color: "var(--accent)" }}>Excellence</span>
                </>
              }
            />
            <div className="mt-8 space-y-6 text-base md:text-lg leading-relaxed" style={{ color: "var(--text-muted)" }}>
              <p>
                Solid business relationships hinge on producing solutions that are reliable,
                consistent and timely. Kopf listens to your transportation needs and
                communicates its expertise through technology to help achieve lower costs,
                operational efficiencies and increased profits.
              </p>
              <p>
                We work to understand our customers&apos; businesses and, as a result, deliver the
                right combination of people, assets and ideas that make a measurable
                bottom-line difference.
              </p>
              <p>
                We strive to maintain operational excellence at all times, never compromising
                our integrity or reputation, and have become the first choice for our
                customers by simplifying the shipping process.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 relative">
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src="/pexels/team_meeting.jpg"
                alt="Kopf operations team in discussion"
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover"
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(225deg, transparent 40%, color-mix(in srgb, var(--bg) 85%, transparent))" }} />
            </div>
            <div
              className="absolute -bottom-6 -right-6 hidden md:block px-6 py-5 font-[var(--font-jetbrains)] tabular-nums"
              style={{ background: "var(--accent)", color: "var(--on-accent)" }}
            >
              <div className="text-[10px] uppercase tracking-[0.22em]">Combined Experience</div>
              <div className="font-[var(--font-anton)] text-5xl leading-none mt-1">300+</div>
              <div className="text-[10px] uppercase tracking-[0.22em] mt-1">Years</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ §03 THE KOPF ADVANTAGE ═══════════════ */}
      <section className="relative px-6 lg:px-10 py-24 md:py-32" style={{ background: "var(--bg-elevated)", borderTop: "1px solid var(--hairline)", borderBottom: "1px solid var(--hairline)" }}>
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            chapter="03"
            eyebrow="Benefits That Compound"
            title="The Kopf Advantage"
            kicker="Partnering with Kopf Logistics Group means unlocking a wealth of benefits for your business. Our comprehensive suite of services ensures you receive:"
          />

          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {advantages.map((adv, i) => (
              <li
                key={adv}
                className="group relative p-6 transition"
                style={{
                  background: "var(--card-on-steel)",
                  border: "1px solid var(--hairline-strong)",
                }}
              >
                <span className="font-[var(--font-jetbrains)] text-xs tabular-nums transition" style={{ color: "var(--text-concrete)" }}>
                  0{i + 1}
                </span>
                <p className="mt-3 text-lg leading-snug font-[var(--font-anton)] uppercase tracking-tight" style={{ color: "var(--text)" }}>
                  {adv}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-16 grid md:grid-cols-[auto_1fr] gap-6 items-center pt-10" style={{ borderTop: "1px solid var(--hairline-strong)" }}>
            <span className="font-[var(--font-anton)] uppercase text-4xl md:text-5xl tracking-tight" style={{ color: "var(--accent)" }}>
              McLeod TMS
            </span>
            <p className="text-base md:text-lg leading-relaxed max-w-2xl" style={{ color: "var(--text-muted)" }}>
              Our transportation management technology enhances existing operations,
              maximizes your carrier network and decreases costs.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════ §04 OUR TMS CAPABILITIES + DISPATCH PHOTO ═══════════════ */}
      <section className="relative px-6 lg:px-10 py-24 md:py-32">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <SectionHeader
              chapter="04"
              eyebrow="11 Integrated Modules"
              title="Our TMS Capabilities"
              kicker="Our state-of-the-art Transportation Management System (TMS) lies at the heart of our operations, enabling us to provide exceptional service to our clients. With features like real-time tracking, advanced analytics, and seamless communication, our TMS equips you with the tools you need to optimize your logistics operations."
            />

            <div className="mt-8 relative aspect-[5/4] overflow-hidden">
              <Image
                src="/pexels/dispatch_office.jpg"
                alt="Dispatch office using Kopf's TMS"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
              <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
                <span className="px-3 py-1 font-[var(--font-jetbrains)] text-[10px] uppercase tracking-[0.22em]" style={{ background: "var(--accent)", color: "var(--on-accent)" }}>
                  McLeod TMS
                </span>
                <span className="font-[var(--font-jetbrains)] text-[10px] uppercase tracking-[0.22em]" style={{ color: "var(--text-muted)" }}>
                  Cloud disaster recovery
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <ul className="grid gap-x-10 gap-y-4 md:grid-cols-2">
              {tmsCapabilities.map((cap, i) => (
                <li
                  key={cap}
                  className="group flex items-baseline gap-4 pt-3 transition"
                  style={{ borderTop: "1px solid var(--hairline-strong)" }}
                >
                  <span className="font-[var(--font-jetbrains)] text-xs tabular-nums transition" style={{ color: "var(--text-concrete)" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-base" style={{ color: "var(--text)" }}>{cap}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ═══════════════ §05 EQUIPMENT WE OPERATE ═══════════════ */}
      <section className="relative overflow-hidden isolate py-24 md:py-32 px-6 lg:px-10">
        <Image
          src="/pexels/truck_fleet.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center -z-20 opacity-25"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10" style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--bg) 95%, transparent), color-mix(in srgb, var(--bg) 85%, transparent))" }} />

        <div className="max-w-7xl mx-auto relative">
          <SectionHeader
            chapter="05"
            eyebrow="10 Transportation Options"
            title="Equipment We Operate"
            kicker="At Kopf Logistics Group, we put years of equipment investment at your fingertips to help your business find the best and most cost-effective transportation options. Our fast response time will provide you with the service you need to improve your supply chain productivity. Tap any service below for full details on coverage, ideal cargo, and how Kopf moves it."
          />

          <EquipmentBento items={equipment} />
        </div>
      </section>

      {/* ═══════════════ §06 OUR BUSINESS SOLUTIONS + WAREHOUSE PHOTO ═══════════════ */}
      <section className="relative px-6 lg:px-10 py-24 md:py-32">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src="/pexels/warehouse_ops.jpg"
                alt="Warehouse operations and freight coordination"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div
              className="absolute -top-6 -left-6 hidden md:block px-6 py-4 font-[var(--font-jetbrains)] text-xs uppercase tracking-[0.22em]"
              style={{ background: "var(--bg)", color: "var(--text)", border: "1px solid var(--hairline-strong)" }}
            >
              Cloud disaster recovery · 48 states
            </div>
          </div>

          <div className="lg:col-span-6">
            <SectionHeader
              chapter="06"
              eyebrow="Technology + Teamwork"
              title="Our Business Solutions"
            />
            <div className="mt-8 space-y-6 text-base md:text-lg leading-relaxed" style={{ color: "var(--text-muted)" }}>
              <p>
                At Kopf, we know you have many options to choose from to haul your freight or
                load your trucks. That&apos;s why Kopf champions investment in technology, whether
                to optimize the performance of our fleet, or to match your shipping needs
                with the capabilities and capacity of our contract carrier network.
              </p>
              <p>
                Our business office is professionally staffed with employees trained to
                utilize TMS technology to simplify shipping processes and allow Kopf to haul
                more loads. We also make use of a cloud-based disaster recovery system to
                minimize down time in our business office in the event of an accident or
                natural disaster.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ §07–09 AUDIENCE BANDS ═══════════════ */}
      <section className="relative" style={{ background: "var(--bg-elevated)", borderTop: "1px solid var(--hairline)", borderBottom: "1px solid var(--hairline)" }}>
        <div className="max-w-7xl mx-auto">

          {/* Shippers band */}
          <div className="grid lg:grid-cols-2 gap-0" style={{ borderBottom: "1px solid var(--hairline-strong)" }}>
            <div className="relative min-h-[340px] lg:min-h-[440px] overflow-hidden" style={{ background: "var(--bg-steel)" }}>
              <Image
                src="/pexels/loading_dock.jpg"
                alt="Shippers loading dock"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to right, color-mix(in srgb, var(--bg-elevated) 80%, transparent), transparent)" }} />
              <span className="absolute top-6 left-6 kopf-chapter">§ 07</span>
              <span className="absolute bottom-6 left-6 kopf-eyebrow">For Manufacturers & Distributors</span>
            </div>
            <div className="p-10 lg:p-14 flex flex-col justify-center">
              <h2 className="font-[var(--font-anton)] uppercase text-4xl md:text-5xl tracking-tight leading-none" style={{ color: "var(--text)" }}>Shippers</h2>
              <p className="mt-5 text-base md:text-lg leading-relaxed" style={{ color: "var(--text-muted)" }}>
                For our shippers, deploying technology is a practical decision centered on
                our desire to provide an outstanding service experience and streamline your
                shipping processes. Hauling freight is our livelihood, and we value
                building customer relationships that stand the test of time. Our technology
                allows us to be responsive to your needs and enhances good business
                decisions time and again.
              </p>
              <div className="mt-8">
                <Button href="/shippers" variant="solid">Become a Shipper</Button>
              </div>
            </div>
          </div>

          {/* Agents band */}
          <div className="grid lg:grid-cols-2 gap-0" style={{ borderBottom: "1px solid var(--hairline-strong)" }}>
            <div className="p-10 lg:p-14 flex flex-col justify-center order-2 lg:order-1">
              <h2 className="font-[var(--font-anton)] uppercase text-4xl md:text-5xl tracking-tight leading-none" style={{ color: "var(--text)" }}>Independent Freight Agents</h2>
              <p className="mt-5 text-base md:text-lg leading-relaxed" style={{ color: "var(--text-muted)" }}>
                At Kopf Logistics Group, we&apos;ve designed our services to address the unique
                needs of independent freight agents. With our advanced TMS and dedicated
                support, you can simplify your shipping processes, ensure compliance with
                industry regulations, and focus on growing your business.
              </p>
              <div className="mt-8">
                <Button href="/agent" variant="solid">Agent Opportunities</Button>
              </div>
            </div>
            <div className="relative min-h-[340px] lg:min-h-[440px] overflow-hidden order-1 lg:order-2" style={{ background: "var(--accent)" }}>
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center px-8">
                  <span className="block font-[var(--font-anton)] text-[22vw] lg:text-[10rem] leading-none opacity-20" style={{ color: "var(--on-accent)" }}>70/30</span>
                  <span className="block -mt-6 font-[var(--font-anton)] text-3xl md:text-4xl uppercase" style={{ color: "var(--on-accent)" }}>Commission Split</span>
                </div>
              </div>
              <span className="absolute top-6 left-6 kopf-chapter" style={{ color: "var(--on-accent)" }}>§ 08</span>
              <span className="absolute bottom-6 left-6 font-[var(--font-jetbrains)] text-xs uppercase tracking-[0.22em] font-semibold" style={{ color: "var(--on-accent)" }}>
                With Qualified Candidates
              </span>
            </div>
          </div>

          {/* Carriers band */}
          <div className="grid lg:grid-cols-2 gap-0">
            <div className="relative min-h-[340px] lg:min-h-[440px] overflow-hidden" style={{ background: "var(--bg)" }}>
              <Image
                src="/pexels/driver_cab.jpg"
                alt="Driver in the cab of a semi truck"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover opacity-60"
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to right, color-mix(in srgb, var(--bg) 50%, transparent), color-mix(in srgb, var(--bg) 95%, transparent))" }} />
              <div className="absolute inset-0 grid place-items-center p-10">
                <div className="text-center">
                  <span className="block kopf-eyebrow mb-3">48 Contiguous States</span>
                  <span className="block font-[var(--font-anton)] text-5xl md:text-7xl uppercase leading-none" style={{ color: "var(--text)" }}>
                    Up to<br /><span style={{ color: "var(--accent)" }}>$2,500</span><br />Advance
                  </span>
                  <span className="block mt-4 text-xs uppercase tracking-[0.22em] font-[var(--font-jetbrains)]" style={{ color: "var(--text-muted)" }}>
                    40% of line haul · after 3 loads
                  </span>
                </div>
              </div>
              <span className="absolute top-6 left-6 kopf-chapter">§ 09</span>
            </div>
            <div className="p-10 lg:p-14 flex flex-col justify-center">
              <h2 className="font-[var(--font-anton)] uppercase text-4xl md:text-5xl tracking-tight leading-none" style={{ color: "var(--text)" }}>Carriers</h2>
              <p className="mt-5 text-base md:text-lg leading-relaxed" style={{ color: "var(--text-muted)" }}>
                For our contract carriers, Kopf&apos;s technology is designed to give it the
                ability to quickly match its available freight to your equipment and help
                you produce more billable miles. We also help you keep reporting costs
                down, embracing the use of paperless technologies to gather required
                documents and speed up freight settlements to your bank account.
              </p>
              <div className="mt-8">
                <Button href="/carriers" variant="solid">Become a Carrier</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ §10 TECHNOLOGY MADE TO MEASURE ═══════════════ */}
      <section id="technology-made-to-measure" className="relative overflow-hidden isolate px-6 lg:px-10 py-24 md:py-32">
        <Image
          src="/kopf-original/images/home_bg_tech.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center -z-20"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 kopf-photo-overlay" />
        <div aria-hidden="true" className="kopf-grain -z-10" />

        <div className="max-w-5xl mx-auto text-center">
          <SectionHeader
            chapter="10"
            eyebrow="Precision for the Supply Chain"
            title={
              <>
                Technology<br />
                <span style={{ color: "var(--accent)" }}>Made to Measure</span>
              </>
            }
            align="center"
            kicker="Kopf Logistics Group's transportation management technology will provide you with a simple, yet powerful way to manage your supply chain. Technology made to measure joins together transportation expertise, solid business practices and people to tap its full power. Exciting features like interface customization and customized reporting automate and analyze your logistics process, saving time and money."
          />
          <div className="mt-10 flex justify-center">
            <Button href="/contact" variant="solid">Contact Us</Button>
          </div>
        </div>
      </section>

      {/* ═══════════════ §11 GET STARTED + VIDEO 2 ═══════════════ */}
      <section className="relative px-6 lg:px-10 py-24 md:py-32" style={{ borderTop: "1px solid var(--hairline)" }}>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-16 items-center">
          <VideoEmbed
            youTubeId="6HtH4FymnVM"
            title="Welcome to Kopf Logistics Group — Now Recruiting Independent Freight Agents!"
          />
          <div>
            <SectionHeader
              chapter="11"
              eyebrow="Now Recruiting"
              title="Get Started Today!"
              kicker="Now recruiting Independent Freight Agents nationwide. Call our recruiting team or start your application — weekly settlements paid upon billing with clean paperwork."
            />
            <div className="mt-8 space-y-5">
              <PhoneEmailBlock />
              <div className="flex flex-wrap gap-3">
                <Button href="/agent" variant="solid">Apply Now</Button>
                <Button href="/about">Read Our Story</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ §12 OUR HIGHER PURPOSE ═══════════════ */}
      <section className="relative overflow-hidden isolate">
        <Image
          src="/kopf-original/images/home_bg_quote2.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center -z-20 opacity-30"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 kopf-photo-overlay" />

        <div className="px-6 lg:px-10 py-24 md:py-36 max-w-5xl mx-auto text-center relative">
          <div className="flex items-center gap-3 mb-6 justify-center">
            <span className="kopf-chapter">§ 12</span>
            <span className="h-px w-10" style={{ background: "var(--accent)" }} />
            <span className="kopf-eyebrow">A Family of Faith</span>
          </div>

          <h2 className="font-[var(--font-anton)] uppercase text-5xl md:text-7xl lg:text-8xl leading-none tracking-tight" style={{ color: "var(--text)" }}>
            Our Higher <span style={{ color: "var(--accent)" }}>Purpose</span>
          </h2>

          <div className="mt-10 max-w-3xl mx-auto space-y-6 text-base md:text-lg leading-relaxed" style={{ color: "var(--text-muted)" }}>
            <p>
              Finding deep meaning and fulfillment in life starts with a clear sense of
              purpose. The understanding there is something to strive for bigger than self,
              broadens our vision and challenges us to make a difference in the lives of
              others. Fulfillment is found when we step out of our comfort zone and care
              enough to become involved in our community and world.
            </p>
            <p>
              As a family of faith, we have been blessed with a clear sense of purpose, to
              feed people. Millions of people go to bed at night wondering where their next
              meal will come from. Hunger, food insecurity and poverty affects people of
              all walks of life. At Kopf, we are grateful for a unique opportunity to share
              our love for Jesus with others through the giving of food, the gift that
              provides nourishment for people to flourish and thrive.
            </p>
          </div>

          <blockquote className="mt-14 pt-10 max-w-2xl mx-auto" style={{ borderTop: "1px solid color-mix(in srgb, var(--accent) 40%, transparent)" }}>
            <p className="kopf-accent-italic text-3xl md:text-5xl leading-snug" style={{ color: "var(--text)" }}>
              &ldquo;Give them something to eat.&rdquo;
            </p>
            <footer className="mt-5 font-[var(--font-jetbrains)] text-xs tracking-[0.3em] uppercase" style={{ color: "var(--accent)" }}>
              — Luke 9:13
            </footer>
          </blockquote>

          <div className="mt-12">
            <Button href="/about">Our Story</Button>
          </div>
        </div>
      </section>
    </>
  );
}
