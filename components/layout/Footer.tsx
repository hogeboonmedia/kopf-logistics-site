"use client";

import Image from "next/image";
import Link from "next/link";
import { Facebook, Linkedin, Youtube, Instagram, Phone, Mail, MapPin } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

const terminals = [
  {
    city: "Elkhart, Indiana",
    address1: "2311 Toledo Road",
    address2: "Elkhart, Indiana 46516",
    phone: "574.971.8689",
    mapUrl: "https://www.google.com/maps/place/2311+Toledo+Rd,+Elkhart,+IN+46516",
  },
  {
    city: "Athens, Georgia",
    address1: "145 Newton Bridge Industrial Way",
    address2: "Athens, Georgia 30601",
    phone: "574.971.8689",
    mapUrl: "https://www.google.com/maps/place/145+Newton+Bridge+Rd,+Athens,+GA+30601",
  },
  {
    city: "Seaford, Delaware",
    address1: "8589 Hearns Pond Rd",
    address2: "Seaford, Delaware 19973",
    phone: "302.629.4255",
    mapUrl: "https://www.google.com/maps/place/8589+Hearns+Pond+Rd,+Seaford,+DE+19973",
  },
];

const operations = [
  { name: "Howard Smith", title: "Operations Manager" },
  { name: "Jeanie Northcutt", title: "Director of Recruiting" },
];

const socials = [
  { href: "https://www.facebook.com/kopflogisticsgroup/", label: "Facebook", Icon: Facebook },
  { href: "https://www.linkedin.com/company/kopf-logistics-group/", label: "LinkedIn", Icon: Linkedin },
  { href: "https://www.youtube.com/channel/UCWhdS8UttCsDr0hrhMCcIqA", label: "YouTube", Icon: Youtube },
  { href: "https://www.instagram.com/kopflogistics", label: "Instagram", Icon: Instagram },
];

/** Decode a base64 email address client-side and render it as a mailto link.
 * On SSR / no-JS, renders a plain link to /contact instead of leaking the
 * address into page source. */
function ObfuscatedEmail({
  cipher,
  fallbackHref,
  icon,
}: {
  cipher: string;
  fallbackHref: string;
  icon?: ReactNode;
}) {
  const [decoded, setDecoded] = useState<string | null>(null);
  useEffect(() => {
    try {
      setDecoded(atob(cipher));
    } catch {
      setDecoded(null);
    }
  }, [cipher]);

  if (!decoded) {
    return (
      <Link
        href={fallbackHref}
        className="inline-flex items-center gap-2 hover:text-[var(--accent)] transition"
      >
        {icon}
        Contact via Form
      </Link>
    );
  }
  return (
    <a
      href={`mailto:${decoded}`}
      className="inline-flex items-center gap-2 hover:text-[var(--accent)] transition"
    >
      {icon}
      {decoded}
    </a>
  );
}

