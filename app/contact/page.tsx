import type { Metadata } from "next";
import Button from "@/components/ui/Button";
import SectionHeader from "@/components/ui/SectionHeader";
import PhoneEmailBlock from "@/components/ui/PhoneEmailBlock";
import ContactForm from "@/components/sections/ContactForm";
import { MapPin, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Kopf Logistics Group. Three terminals — Elkhart IN · Athens GA · Seaford DE. T: 574.349.5600 · E: recruiter@kopflogisticsgroup.com",
  alternates: { canonical: "/contact" },
};

const keyContacts = [
  {
    region: "Indiana",
    people: [
      { name: "Greg Taylor", title: "Freight Coordinator", city: "Elkhart, Indiana", phone: "574.971.8689" },
      { name: "Tom Stanfill", title: "Freight Coordinator", city: "Elkhart, Indiana", phone: "574.971.8689" },
    ],
  },
  {
    region: "Operations",
    people: [
      { name: "Howard Smith", title: "Operations Manager", city: "Elkhart, Indiana", phone: "574.971.8182" },
      { name: "Jeanie Northcutt", title: "Director of Recruiting", city: "Athens, Georgia", phone: "574.349.5600" },
    ],
  },
];

const terminals = [
  {
    city: "Elkhart, Indiana",
    address: ["2311 Toledo Road", "Elkhart, Indiana 46516"],
    phone: "574.971.8689",
    mapEmbed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2980.0829017909637!2d-85.92794868456525!3d41.67555297923882!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8816e81c709eb109%3A0x13de7f923c364d6e!2s2311%20Toledo%20Rd%2C%20Elkhart%2C%20IN%2046516!5e0!3m2!1sen!2sus!4v1625781262802!5m2!1sen!2sus",
    directions: "https://www.google.com/maps/place/2311+Toledo+Rd,+Elkhart,+IN+46516",
    badge: "HQ",
  },
  {
    city: "Athens, Georgia",
    address: ["145 Newton Bridge Industrial Way", "Athens, Georgia 30601"],
    phone: "574.971.8689",
    mapEmbed:
      "https://www.google.com/maps?q=145+Newton+Bridge+Industrial+Way,+Athens,+GA+30601&output=embed",
    directions: "https://www.google.com/maps/place/145+Newton+Bridge+Rd,+Athens,+GA+30601",
    badge: "Southeast",
  },
  {
    city: "Seaford, Delaware",
    address: ["8589 Hearns Pond Rd", "Seaford, Delaware 19973"],
    phone: "302.629.4255",
    mapEmbed:
      "https://www.google.com/maps?q=8589+Hearns+Pond+Rd,+Seaford,+DE+19973&output=embed",
    directions: "https://www.google.com/maps/place/8589+Hearns+Pond+Rd,+Seaford,+DE+19973",
    badge: "Northeast",
  },
];

