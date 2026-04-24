import type { Metadata } from "next";
import Button from "@/components/ui/Button";
import PhoneEmailBlock from "@/components/ui/PhoneEmailBlock";

export const metadata: Metadata = {
  title: "Thank You",
  description:
    "Thank you for contacting Kopf Logistics Group. We've received your submission and will be in touch shortly.",
  alternates: { canonical: "/thanks" },
  robots: { index: false, follow: true },
};

export default function ThanksPage() {
  return (
    <section className="relative isolate min-h-[calc(100vh-10rem)] grid place-items-center px-6 lg:px-10 py-24">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-br from-[var(--color-kopf-ink)] via-[var(--color-kopf-ink)]/95 to-[var(--color-kopf-ink-2)]" />

      <div className="max-w-3xl text-center">
        <div className="flex items-center gap-3 mb-6 justify-center">
          <span className="kopf-chapter">§ 200 OK</span>
          <span className="h-px w-10 bg-[var(--color-kopf-orange)]" />
          <span className="kopf-eyebrow">Submission Received</span>
        </div>

        <h1 className="font-[var(--font-anton)] uppercase leading-[0.9] tracking-tight text-[14vw] sm:text-7xl md:text-8xl lg:text-[8rem] text-[var(--color-kopf-bone)]">
          Thank <span className="text-[var(--color-kopf-orange)]">You!</span>
        </h1>

        <p className="mt-8 text-[var(--color-kopf-bone-muted)] text-base md:text-lg leading-relaxed">
          We have received your submission and will be in touch shortly. If you have any
          questions in the meantime, please contact us.
        </p>

        <div className="mt-10 flex flex-col items-center gap-6">
          <PhoneEmailBlock align="center" />
          <div className="flex flex-wrap justify-center gap-3">
            <Button href="/" variant="solid">Back to Home</Button>
            <Button href="/about">Our Story</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