// The white Kopf logo reads well on dark backgrounds. For light mode we swap to the orange logo.
function FooterLogo() {
  const [theme, setTheme] = useState<string>("dark");
  useEffect(() => {
    const read = () => setTheme(document.documentElement.getAttribute("data-theme") || "dark");
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);
  const src =
    theme === "light"
      ? "/kopf-original/images/kopf_orangelogo_no_bg_02.png"
      : "/kopf-original/images/Kopf-logo_white.png";
  return (
    <Image src={src} alt="Kopf Logistics Group" width={240} height={137} className="h-16 w-auto" />
  );
}

export default function Footer() {
  return (
    <footer
      className="mt-24"
      style={{
        background: "var(--bg-elevated)",
        color: "var(--text-muted)",
        borderTop: "1px solid var(--hairline)",
      }}
    >
      <div className="h-1" style={{ background: "var(--accent)" }} />

      <div className="px-6 lg:px-10 py-16 grid gap-12 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Link href="/" aria-label="Kopf Logistics Group — Home" className="inline-block mb-6">
            <FooterLogo />
          </Link>
          <p className="text-sm leading-relaxed max-w-sm">
            Family-owned freight brokerage since 1966. Headquartered in Elkhart,
            Indiana, the RV Capital of the World — with terminals in Athens, Georgia
            and Seaford, Delaware serving shippers, carriers, drivers and independent
            freight agents across the contiguous 48 states.
          </p>

          <div className="mt-6 flex flex-col gap-2 text-sm font-[var(--font-jetbrains)] tabular-nums">
            <a href="tel:5743495600" className="inline-flex items-center gap-2 hover:text-[var(--accent)] transition">
              <Phone className="w-4 h-4" />
              574.349.5600
            </a>
            {/* Email obfuscation — base64-encoded address reassembled at
              * hydration. Bots that scrape page source for `mailto:` links
              * see nothing harvestable here. */}
            <ObfuscatedEmail
              cipher="cmVjcnVpdGVyQGtvcGZsb2dpc3RpY3Nncm91cC5jb20="
              fallbackHref="/contact"
              icon={<Mail className="w-4 h-4" />}
            />
          </div>

          <div className="mt-6 flex gap-3">
            {socials.map(({ href, label, Icon }) => (
              <a
                key={href}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
                className="grid place-items-center w-10 h-10 transition"
                style={{ border: "1px solid var(--hairline-strong)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent)";
                  e.currentTarget.style.color = "var(--accent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--hairline-strong)";
                  e.currentTarget.style.color = "";
                }}
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="kopf-eyebrow mb-4">§ Truck Terminals</h3>
          <ul className="space-y-5 text-sm">
            {terminals.map((t) => (
              <li key={t.city}>
                <div className="font-semibold uppercase tracking-wide mb-1 text-xs" style={{ color: "var(--text)" }}>
                  {t.city}
                </div>
                <div className="font-[var(--font-jetbrains)] text-xs tabular-nums leading-relaxed">
                  {t.address1}<br />
                  {t.address2}<br />
                  <a href={`tel:${t.phone.replace(/\./g, "")}`} className="hover:text-[var(--accent)] transition">
                    T: {t.phone}
                  </a>{" · "}
                  <a href={t.mapUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-[var(--accent)] transition">
                    <MapPin className="w-3 h-3" /> MAP
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="kopf-eyebrow mb-4">§ Operations</h3>
          <ul className="space-y-4 text-sm">
            {operations.map((o) => (
              <li key={o.name}>
                <div className="font-semibold text-sm" style={{ color: "var(--text)" }}>{o.name}</div>
                <div className="text-[10px] uppercase tracking-widest mt-1" style={{ color: "var(--text-concrete)" }}>
                  {o.title}
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <h3 className="kopf-eyebrow mb-4">§ Mailing</h3>
            <div className="font-[var(--font-jetbrains)] text-xs tabular-nums leading-relaxed">
              PO Box 207<br />
              Goshen, Indiana 46527<br />
              T: 574.971.8689
            </div>
          </div>
        </div>

        <div>
          <h3 className="kopf-eyebrow mb-4">§ Terms & Conditions</h3>
          <p className="text-xs leading-relaxed">
            Kopf Logistics Group is a trade name for a family of distinct, separately
            structured and operated corporations or limited liability companies, each
            of which provides unique services: Kopf Leasing, Inc., Kopf Logistics, LLC
            and TSI Express, Inc.
          </p>

          <div className="mt-6 flex items-center gap-3">
            <Image
              src="/kopf-original/images/ada-compliant.png"
              alt="ADA Compliant"
              width={64}
              height={64}
              className="w-12 h-12 opacity-80"
            />
            <span className="text-[10px] uppercase tracking-widest" style={{ color: "var(--text-concrete)" }}>
              ADA Compliant<br />Website
            </span>
          </div>

          <ul className="mt-8 space-y-2 text-xs uppercase tracking-widest">
            <li>
              <Link href="/blog" className="hover:text-[var(--accent)] transition">Blog</Link>
            </li>
            <li>
              <Link href="/privacy-policy" className="hover:text-[var(--accent)] transition">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-[var(--accent)] transition">Contact</Link>
            </li>
          </ul>
        </div>
      </div>

      <div
        className="px-6 lg:px-10 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-[10px] uppercase tracking-[0.22em]"
        style={{ color: "var(--text-concrete)", borderTop: "1px solid var(--hairline)" }}
      >
        <span>© {new Date().getFullYear()} Kopf Logistics Group · All Rights Reserved</span>
        <span className="font-[var(--font-jetbrains)] tabular-nums">Hauling with purpose since 1966</span>
      </div>
    </footer>
  );
}
