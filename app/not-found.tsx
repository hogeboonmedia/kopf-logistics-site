import Link from "next/link";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="relative isolate min-h-[calc(100vh-10rem)] grid place-items-center px-6 lg:px-10 py-24">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-br from-[var(--color-kopf-ink)] via-[var(--color-kopf-ink)]/95 to-[var(--color-kopf-ink-2)]" />

      <div className="max-w-3xl text-center">
        <div className="flex items-center gap-3 mb-6 justify-center">
          <span className="kopf-chapter">§ 404</span>
          <span className="h-px w-10 bg-[var(--color-kopf-orange)]" />
          <span className="kopf-eyebrow">Wrong Turn</span>
        </div>

        <h1 className="font-[var(--font-anton)] uppercase leading-[0.9] tracking-tight text-[22vw] sm:text-[10rem] md:text-[14rem] text-[var(--color-kopf-bone)]">
          <span className="text-[var(--color-kopf-orange)]">404</span>
        </h1>

        <p className="mt-6 font-[var(--font-anton)] uppercase text-3xl md:text-4xl tracking-tight">
          This load took a wrong exit.
        </p>

        <p className="mt-5 text-[var(--color-kopf-bone-muted)] text-base md:text-lg leading-relaxed max-w-xl mx-auto">
          The page you&apos;re looking for doesn&apos;t exist — but we can get you back
          on route. Try the homepage, or call our recruiting line at 574.349.5600.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button href="/" variant="solid">Back to Home</Button>
          <Link href="/contact" className="kopf-btn">Contact Us</Link>
        </div>
      </div>
    </section>
  );
}
