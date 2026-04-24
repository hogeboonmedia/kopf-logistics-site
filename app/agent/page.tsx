import type { Metadata } from "next";
import Script from "next/script";
import Image from "next/image";
import Button from "@/components/ui/Button";
import SectionHeader from "@/components/ui/SectionHeader";
import PhoneEmailBlock from "@/components/ui/PhoneEmailBlock";
import VideoEmbed from "@/components/ui/VideoEmbed";
import { Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Independent Freight Agents",
  description:
    "Join Kopf's Freight Agent Program for unmatched support and financial freedom in logistics. Gain expertise, weekly pay, and low fees for success in your agency.",
  alternates: { canonical: "/agent" },
};

const toolsList = [
  "$100K Property Bond",
  "Excellent Credit with Shippers, Carriers and Factoring Companies",
  "TMS and Carrier On-boarding, Including EDI",
  "Customer Relationship Management Platform",
  "PC Miler Mileage Software",
  "Internet Truckstop and DAT Solutions Load and Truck Searching",
  "T-chek and Comdata Payment Services",
  "Macropoint Load Tracking",
  "SaferWatch Carrier Insurance and Safety Monitoring",
  "MyCarrierPackets for On-boarding Carriers",
  "Ansonia Credit Data Services and Compunet",
  "Technology Training",
  "Promotional Materials",
  "Daily Backup of Global Database/Disaster Recovery Plan",
];

const savingsList = [
  "Contingent Auto Insurance",
  "Contingent Cargo Liability Insurance",
  "Broker Bond",
  "Electronic Services and Tools",
  "TMS Software",
  "Accounting Services",
  "Customer Credit Approval",
  "Carrier On-boarding",
  "Cargo Claims Administration",
  "Promotional Materials",
];

const requirements = [
  "A Computer with High-Speed Internet Access",
  "Copy of State Domiciled Business Registration (an LLC or Inc)",
  "Federal Tax Identification Number",
  "Microsoft Office Products",
  "Established Book of Business Subject to Approval",
];