export default function ContactPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden isolate">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-br from-[var(--color-kopf-ink)] via-[var(--color-kopf-ink)]/95 to-[var(--color-kopf-ink-2)]" />

        <div className="relative px-6 lg:px-10 pt-20 pb-16 md:pt-28 md:pb-20 max-w-6xl">
          <div className="flex items-center gap-3 mb-6 kopf-fade-up">
            <span className="kopf-chapter">§ Contact</span>
            <span className="h-px w-10 bg-[var(--color-kopf-orange)]" />
            <span className="kopf-eyebrow">Three Terminals · Two Mission</span>
          </div>

          <h1 className="font-[var(--font-anton)] uppercase leading-[0.9] tracking-tight text-[var(--color-kopf-bone)] text-[14vw] sm:text-7xl md:text-8xl lg:text-[9rem] kopf-fade-up kopf-fade-up-delay-1">
            Get in <span className="text-[var(--color-kopf-orange)]">Touch</span>
          </h1>

          <p className="mt-8 max-w-2xl text-base md:text-lg leading-relaxed text-[var(--color-kopf-bone-muted)] kopf-fade-up kopf-fade-up-delay-2">
            We deliver outstanding logistics services and consistent value and
            dependability to each of our customers.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-8 kopf-fade-up kopf-fade-up-delay-3">
            <PhoneEmailBlock />
            <Button href="/about">About Us</Button>
          </div>
        </div>
        <div className="tread-divider" aria-hidden="true" />
      </section>

      {/* §01 KEY CONTACTS */}
      <section className="relative px-6 lg:px-10 py-20 md:py-28">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            chapter="01"
            eyebrow="Meet the People"
            title="Key Contacts"
          />

          <div className="mt-14 grid gap-10 lg:grid-cols-2">
            {keyContacts.map((group) => (
              <div key={group.region}>
                <h3 className="kopf-eyebrow mb-5">§ {group.region}</h3>
                <ul className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
                  {group.people.map((p) => (
                    <li key={p.name + p.phone} className="grid grid-cols-[1fr_auto] gap-6 items-baseline py-5">
                      <div>
                        <div className="font-[var(--font-anton)] uppercase text-2xl leading-none text-[var(--color-kopf-bone)] tracking-tight">
                          {p.name}
                        </div>
                        <div className="mt-1 font-[var(--font-jetbrains)] text-[11px] uppercase tracking-[0.22em] text-[var(--color-kopf-concrete)]">
                          {p.title} · {p.city}
                        </div>
                      </div>
                      <a
                        href={`tel:${p.phone.replace(/\./g, "")}`}
                        className="font-[var(--font-jetbrains)] tabular-nums text-sm text-[var(--color-kopf-orange)] hover:text-[var(--color-kopf-bone)] transition inline-flex items-center gap-2"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        T: {p.phone}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Mailing */}
          <div className="mt-14 border-l-4 border-[var(--color-kopf-orange)] pl-6 max-w-md">
            <h3 className="kopf-eyebrow mb-3">§ Contact Kopf Logistics</h3>
            <div className="font-[var(--font-jetbrains)] tabular-nums text-sm leading-relaxed text-[var(--color-kopf-bone)]">
              PO Box 207
              <br />
              Goshen, Indiana 46527
              <br />
              T: 574.971.8689
            </div>
          </div>
        </div>
      </section>

      {/* §02 CONTACT FORM */}
      <section className="relative bg-[var(--color-kopf-ink-2)] border-y border-white/[0.05] px-6 lg:px-10 py-20 md:py-28">
        <div className="max-w-3xl mx-auto">
          <SectionHeader
            chapter="02"
            eyebrow="One Business Day Response"
            title="Send Us a Message"
          />
          <ContactForm turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} />
        </div>
      </section>

      {/* §03 TERMINALS */}
      <section className="relative px-6 lg:px-10 py-20 md:py-28">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            chapter="03"
            eyebrow="3 Locations · 48 States"
            title="Terminals"
          />
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {terminals.map((t) => (
              <div key={t.city} className="border border-white/[0.08] bg-[var(--color-kopf-ink-2)] flex flex-col">
                <div className="relative aspect-[4/3] bg-[var(--color-kopf-ink)] overflow-hidden">
                  <iframe
                    src={t.mapEmbed}
                    title={`Map of ${t.city} terminal`}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full grayscale contrast-125 opacity-80"
                    style={{ border: 0 }}
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  <span className="absolute top-4 left-4 bg-[var(--color-kopf-orange)] text-[var(--color-kopf-ink)] px-3 py-1 font-[var(--font-jetbrains)] text-[10px] uppercase tracking-[0.22em] font-semibold">
                    {t.badge}
                  </span>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-[var(--font-anton)] uppercase text-2xl leading-none tracking-tight">
                    {t.city}
                  </h3>
                  <div className="mt-4 font-[var(--font-jetbrains)] tabular-nums text-sm leading-relaxed text-[var(--color-kopf-bone-muted)]">
                    {t.address[0]}
                    <br />
                    {t.address[1]}
                    <br />
                    <a
                      href={`tel:${t.phone.replace(/\./g, "")}`}
                      className="text-[var(--color-kopf-orange)] hover:text-[var(--color-kopf-bone)] transition"
                    >
                      T: {t.phone}
                    </a>
                  </div>
                  <div className="mt-5 pt-4 border-t border-white/[0.08] mt-auto">
                    <a
                      href={t.directions}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] font-[var(--font-jetbrains)] font-semibold text-[var(--color-kopf-bone)] hover:text-[var(--color-kopf-orange)] transition"
                    >
                      <MapPin className="w-3.5 h-3.5" /> Get Directions
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
