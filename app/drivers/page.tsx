import type { Metadata } from "next";
import Image from "next/image";
import Button from "@/components/ui/Button";
import SectionHeader from "@/components/ui/SectionHeader";
import PhoneEmailBlock from "@/components/ui/PhoneEmailBlock";
import { Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Drivers",
  description:
    "Join Kopf Logistics Group's elite team of drivers. Explore rewarding CDL careers with competitive benefits and nationwide opportunities.",
  alternates: { canonical: "/drivers" },
};

const companyBenefits = [
  "Regular Home Time",
  "Range of Miles for Your Driving Preference",
  "All Miles are Paid, Loaded or Empty",
  "Lanes with Steady Freight",
  "Solo and Team Driving Opportunities",
  "New and Late Model Equipment",
  "Outstanding Safety Program",
  "Health and Dental Insurance",
  "Vacation and Holiday Pay",
  "95% No-touch Freight",
  "Fuel Card Program",
  "Rider Program",
  "Clean Inspection Bonus",
];

const qualifications = [
  "Must be 23 Years of Age",
  "Must Pass DOT Drug Screen",
  "Valid Commercial Driver's License (CDL-A)",
  "Clean MVR",
  "Copy of DOT Medical Card",
  "Solid Work History",
];

const ownerOperatorBenefits = [
  "Regular Home Time",
  "Range of Miles for Your Driving Preference",
  "Percentage of Gross Revenue Pay",
  "Lanes with Steady Freight",
  "Outstanding Safety Program",
  "Save on Insurance by Pulling our Trailers",
  "Solo and Team Driving Opportunities",
  "Base Plate Finance Program",
  "Weekly Settlements",
  "95% No-touch Freight",
  "Permits Provided",
  "Rider Program",
  "Company Paid Cargo and Liability Insurance",
  "Clean Inspection Bonus",
  "Mechanics Shop at Main Terminal that Performs DOT Inspections",
];

const ownerOperatorResponsibilities = [
  "Percentage Lease Agreement",
  "Base Plates",
  "Annual DOT Truck Inspection",
  "Truck Insurance: Non-trucking Auto Liability – \"Bobtail\"",
  "Physical Damage Insurance",
  "Occupational Accidental",
  "Passenger Accident Insurance",
];

const driverTypes = [
  { label: "Over the Road", icon: "drivers_road.png" },
  { label: "Regional", icon: "drivers_regional.png" },
  { label: "Part-Time", icon: "drivers_part-time.png" },
  { label: "Casual", icon: "drivers_casual.png" },
];