const faqs = [
  {
    q: "What is an Independent Freight Agent?",
    a: "An Independent Freight Agent is a professional who works as an intermediary between shippers and carriers to arrange transportation services. They act as an independent contractor and are not secured by a specific freight company. Independent Freight Agents work to negotiate rates, book shipments, and manage logistics on behalf of their clients. They may specialize in specific types of freight or transportation modes, such as air, land, or sea. To become an Independent Freight Agent, individuals typically need to gain industry experience and establish a client base.",
  },
  {
    q: "How do freight agents make money?",
    a: "Freight agents make money by earning commissions on the shipping services they arrange. The commission is typically a percentage of the gross profit margin. The commission rate can vary depending on the type of freight, the mode of shipping, and the relationship between the freight agent and the carrier. Freight agents may also charge additional fees for their services, such as handling fees or document preparation fees, or securing and marking up high-value cargo insurance.",
  },
  {
    q: "What is the difference between a freight broker and a freight agent?",
    a: "The key difference lies in their responsibilities: Freight Brokers operate their own businesses and contract with freight agents to arrange transportation shipments under the freight broker's FMCSA brokerage authority. Freight brokers are responsible for obtaining the necessary licenses and insurance, providing TMS software and business office support to freight agents managing the logistics of the shipping services. Freight Agents, on the other hand, work as independent contractors and are responsible for finding clients and arranging shipping services.",
  },
  {
    q: "What do freight agents do?",
    a: "Freight agents work as intermediaries between shippers and carriers to arrange logistics services. They negotiate rates, book shipments, and manage logistics on behalf of their clients. Freight agents work to find the best carrier and cost-effective mode of transportation for their client's needs. Freight agents may specialize in specific types of freight, such as temperature-controlled, dry goods, less-than-truckload, expedited, hazmat, or heavy haul/over-dimensional. Freight agents may also specialize in specific modes of transportation, such as air, land, or sea. Freight agents are responsible for ensuring services meet their client's requirements and are delivered on time and within budget.",
  },
  {
    q: "How do I become an Independent Freight Agent?",
    a: "Becoming an Independent Freight Agent involves completing some essential steps, including gaining relevant experience and building a strong network of clients. Here are the basic steps: (1) Gain Industry Experience — start by learning about the transportation industry and the different types of freight shipping; consider working for a freight brokerage or carrier to gain applicable knowledge and experience. (2) Build A Client Base — develop relationships with shippers and carriers to establish a network of contacts. (3) Establish Your Business — once you have a client base, you can set up your business as an Independent Freight Agent. This will involve setting up your office and developing a marketing plan. (4) Find A Broker — find an established, financially sound freight broker, such as Kopf, to contract with to move your freight.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function AgentPage() {
  return (
    <>
      <Script
        id="agent-faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* HERO */}
      <section className="relative overflow-hidden isolate">
        <Image
          src="/pexels/agent_at_desk.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center -z-20 opacity-50"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-br from-[var(--color-kopf-ink)] via-[var(--color-kopf-ink)]/95 to-[var(--color-kopf-ink-2)]" />

        <div className="relative px-6 lg:px-10 pt-20 pb-24 md:pt-28 md:pb-32 max-w-7xl grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
          <div>
            <div className="flex items-center gap-3 mb-6 kopf-fade-up">
              <span className="kopf-chapter">§ Agents</span>
              <span className="h-px w-10 bg-[var(--color-kopf-orange)]" />
              <span className="kopf-eyebrow">Up to 70/30 Commission Split</span>
            </div>

            <h1 className="font-[var(--font-anton)] uppercase leading-[0.9] tracking-tight text-[var(--color-kopf-bone)] text-[10vw] sm:text-6xl md:text-7xl lg:text-[6rem] kopf-fade-up kopf-fade-up-delay-1">
              Independent<br />
              <span className="text-[var(--color-kopf-orange)]">Freight Agents</span>
            </h1>

            <p className="mt-8 max-w-2xl text-base md:text-lg leading-relaxed text-[var(--color-kopf-bone-muted)] kopf-fade-up kopf-fade-up-delay-2">
              Kopf Logistics Group understands starting your own independent freight
              agency can be complicated and competitive. If you're looking for
              independence and an opportunity to own your business, you owe it to
              yourself to consider Kopf Logistics Group. As an established logistics
              provider, we equip you with the support, expertise and financial backing
              you need to succeed.
            </p>

            <div className="mt-10 flex flex-wrap items-start gap-8 kopf-fade-up kopf-fade-up-delay-3">
              <div>
                <span className="block kopf-eyebrow mb-3">Get Started Today!</span>
                <PhoneEmailBlock />
              </div>
              <div className="flex gap-3 pt-5">
                <Button href="#apply" variant="solid">Apply Now</Button>
              </div>
            </div>
          </div>

          <div className="kopf-fade-up kopf-fade-up-delay-2">
            <VideoEmbed
              youTubeId="KuJq8F-uSkM"
              title="What does an Independent Freight Agent do?"
            />
          </div>
        </div>
        <div className="tread-divider" aria-hidden="true" />
      </section>

      {/* §01 About the program */}
      <section className="relative px-6 lg:px-10 py-24 md:py-32">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <SectionHeader
              chapter="01"
              eyebrow="Your Primary Role"
              title={
                <>
                  About Our Independent<br />
                  <span className="text-[var(--color-kopf-orange)]">Freight Agent Program</span>
                </>
              }
            />
          </div>
          <div className="lg:col-span-7 space-y-6 text-[var(--color-kopf-bone-muted)] text-base md:text-lg leading-relaxed">
            <p>
              If you are looking for the best freight agent program, Kopf Logistics
              Group is the place for you. Your primary role as an Independent Freight
              Agent will be to build long-term relationships with shippers and contract
              carriers and arrange transportation services. You will be responsible for
              sourcing contract carriers, negotiating rates, scheduling freight and
              solving problems quickly and effectively.
            </p>
            <p>
              Your ability to find innovative solutions, negotiate deals and manage
              day-to-day challenges means financial freedom and a life well-lived. With
              your knowledge and experience of the transportation brokerage industry
              and our TMS technology and business office support, you'll be on your way
              to independence and financial security. Join Team Kopf and we'll help you
              grow your freight agent business.
            </p>
          </div>
        </div>
      </section>

      {/* §02 Opportunities */}
      <section className="relative bg-[var(--color-kopf-ink-2)] border-y border-white/[0.05] px-6 lg:px-10 py-24 md:py-32">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6 text-[var(--color-kopf-bone-muted)] text-base md:text-lg leading-relaxed">
            <SectionHeader
              chapter="02"
              eyebrow="Relationship-Driven"
              title="Independent Freight Agent Opportunities"
            />
            <p>
              Kopf Logistics Group specializes in fostering Independent Freight Agent
              Opportunities, where your success is our priority. Our leadership team is
              committed to a relationship-driven approach, ensuring you receive the
              dedicated support and attention your business deserves. In an environment
              enriched by our sound financial strength and a culture of continuous
              improvement, we offer more than just a job – we offer a pathway to
              unlimited earning potential. As an Independent Freight Agent with us,
              you'll benefit from our reputation for success and our unwavering
              devotion to service excellence. This is the Kopf difference.
            </p>
            <p>
              With over 300 years combined industry experience, we are growing our
              freight brokerage agency nationwide. We offer up to a 70/30 commission
              split with qualified candidates and weekly commission settlement paid
              upon billing with clean paperwork.
            </p>
          </div>
          <div className="lg:col-span-5">
            <div className="bg-[var(--color-kopf-orange)] aspect-square p-10 grid place-items-center text-center relative overflow-hidden">
              <span aria-hidden="true" className="kopf-grain" />
              <div className="relative">
                <span className="block font-[var(--font-anton)] text-[22vw] lg:text-[10rem] leading-none text-[var(--color-kopf-ink)]">
                  70/30
                </span>
                <span className="block -mt-4 font-[var(--font-anton)] text-2xl md:text-3xl uppercase text-[var(--color-kopf-ink)] tracking-tight">
                  Commission Split
                </span>
                <span className="block mt-4 font-[var(--font-jetbrains)] text-xs uppercase tracking-[0.22em] text-[var(--color-kopf-ink)]/80">
                  With Qualified Candidates
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* §03 Tools to accelerate success */}
      <section className="relative px-6 lg:px-10 py-24 md:py-32">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            chapter="03"
            eyebrow="14 Tools · Zero Startup Fees"
            title={
              <>
                Tools to<br />
                <span className="text-[var(--color-kopf-orange)]">Accelerate Success</span>
              </>
            }
            kicker="We provide you these necessary tools to accelerate your success:"
          />
          <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {toolsList.map((t, i) => (
              <li
                key={t}
                className="group flex items-start gap-4 border-t border-white/[0.08] pt-4 hover:border-[var(--color-kopf-orange)] transition"
              >
                <span className="font-[var(--font-jetbrains)] text-xs tabular-nums text-[var(--color-kopf-concrete)] group-hover:text-[var(--color-kopf-orange)] min-w-[28px]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[var(--color-kopf-bone)] text-sm leading-snug">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* §04 Savings */}
      <section className="relative bg-[var(--color-kopf-ink-2)] border-y border-white/[0.05] px-6 lg:px-10 py-24 md:py-32">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            chapter="04"
            eyebrow="10 Built-in Services"
            title="Savings You Can Count On"
            kicker="Kopf provides cost and time savings to its Independent Freight Agents by providing the following, bringing more profits to your bottom line:"
          />
          <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {savingsList.map((s, i) => (
              <li
                key={s}
                className="group border border-white/[0.08] bg-[var(--color-kopf-ink)] p-5 hover:border-[var(--color-kopf-orange)] transition flex flex-col"
              >
                <span className="font-[var(--font-jetbrains)] text-xs tabular-nums text-[var(--color-kopf-concrete)] group-hover:text-[var(--color-kopf-orange)] transition">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="mt-3 text-[var(--color-kopf-bone)] font-[var(--font-anton)] uppercase leading-tight tracking-tight">
                  {s}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* §05 Requirements */}
      <section className="relative px-6 lg:px-10 py-24 md:py-32">
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            chapter="05"
            eyebrow="To Apply"
            title="Independent Freight Agent Requirements"
          />

          <div className="mt-14">
            <h3 className="kopf-eyebrow mb-5">§ You Will Need</h3>
            <ul className="space-y-4">
              {requirements.map((r, i) => (
                <li key={r} className="flex items-start gap-4 border-t border-white/[0.08] pt-4">
                  <span className="font-[var(--font-jetbrains)] text-xs tabular-nums text-[var(--color-kopf-orange)] min-w-[28px]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[var(--color-kopf-bone)] text-base md:text-lg">{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* §06 FAQ */}
      <section className="relative bg-[var(--color-kopf-ink-2)] border-y border-white/[0.05] px-6 lg:px-10 py-24 md:py-32">
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            chapter="06"
            eyebrow="5 Common Questions"
            title="Frequently Asked Questions"
          />
          <div className="mt-14 space-y-5">
            {faqs.map((f, i) => (
              <details
                key={f.q}
                className="group border border-white/[0.08] bg-[var(--color-kopf-ink)] p-6 hover:border-[var(--color-kopf-orange)]/60 transition"
              >
                <summary className="flex items-start justify-between gap-6 cursor-pointer list-none">
                  <span className="flex items-start gap-5">
                    <span className="font-[var(--font-jetbrains)] text-xs tabular-nums text-[var(--color-kopf-orange)] mt-1">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-[var(--font-anton)] uppercase text-xl md:text-2xl tracking-tight text-[var(--color-kopf-bone)] leading-tight">
                      {f.q}
                    </span>
                  </span>
                  <span className="font-[var(--font-jetbrains)] text-xl text-[var(--color-kopf-orange)] group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <p className="mt-5 text-[var(--color-kopf-bone-muted)] leading-relaxed pl-[calc(28px+20px)]">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* §07 APPLY */}
      <section id="apply" className="relative px-6 lg:px-10 py-24 md:py-32">
        <div className="max-w-5xl mx-auto text-center">
          <SectionHeader
            chapter="07"
            eyebrow="Confidential · Weekly Pay"
            title="Apply Now"
            kicker="The information obtained from this questionnaire is kept strictly confidential and will not be shared. Weekly commission settlement paid upon billing with clean paperwork."
            align="center"
          />

          <div className="mt-10 inline-flex flex-col gap-6 items-center">
            <PhoneEmailBlock align="center" />
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                href="https://kopflogisticsgroup.com/agent/#apply"
                external
                variant="solid"
              >
                Start Agent Application
              </Button>
              <Button href="/contact">Contact Recruiting</Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
