import type { Metadata } from "next";
import Image from "next/image";
import Button from "@/components/ui/Button";
import SectionHeader from "@/components/ui/SectionHeader";
import PhoneEmailBlock from "@/components/ui/PhoneEmailBlock";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Since 1966, Kopf Logistics Group has delivered reliable trucking and logistics services, driven by a legacy of integrity and a commitment to customer success.",
  alternates: { canonical: "/about" },
};

const values = [
  {
    title: "We are true to our word.",
    body: "We do what we say we will do and consider it a matter of integrity.",
  },
  {
    title: "We own our mistakes.",
    body: "We are not embarrassed by them but learn from them and move forward with the confidence we will not repeat them.",
  },
  {
    title: "We accomplish BIG things with a small team",
    body: "by valuing the contributions and capabilities of each team member.",
  },
  {
    title: "We are frugal.",
    body: "We guard the company's resources with the same watchfulness we would use to guard our own personal resources.",
  },
  {
    title: "We embrace a results-oriented culture",
    body: "that drives accountability, profitability, and growth.",
  },
  {
    title: "We respect every team member",
    body: "and believe when respected and appreciated they will give their very best.",
  },
];

const timeline = [
  { year: "1966", event: "Kenny Kopf secures a job as a cross country truck driver." },
  {
    year: "1988",
    event:
      "Leroy Kopf graduates Calvin College and moves with his wife Vickie to Athens, Georgia to work at the company's second location.",
  },
  {
    year: "1994",
    event:
      "Leroy and Vickie return to Indiana; Leroy assumes a leadership role at Kopf headquarters.",
  },
  {
    year: "2008",
    event:
      "After many years working with his father, Leroy and Vickie purchase the family business.",
  },
  {
    year: "2011",
    event: "Kopf adds its brokerage division — the company continues to grow and thrive.",
  },
  {
    year: "Today",
    event:
      "Three terminals (Elkhart IN · Athens GA · Seaford DE) and independent freight agents nationwide.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden isolate">
        <Image
          src="/pexels/highway_timeline.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center -z-20 opacity-55"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-br from-[var(--color-kopf-ink)] via-[var(--color-kopf-ink)]/95 to-[var(--color-kopf-ink-2)]" />

        <div className="relative px-6 lg:px-10 pt-20 pb-20 md:pt-28 md:pb-24 max-w-6xl">
          <div className="flex items-center gap-3 mb-6 kopf-fade-up">
            <span className="kopf-chapter">§ About</span>
            <span className="h-px w-10 bg-[var(--color-kopf-orange)]" />
            <span className="kopf-eyebrow">Family-Owned Since 1966</span>
          </div>

          <h1 className="font-[var(--font-anton)] uppercase leading-[0.85] tracking-tight text-[var(--color-kopf-bone)] text-[12vw] sm:text-7xl md:text-8xl lg:text-[9rem] kopf-fade-up kopf-fade-up-delay-1">
            Kopf Logistics<br />
            <span className="text-[var(--color-kopf-orange)]">Group</span>
          </h1>

          <div className="mt-8 max-w-2xl kopf-fade-up kopf-fade-up-delay-2">
            <PhoneEmailBlock />
          </div>
        </div>
        <div className="tread-divider" aria-hidden="true" />
      </section>

      {/* §01 A MAN AND HIS TRUCK */}
      <section className="relative px-6 lg:px-10 py-24 md:py-32">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5">
            <SectionHeader
              chapter="01"
              eyebrow="The Origin"
              title={
                <>
                  A Man and<br />
                  <span style={{ color: "var(--accent)" }}>His Truck</span>
                </>
              }
            />
            <div className="mt-8 space-y-6 text-base md:text-lg leading-relaxed" style={{ color: "var(--text-muted)" }}>
              <p className="text-2xl md:text-3xl font-[var(--font-anton)] uppercase leading-tight" style={{ color: "var(--text)" }}>
                It all started in 1966, when Kenny Kopf secured a job as a cross country
                truck driver.
              </p>
              <p>
                After fourteen years of hard work, a love for the industry and the hope of
                a better life for his family, he set out to change his destiny.
              </p>
            </div>
          </div>
          <div className="lg:col-span-7">
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src="/pexels/truck_sunset_alt.jpg"
                alt="Semi truck driving at sunset — the Kopf story"
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover"
              />
              <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
                <span className="kopf-eyebrow" style={{ color: "var(--on-accent)" }}>Since</span>
                <span className="font-[var(--font-anton)] text-5xl md:text-7xl leading-none" style={{ color: "var(--on-accent)", textShadow: "0 2px 20px rgba(0,0,0,0.6)" }}>
                  1966
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* §02 MISSION */}
      <section className="relative bg-[var(--color-kopf-ink-2)] border-y border-white/[0.05] px-6 lg:px-10 py-24 md:py-32">
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            chapter="02"
            eyebrow="Why We Exist"
            title="Our Mission"
          />
          <p className="mt-10 text-[var(--color-kopf-bone)] text-xl md:text-2xl leading-relaxed max-w-4xl font-[var(--font-anton)] uppercase tracking-tight">
            Our mission is to establish ourselves as an outstanding logistics service
            provider by delivering consistent value and dependability to each of our
            customers.
          </p>
          <p className="mt-6 text-[var(--color-kopf-bone-muted)] text-base md:text-lg leading-relaxed max-w-4xl">
            Our desire is to create success for our customers through efficient and
            reliable shipments, distribution services, and expertise in the supply chain.
          </p>
        </div>
      </section>

      {/* §03 OUR COMPANY / TIMELINE */}
      <section className="relative px-6 lg:px-10 py-24 md:py-32">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            chapter="03"
            eyebrow="A Family Operation"
            title="Our Company"
          />

          <div className="mt-12 grid lg:grid-cols-[1fr_1.2fr] gap-10 items-start">
            <div className="space-y-6 text-[var(--color-kopf-bone-muted)] text-base md:text-lg leading-relaxed">
              <p>
                As a young teen Leroy, Kenny's son, began working in the mechanics shop
                repairing trucks and performing various other duties for Kopf Trucking.
                It was there his love for logistics was born. His involvement in the
                business grew and in 1988, after graduating from Calvin College, he and
                his wife Vickie moved to Georgia to continue his work at the company's
                Athens, Georgia location where he performed additional duties for Kopf
                Logistics.
              </p>
              <div className="border-l-4 border-[var(--color-kopf-orange)] pl-5 py-1">
                <h3 className="font-[var(--font-anton)] uppercase tracking-tight text-2xl leading-tight text-[var(--color-kopf-bone)]">
                  A Family Operation
                </h3>
                <p className="mt-2">
                  Six years later, Leroy and Vickie returned to Indiana where Leroy
                  assumed a leadership role at Kopf headquarters. In 2008, after many
                  years of working with his father, Leroy and Vickie purchased the
                  family business. As the president of the company, Leroy is dedicated
                  to its success, focusing on technology, customers, and providing
                  top-notch logistics and transportation services.
                </p>
              </div>
              <div className="border-l-4 border-[var(--color-kopf-orange)] pl-5 py-1">
                <h3 className="font-[var(--font-anton)] uppercase tracking-tight text-2xl leading-tight text-[var(--color-kopf-bone)]">
                  Firm Roots — Continuing Growth
                </h3>
                <p className="mt-2">
                  With the addition of our brokerage division in 2011, the company
                  continues to grow and thrive. Leroy's strong leadership, vast
                  knowledge of the industry, and commitment to a value-based culture
                  have propelled our company forward. Together we are creating a
                  stronger future by putting people first in everything we do. We focus
                  on providing the best tools and accessibility to our customers,
                  ensuring their shipments reach their various locations. Thanks to our
                  humble beginnings, business acumen, and company values, our
                  independent freight agents offer many benefits to our customers.
                </p>
              </div>
              <div className="border-l-4 border-[var(--color-kopf-orange)] pl-5 py-1">
                <h3 className="font-[var(--font-anton)] uppercase tracking-tight text-2xl leading-tight text-[var(--color-kopf-bone)]">
                  Opportunities Abound
                </h3>
                <p className="mt-2">
                  Our company is a place where opportunities abound, where dreams become
                  reality and where we never stop learning. Our discoveries over the
                  past fifty years have taught us well and our humble beginnings
                  continue to inspire us. We will always remember, it all started with
                  one man and his truck.
                </p>
              </div>
            </div>

            {/* Timeline ruler */}
            <div className="relative">
              <ol className="space-y-0 border-l-2 border-[var(--color-kopf-orange)]/40 pl-8">
                {timeline.map((t, i) => (
                  <li key={i} className="relative pb-10 last:pb-0">
                    <span className="absolute -left-[41px] top-0.5 w-4 h-4 bg-[var(--color-kopf-orange)] border-4 border-[var(--color-kopf-ink)]" />
                    <div className="font-[var(--font-anton)] uppercase text-3xl md:text-4xl text-[var(--color-kopf-bone)] tracking-tight leading-none">
                      {t.year}
                    </div>
                    <p className="mt-2 text-[var(--color-kopf-bone-muted)] text-sm md:text-base leading-relaxed">
                      {t.event}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* §04 LEROY'S LETTER */}
      <section className="relative bg-[var(--color-kopf-ink-2)] border-y border-white/[0.05] px-6 lg:px-10 py-24 md:py-32">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <span className="kopf-chapter">§ 04</span>
            <span className="h-px w-10 bg-[var(--color-kopf-orange)]" />
            <span className="kopf-eyebrow">A Note From The President</span>
          </div>

          <div className="mb-8">
            <Image
              src="/kopf-original/images/letter_title.png"
              alt="A letter from our president"
              width={385}
              height={53}
              className="h-10 w-auto theme-icon opacity-90"
            />
          </div>

          <div className="space-y-6 text-[var(--color-kopf-bone-muted)] text-base md:text-lg leading-relaxed">
            <p>
              A rich legacy, strong guiding principles, and an enduring commitment to
              drive results in a way that is responsible, right-minded, and honorable
              have provided the foundation on which our company is built. Our values
              guide our steps and are the framework for all corporate planning and
              decision-making. Integrity, personal accountability, and humility
              determine our behaviors and have created a dynamic culture where ideas
              are born, and people flourish.
            </p>
            <p>
              We start each day with a passion for making a lasting, positive difference
              in the lives of the people we touch and create an environment where
              everyone can succeed. We care about each other, respect each other, learn
              from each other, and are honest and truthful in our dealings with each
              other. We are true to our word and live up to our commitments. The way
              we conduct our business is as important as the business we do. We build
              trust by listening and following through and believe the relationships
              we develop are as vital to our success in business as they are in our
              lives.
            </p>
            <p>
              As we look to the future, we will continue to begin each day with clarity
              of purpose and a sense of mission, living up to the values on which our
              company was founded. Our heritage is rich, our beliefs strong, and our
              vision great. It is an incredible honor to lead and serve.
            </p>
          </div>

          <div className="mt-10 flex items-center gap-6 pt-8 border-t border-white/[0.08]">
            <Image
              src="/kopf-original/images/leroy_sig.png"
              alt="Leroy Kopf signature"
              width={152}
              height={104}
              className="h-14 w-auto theme-icon opacity-95"
            />
            <div>
              <div className="font-[var(--font-anton)] uppercase text-xl leading-none text-[var(--color-kopf-bone)]">
                Leroy Kopf
              </div>
              <div className="font-[var(--font-jetbrains)] text-xs uppercase tracking-[0.22em] mt-1 text-[var(--color-kopf-concrete)]">
                President
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* §05 VALUES */}
      <section className="relative px-6 lg:px-10 py-24 md:py-32">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            chapter="05"
            eyebrow="Six Guiding Principles"
            title={
              <>
                Our Most Important<br />
                <span className="text-[var(--color-kopf-orange)]">Values</span>
              </>
            }
          />
          <ul className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {values.map((v, i) => (
              <li
                key={v.title}
                className="group border border-white/[0.08] bg-[var(--color-kopf-ink-2)] p-7 hover:border-[var(--color-kopf-orange)]/60 transition"
              >
                <span className="font-[var(--font-jetbrains)] text-xs tabular-nums text-[var(--color-kopf-concrete)] group-hover:text-[var(--color-kopf-orange)] transition">
                  0{i + 1}
                </span>
                <h3 className="mt-3 font-[var(--font-anton)] uppercase text-2xl leading-tight tracking-tight text-[var(--color-kopf-bone)]">
                  {v.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--color-kopf-bone-muted)]">
                  {v.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* §06 HIGHER PURPOSE */}
      <section className="relative overflow-hidden isolate">
        <Image
          src="/kopf-original/images/home_bg_quote2.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center -z-20 opacity-25"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-br from-[var(--color-kopf-ink)] via-[var(--color-kopf-ink)]/95 to-[var(--color-kopf-ink-2)]" />

        <div className="px-6 lg:px-10 py-24 md:py-36 max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <span className="kopf-chapter">§ 06</span>
            <span className="h-px w-10 bg-[var(--color-kopf-orange)]" />
            <span className="kopf-eyebrow">A Family of Faith</span>
          </div>

          <h2 className="font-[var(--font-anton)] uppercase text-5xl md:text-7xl lg:text-8xl leading-none tracking-tight">
            Our Higher <span className="text-[var(--color-kopf-orange)]">Purpose</span>
          </h2>

          <blockquote className="mt-10 border-l-4 border-[var(--color-kopf-orange)] pl-6 max-w-3xl">
            <p className="kopf-accent-italic text-3xl md:text-5xl text-[var(--color-kopf-bone)] leading-snug">
              "Give them something to eat."
            </p>
            <footer className="mt-3 font-[var(--font-jetbrains)] text-xs tracking-[0.3em] uppercase text-[var(--color-kopf-orange)]">
              — Luke 9:13
            </footer>
          </blockquote>

          <div className="mt-10 space-y-6 text-[var(--color-kopf-bone-muted)] text-base md:text-lg leading-relaxed max-w-3xl">
            <p>
              Finding deep meaning and fulfillment in life starts with a clear sense of
              purpose. The understanding there is something to strive for bigger than
              self broadens our vision and challenges us to make a difference in the
              lives of others. Fulfillment is found when we step out of our comfort
              zone and care enough to become involved in our community and world.
            </p>
            <p>
              As a family of faith, we have been blessed with a clear sense of purpose,
              to feed people. Millions of people go to bed at night wondering where
              their next meal will come from. Hunger, food insecurity, and poverty
              affects people of all walks of life. At Kopf, we are grateful for a
              unique opportunity to share our love for Jesus with others through the
              giving of food, the gift that provides nourishment for people to
              flourish and thrive.
            </p>
          </div>

          <blockquote className="mt-10 border-l-4 border-[var(--color-kopf-orange)] pl-6 max-w-3xl">
            <p className="kopf-accent-italic text-2xl md:text-3xl text-[var(--color-kopf-bone)] leading-snug">
              "If you can't feed a hundred people then feed just one."
            </p>
            <footer className="mt-3 font-[var(--font-jetbrains)] text-xs tracking-[0.3em] uppercase text-[var(--color-kopf-orange)]">
              — Mother Teresa
            </footer>
          </blockquote>

          <p className="mt-10 text-[var(--color-kopf-bone-muted)] text-base md:text-lg leading-relaxed max-w-3xl">
            Becoming engaged in our community and volunteering in meaningful ways has
            strengthened our family and company. We are honored to partner with area
            food banks and other organizations as part of our commitment to fulfill our
            Higher Purpose. Each day represents a fresh opportunity to share our vision,
            and we are enriched as we work together to end hunger. Without a Higher
            Purpose, we lack direction; but, discovering it unlocks our true potential.
            It brings us together and sets us apart. Our faith moves us! Together we
            fight hunger and give hope to those in need.
          </p>

          <p className="mt-10 font-[var(--font-anton)] uppercase text-3xl md:text-5xl leading-tight tracking-tight text-[var(--color-kopf-orange)]">
            Fighting Hunger · Feeding People · Bringing Hope
          </p>
        </div>
      </section>

      {/* §07 LOGISTICS SERVICE PROVIDER */}
      <section className="relative bg-[var(--color-kopf-ink-2)] border-t border-white/[0.05] px-6 lg:px-10 py-24 md:py-32">
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            chapter="07"
            eyebrow="Service as a Discipline"
            title="Logistics Service Provider"
            kicker="To meet the specific needs of our customers, we have expanded our locations and can match the right shipment service to each customer's unique requirements. We are constantly adapting and innovating to overcome challenges and thrive in an ever-changing industry. Our distribution and shipping services, combined with our impressive fleet, enhance efficiency and speed for our clients. We offer reliable, world-class trucking and transportation services while maintaining a focus on timely delivery and cost-effective solutions."
          />
          <p className="mt-8 text-[var(--color-kopf-bone-muted)] text-base md:text-lg leading-relaxed max-w-4xl">
            Our LinkedIn, Facebook, and Instagram presence has allowed us to connect
            with other companies and industry professionals, further showcasing our
            dedication to excellence and the difference we bring to the logistics and
            freight management sector. We are proud to deliver jobs, support local
            economies, and optimize the capacity of our carriers by partnering with
            them to provide affordable and reliable solutions. Our commitment to
            excellence has made us a leader in the industry, and we continue to strive
            for continuous improvement in our processes and services.
          </p>
          <div className="mt-10">
            <Button href="/contact" variant="solid">Contact Us</Button>
          </div>
        </div>
      </section>
    </>
  );
}
