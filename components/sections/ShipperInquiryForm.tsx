"use client";

import KopfFormShell, {
  TextField,
  RadioGroup,
  CheckboxGroup,
  SelectField,
} from "./KopfFormShell";
import { US_STATE_OPTIONS } from "@/lib/us-states";

/**
 * Shipper Inquiry form — used on /shippers.
 *
 * Field structure mirrors the original WordPress Shipper form (form_id 18385,
 * scraped directly from https://kopflogisticsgroup.com/shippers/) one-for-one
 * — every visible field, every option, in the exact order. One original WP
 * field is intentionally NOT carried over:
 *   - field_2 ("Office Name of") — corrupt label in WP admin, gibberish
 *
 * Submissions tagged source="shippers" so the dispatch team can route quotes
 * separately.
 */
export default function ShipperInquiryForm({
  turnstileSiteKey,
}: {
  turnstileSiteKey?: string;
}) {
  return (
    <KopfFormShell
      source="shippers"
      turnstileSiteKey={turnstileSiteKey}
      submitLabel="Submit"
      successTitle="Thanks — your shipping inquiry is in."
      successBody={
        <>
          A Kopf rep will reach out within one business day to discuss your needs
          and pricing. Need to talk now? Call{" "}
          <a
            href="tel:5743495600"
            className="font-[var(--font-jetbrains)] tabular-nums hover:opacity-80"
            style={{ color: "var(--accent)" }}
          >
            574.349.5600
          </a>
          .
        </>
      }
    >
      {/* — Identity (WP fields #0, #1, #3) — */}
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
        <TextField
          label="Phone *"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
        />
      </div>

      {/* — Business identity (WP fields #18, #19, #20, #21) — */}
      <div className="grid md:grid-cols-2 gap-6">
        <TextField
          label="Contact Title *"
          name="contact_title"
          required
          autoComplete="organization-title"
          maxLength={100}
        />
        <TextField
          label="DUNS Number *"
          name="duns_number"
          required
          maxLength={20}
        />
        <TextField
          label="Name of Business *"
          name="business_name"
          required
          autoComplete="organization"
        />
        <TextField
          label="Nature of Business *"
          name="business_nature"
          required
          maxLength={200}
        />
      </div>

      {/* — Subsidiary / new customer (WP fields #23, #24) — */}
      <div className="grid md:grid-cols-2 gap-6">
        <RadioGroup
          label="Are you a subsidiary? *"
          name="is_subsidiary"
          options={["Yes", "No"]}
        />
        <RadioGroup
          label="Are you a new customer? *"
          name="is_new_customer"
          options={["Yes", "No"]}
        />
      </div>

      {/* — Corporate office address (WP fields #31, #26, #28, #29, #30, #27) — */}
      <TextField
        label="Corporate Office Name *"
        name="corporate_office_name"
        required
        maxLength={200}
      />

      <div className="grid gap-6">
        <TextField
          label="Corporate Office Street Address *"
          name="corporate_office_street_address"
          required
          autoComplete="address-line1"
        />
        <TextField
          label="Address Line 2"
          name="address_line_2"
          autoComplete="address-line2"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TextField label="City *" name="city" required autoComplete="address-level2" />
          <SelectField
            label="State *"
            name="state"
            options={US_STATE_OPTIONS}
            placeholder="Choose State"
            required
            autoComplete="address-level1"
          />
          <TextField
            label="Zip *"
            name="zip"
            required
            autoComplete="postal-code"
            maxLength={10}
          />
        </div>
      </div>

      {/* — How heard (WP field #32) — */}
      <CheckboxGroup
        label="How did you hear about us? *"
        name="how_heard"
        options={[
          "Bing",
          "Family / Friend",
          "Google Search",
          "LinkedIn",
          "Yahoo",
          "Zip Recruiter",
          "Facebook",
          "Google Ad",
          "Instagram",
          "Pinterest",
          "YouTube",
          "ChatGPT/Perplexity/AI Search",
          "Other",
        ]}
        required
        hint="Check all that apply."
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
