import type { Metadata } from "next";
import SectionHeader from "@/components/ui/SectionHeader";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Kopf Logistics Group's Privacy Policy explains how we collect, use, and protect the information you share with us.",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <article className="px-6 lg:px-10 py-20 md:py-28 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <span className="kopf-chapter">§ Privacy</span>
        <span className="h-px w-10 bg-[var(--color-kopf-orange)]" />
        <span className="kopf-eyebrow">Last Updated: April 2026</span>
      </div>

      <h1 className="font-[var(--font-anton)] uppercase leading-[0.9] tracking-tight text-[var(--color-kopf-bone)] text-5xl md:text-7xl lg:text-8xl">
        Privacy <span className="text-[var(--color-kopf-orange)]">Policy</span>
      </h1>

      <div className="mt-12 space-y-8 text-[var(--color-kopf-bone-muted)] leading-relaxed">
        <section>
          <SectionHeader chapter="01" eyebrow="Scope" title="What This Policy Covers" />
          <p className="mt-6">
            Kopf Logistics Group (&ldquo;Kopf,&rdquo; &ldquo;we,&rdquo; or &ldquo;us&rdquo;)
            respects your privacy. This policy describes the information we collect when
            you use our website or submit a questionnaire, and how we use and protect
            that information. By using our site or contacting us, you consent to the
            practices described here.
          </p>
        </section>

        <section>
          <SectionHeader chapter="02" eyebrow="Information" title="What We Collect" />
          <ul className="mt-6 space-y-3 list-disc pl-6">
            <li>
              Contact details you provide through forms (name, email, phone, company,
              DUNS, address).
            </li>
            <li>
              Driving, operating, and insurance information you submit through carrier
              or driver applications.
            </li>
            <li>
              Basic analytics and device data — browser type, device type, pages
              visited, approximate location — collected through standard web analytics.
            </li>
          </ul>
        </section>

        <section>
          <SectionHeader chapter="03" eyebrow="Purpose" title="How We Use Your Information" />
          <p className="mt-6">
            We use the information you provide to respond to inquiries, evaluate
            applications, provide logistics services, comply with applicable laws, and
            improve our website. We do not sell your personal information.
          </p>
        </section>

        <section>
          <SectionHeader chapter="04" eyebrow="SMS" title="Text Messaging Consent" />
          <p className="mt-6">
            By providing a telephone number and submitting a form, you consent to be
            contacted by SMS text message. Message &amp; data rates may apply. You can
            reply STOP to opt out of further messaging at any time.
          </p>
        </section>

        <section>
          <SectionHeader chapter="05" eyebrow="Contact" title="Questions" />
          <p className="mt-6">
            Questions about this policy? Email{" "}
            <a
              href="mailto:recruiter@kopflogisticsgroup.com"
              className="text-[var(--color-kopf-orange)] underline"
            >
              recruiter@kopflogisticsgroup.com
            </a>{" "}
            or call{" "}
            <a href="tel:5743495600" className="text-[var(--color-kopf-orange)] underline">
              574.349.5600
            </a>
            .
          </p>
        </section>
      </div>
    </article>
  );
}