export default function DriversPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden isolate">
        <Image
          src="/pexels/driver_portrait.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center -z-20 opacity-55"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-br from-[var(--color-kopf-ink)] via-[var(--color-kopf-ink)]/92 to-[var(--color-kopf-ink-2)]/95" />

        <div className="relative px-6 lg:px-10 pt-20 pb-24 md:pt-28 md:pb-32 max-w-6xl">
          <div className="flex items-center gap-3 mb-6 kopf-fade-up">
            <span className="kopf-chapter">§ Drivers</span>
            <span className="h-px w-10 bg-[var(--color-kopf-orange)]" />
            <span className="kopf-eyebrow">CDL-A · Nationwide Opportunities</span>
          </div>

          <h1 className="font-[var(--font-anton)] uppercase leading-[0.9] tracking-tight text-[var(--color-kopf-bone)] text-[8vw] sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.5rem] max-w-6xl kopf-fade-up kopf-fade-up-delay-1">
            Join Kopf Logistics Group:<br />
            <span className="text-[var(--color-kopf-orange)]">
              Nationwide Driving Opportunities
            </span>{" "}
            for Company Drivers and Owner Operators
          </h1>

          <p className="mt-8 max-w-3xl text-base md:text-lg leading-relaxed text-[var(--color-kopf-bone-muted)] kopf-fade-up kopf-fade-up-delay-2">
            In today's competitive trucking industry, finding the right fit for your
            driving career can be challenging. With so many transportation companies,
            finding one that offers excellent benefits, job security, and growth
            opportunities is essential. Kopf Logistics Group is one such company that
            stands out from the rest, providing nationwide driving opportunities for
            both company drivers and owner operators.
          </p>

          <div className="mt-10 flex flex-wrap items-start gap-8 kopf-fade-up kopf-fade-up-delay-3">
            <div>
              <span className="block kopf-eyebrow mb-3">Get Started Today!</span>
              <PhoneEmailBlock />
            </div>
            <div className="flex gap-3 pt-5">
              <Button href="#company-drivers" variant="solid">Company Drivers</Button>
              <Button href="#owner-operators">Owner Operators</Button>
            </div>
          </div>
        </div>
        <div className="tread-divider" aria-hidden="true" />
      </section>

      {/* §01 INTRODUCTION */}
      <section className="relative px-6 lg:px-10 py-24 md:py-28">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5">
            <SectionHeader
              chapter="01"
              eyebrow="Since 1966"
              title={
                <>
                  A Brief Introduction to<br />
                  <span style={{ color: "var(--accent)" }}>Kopf Logistics Group</span>
                </>
              }
            />
            <div className="mt-8 space-y-6 text-base md:text-lg leading-relaxed" style={{ color: "var(--text-muted)" }}>
              <p>
                Kopf Logistics Group is a well-established transportation company with a
                strong presence in the industry. With a range of services like truckload,
                less-than-truckload (LTL), temperature-controlled shipping, bulk
                transport, open-deck transport, drop & hook, and drop-trailer services,
                we cater to a wide variety of shipping needs.
              </p>
              <p>
                What sets Kopf Logistics Group apart from other transportation companies
                is our commitment to providing a supportive, results-oriented atmosphere
                for our drivers. In addition, we actively seek new talent, enabling them
                to continue as the carrier of choice for their customers while offering
                ample professional and personal growth opportunities.
              </p>
              <Button href="#apply" variant="solid">Apply Now</Button>
            </div>
          </div>
          <div className="lg:col-span-7 relative">
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src="/pexels/driver_cab.jpg"
                alt="Kopf truck driver in cab"
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-6 left-6 md:left-auto md:-right-6 px-6 py-4 font-[var(--font-jetbrains)] tabular-nums" style={{ background: "var(--accent)", color: "var(--on-accent)" }}>
              <div className="text-[10px] uppercase tracking-[0.22em]">Terminals</div>
              <div className="font-[var(--font-anton)] text-3xl leading-none mt-1">3 Locations</div>
              <div className="text-[10px] uppercase tracking-[0.22em] mt-1">IN · GA · DE</div>
            </div>
          </div>
        </div>
      </section>

      {/* §02 COMPANY DRIVERS */}
      <section
        id="company-drivers"
        className="relative bg-[var(--color-kopf-ink-2)] border-y border-white/[0.05] px-6 lg:px-10 py-24 md:py-32"
      >
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            chapter="02"
            eyebrow="Regional · OTR · Dedicated"
            title="Company Drivers"
          />

          <div className="mt-14 grid lg:grid-cols-2 gap-10">
            <div>
              <h3 className="kopf-eyebrow mb-4">§ Benefits for Company Drivers</h3>
              <p className="text-[var(--color-kopf-bone-muted)] text-base leading-relaxed mb-6">
                As a company driver for Kopf Logistics Group, you'll have access to CDL-A
                jobs that cover regional and over-the-road truck driving opportunities.
                These positions allow you to take advantage of the following benefits:
              </p>
              <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-3">
                {companyBenefits.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm">
                    <Check className="w-4 h-4 text-[var(--color-kopf-orange)] mt-1 shrink-0" strokeWidth={3} />
                    <span className="text-[var(--color-kopf-bone)]">{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[var(--color-kopf-ink)] border border-white/[0.08] p-8">
              <h3 className="kopf-eyebrow mb-4">§ Qualifications for Company Drivers</h3>
              <p className="text-[var(--color-kopf-bone-muted)] text-base leading-relaxed mb-6">
                Below are the requirements for qualifying as a company driver with Kopf
                Logistics Group:
              </p>
              <ul className="space-y-3">
                {qualifications.map((q, i) => (
                  <li key={q} className="flex items-start gap-4 border-t border-white/[0.08] pt-3 first:border-t-0 first:pt-0">
                    <span className="font-[var(--font-jetbrains)] text-xs tabular-nums text-[var(--color-kopf-orange)] min-w-[24px]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[var(--color-kopf-bone)]">{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Driver types band */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            {driverTypes.map((d, i) => (
              <div key={d.label} className="group relative border border-white/[0.08] bg-[var(--color-kopf-ink)] p-6 hover:border-[var(--color-kopf-orange)] transition flex flex-col items-center text-center">
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

      {/* §03 OWNER OPERATORS */}
      <section id="owner-operators" className="relative px-6 lg:px-10 py-24 md:py-32">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            chapter="03"
            eyebrow="Percentage of Gross Revenue"
            title={
              <>
                Owner<br />
                <span className="text-[var(--color-kopf-orange)]">Operators</span>
              </>
            }
            kicker="Owner operators are a vital part of Kopf Logistics Group's success, and we offer a competitive pay structure and comprehensive benefits to attract the best talent. As an owner-operator, you'll enjoy regular home time, a percentage of gross revenue pay, lanes with steady freight, and access to both solo and team driving opportunities. Kopf Logistics Group provides additional benefits like base plate finance programs, weekly settlements, permits, company-paid cargo and liability insurance, and a clean inspection bonus. We have truck terminals in Elkhart, IN; Athens, GA; and Seaford, DE and a mechanics shop at the main terminal in Elkhart, IN that performs DOT inspections."
          />

          <div className="mt-14 grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-[var(--color-kopf-ink-2)] border border-white/[0.08] p-8">
              <h3 className="kopf-eyebrow mb-4">§ Responsibilities</h3>
              <ul className="space-y-3">
                {ownerOperatorResponsibilities.map((r, i) => (
                  <li key={r} className="flex items-start gap-4 border-t border-white/[0.08] pt-3 first:border-t-0 first:pt-0">
                    <span className="font-[var(--font-jetbrains)] text-xs tabular-nums text-[var(--color-kopf-orange)] min-w-[24px]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[var(--color-kopf-bone)] text-sm">{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-1 bg-[var(--color-kopf-ink-2)] border border-white/[0.08] p-8">
              <h3 className="kopf-eyebrow mb-4">§ Qualifications</h3>
              <ul className="space-y-3">
                {qualifications.map((q, i) => (
                  <li key={q} className="flex items-start gap-4 border-t border-white/[0.08] pt-3 first:border-t-0 first:pt-0">
                    <span className="font-[var(--font-jetbrains)] text-xs tabular-nums text-[var(--color-kopf-orange)] min-w-[24px]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[var(--color-kopf-bone)] text-sm">{q}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-1 bg-[var(--color-kopf-orange)] p-8 text-[var(--color-kopf-ink)] relative overflow-hidden">
              <span aria-hidden="true" className="kopf-grain" />
              <h3 className="font-[var(--font-jetbrains)] text-[10px] uppercase tracking-[0.22em] mb-4 relative">
                § Benefits — 15 Items
              </h3>
              <ul className="space-y-2 relative">
                {ownerOperatorBenefits.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm">
                    <Check className="w-3.5 h-3.5 mt-1 shrink-0" strokeWidth={3} />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 pt-4 border-t border-black/20 relative font-[var(--font-jetbrains)] text-xs tracking-widest uppercase">
                Kopf Terminals: Elkhart IN · Athens GA · Seaford DE
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* §04 POWER ONLY SHIPPING */}
      <section className="relative bg-[var(--color-kopf-ink-2)] border-y border-white/[0.05] px-6 lg:px-10 py-24 md:py-28">
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            chapter="04"
            eyebrow="Surges · Short-Haul · Long-Haul"
            title="Power Only Shipping"
            kicker="Kopf Logistics Group's Power Only service provides qualified carriers, competitive rates, superior service and experienced team members and is ideal for surges, short-haul, long-haul, and round-trip opportunities. As a trusted broker with a solid history of personalized service, you can be confident in your choice to outsource your Power Only shipments to Kopf."
          />
        </div>
      </section>

      {/* §05 Regional / OTR / Truck Facts */}
      <section className="relative px-6 lg:px-10 py-24 md:py-32">
        <div className="max-w-7xl mx-auto grid gap-10 lg:grid-cols-3">
          <article className="border border-white/[0.08] bg-[var(--color-kopf-ink-2)] p-8">
            <span className="kopf-chapter">§ 05</span>
            <h3 className="mt-3 font-[var(--font-anton)] uppercase text-3xl leading-none tracking-tight text-[var(--color-kopf-bone)]">
              Regional Truck Driving Jobs
            </h3>
            <p className="mt-5 text-sm leading-relaxed text-[var(--color-kopf-bone-muted)]">
              Kopf Logistics Group's regional truck driving jobs are perfect for drivers
              who prefer to stay closer to home. These positions offer a balance between
              work and personal life, allowing drivers to maintain a consistent schedule
              while enjoying the benefits of a rewarding career in trucking. By focusing
              on specific regions, drivers can develop a deep understanding of their
              routes, leading to increased efficiency and job satisfaction.
            </p>
          </article>

          <article className="border border-white/[0.08] bg-[var(--color-kopf-ink-2)] p-8">
            <span className="kopf-chapter">§ 06</span>
            <h3 className="mt-3 font-[var(--font-anton)] uppercase text-3xl leading-none tracking-tight text-[var(--color-kopf-bone)]">
              Over the Road Truck Driving
            </h3>
            <p className="mt-5 text-sm leading-relaxed text-[var(--color-kopf-bone-muted)]">
              For those who love the open road and the spirit of adventure,
              over-the-road (OTR) truck driving jobs with Kopf Logistics Group are the
              perfect fit. OTR drivers get to travel across the country, experiencing
              the diverse landscapes and cultures the United States has to offer. These
              jobs often come with higher pay and access to more miles, but they also
              require a significant commitment to spending time away from home.
            </p>
          </article>

          <article className="border border-white/[0.08] bg-[var(--color-kopf-ink-2)] p-8">
            <span className="kopf-chapter">§ 07</span>
            <h3 className="mt-3 font-[var(--font-anton)] uppercase text-3xl leading-none tracking-tight text-[var(--color-kopf-bone)]">
              Truck Driver Facts & Insights
            </h3>
            <p className="mt-5 text-sm leading-relaxed text-[var(--color-kopf-bone-muted)]">
              The trucking industry contains fascinating facts and insights many may not
              know. To learn more about this exciting profession, check out our article
              on "Truck Driver Facts: Top 12 Things You Might Not Know" — which sheds
              light on the importance of truck drivers to the economy and the unique
              experiences and challenges drivers face on the road.
            </p>
          </article>
        </div>
      </section>

      {/* §08 TRUCK DRIVER BENEFITS summary */}
      <section className="relative bg-[var(--color-kopf-ink-2)] border-t border-white/[0.05] px-6 lg:px-10 py-24 md:py-32">
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            chapter="08"
            eyebrow="Why Our Drivers Stay"
            title="Truck Driver Benefits"
            kicker="At Kopf Logistics Group, we understand the importance of providing our drivers with an attractive benefits package to ensure a satisfying career experience. Our truck driver benefits include competitive pay, health and dental insurance, vacation and holiday pay, a rider program, and clean inspection bonuses. These benefits, combined with the support and resources provided by Kopf Logistics Group, provide an excellent opportunity for company drivers and owner operators to thrive in their careers."
          />
        </div>
      </section>

      {/* §09 JOIN US TODAY */}
      <section id="apply" className="relative px-6 lg:px-10 py-24 md:py-32">
        <div className="max-w-5xl mx-auto text-center">
          <SectionHeader
            chapter="09"
            eyebrow="CDL-A Careers"
            title="Join Us Today"
            kicker="Kopf Logistics Group's nationwide driving opportunities for company drivers and owner operators are ideal for those looking to advance their careers in the transportation industry. With diverse services and benefits and a commitment to safety and driver satisfaction, we stand out as a top choice for CDL-A jobs and trucking opportunities. Joining Kopf Logistics Group means becoming part of a team that values your skills, experience, and dedication. Whether you're a company driver or an owner operator, you can expect a rewarding career with a company prioritizing your success and well-being. So take the next step in your trucking career and explore the exciting opportunities at Kopf Logistics Group."
            align="center"
          />
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button
              href="https://kopflogisticsgroup.com/drivers/#apply"
              external
              variant="solid"
            >
              Apply Now
            </Button>
            <Button href="/contact">Talk to Recruiting</Button>
          </div>
          <div className="mt-8 flex justify-center">
            <PhoneEmailBlock align="center" />
          </div>
        </div>
      </section>
    </>
  );
}
