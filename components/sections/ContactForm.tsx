"use client";

import KopfFormShell, {
  TextField,
  TextAreaField,
  RadioGroup,
} from "./KopfFormShell";

/**
 * General Contact form — used on /contact.
 *
 * Field structure mirrors the original WordPress contact form
 * (First Name, Last Name, Email, Phone, Preferred Contact, Message)
 * with `source: "contact"` so submissions are tracked separately from the
 * audience-specific forms (agent, shippers, drivers).
 */
export default function ContactForm({
  turnstileSiteKey,
}: {
  turnstileSiteKey?: string;
}) {
  return (
    <KopfFormShell source="contact" turnstileSiteKey={turnstileSiteKey}>
      <div className="grid md:grid-cols-2 gap-6">
        <TextField label="First Name *" name="first_name" required />
        <TextField label="Last Name *" name="last_name" required />
        <TextField
          label="Email *"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
        <TextField label="Phone *" name="phone" type="tel" required autoComplete="tel" />
      </div>

      <RadioGroup
        label="Preferred Contact"
        name="inquiry"
        options={["Phone", "Email"]}
        defaultValue="Phone"
      />

      <TextAreaField
        label="Describe Inquiry *"
        name="inquiry_body"
        required
        minLength={5}
        maxLength={4000}
      />

      <p
        className="mt-4 text-xs font-[var(--font-jetbrains)] leading-relaxed tracking-[0.08em]"
        style={{ color: "var(--text-concrete)" }}
      >
        *By providing a telephone number and submitting this form you are consenting
        to be contacted by SMS text message. Message &amp; data rates may apply. You
        can reply STOP to opt-out of further messaging.
      </p>
    </KopfFormShell>
  );
}
