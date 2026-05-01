"use client";

import KopfFormShell, {
  TextField,
  TextAreaField,
  RadioGroup,
  CheckboxGroup,
  SelectField,
} from "./KopfFormShell";
import { US_STATE_OPTIONS_INTL } from "@/lib/us-states";

const BEST_TIME_OPTIONS = [
  "Pacific Time - Morning",
  "Pacific Time - Afternoon",
  "Pacific Time - Evening",
  "Mountain Time - Morning",
  "Mountain Time - Afternoon",
  "Mountain Time - Evening",
  "Central Time - Morning",
  "Central Time - Afternoon",
  "Central Time - Evening",
  "Eastern Time - Morning",
  "Eastern Time - Afternoon",
  "Eastern Time - Evening",
];

/**
 * Driver Application form — used on /drivers.
 *
 * Field structure mirrors the original WordPress Driver form (form_id 18853,
 * scraped directly from https://kopflogisticsgroup.com/drivers/) one-for-one
 * — every visible field, every option, in the exact order. One original WP
 * field is intentionally NOT carried over:
 *   - field_3 ("you vehicle? privilege") — corrupt label in WP admin, gibberish
 *
 * Submissions tagged source="drivers" so the recruiting team can route
 * applications separately.
 */
export default function DriverApplicationForm({
  turnstileSiteKey,
}: {
  turnstileSiteKey?: string;
}) {
  return (
    <KopfFormShell
      source="drivers"
      turnstileSiteKey={turnstileSiteKey}
      submitLabel="Submit"
      successTitle="Thanks — your driver application is in."
      successBody={
        <>
          Our recruiting team will review your application and reach out within
          one business day. Questions in the meantime? Call{" "}
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
      {/* — Identity (WP fields #0, #1, #23, #24) — */}
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
        <TextField
          label="Alternate Phone"
          name="alternate_phone"
          type="tel"
        />
      </div>

      {/* — State + states operated in (WP fields #6, #30) — */}
      <SelectField
        label="State (please select): *"
        name="state"
        options={US_STATE_OPTIONS_INTL}
        placeholder="Choose State Below"
        required
        autoComplete="address-level1"
      />

      <SelectField
        label="List states operated in: *"
        name="states_operated_in"
        options={US_STATE_OPTIONS_INTL}
        placeholder="Choose State Below"
        required
      />

      {/* — Best time to contact (WP field #25) — */}
      <SelectField
        label="Best time to contact you? *"
        name="best_time_to_contact"
        options={BEST_TIME_OPTIONS}
        placeholder="Choose Best Time Below"
        required
      />

      {/* — How heard (WP field #5) — */}
      <CheckboxGroup
        label="How did you hear about us? *"
        name="how_heard"
        options={[
          "Google",
          "Get Loaded",
          "Internet Truckstop",
          "Monster",
          "MSN",
          "Yahoo",
          "Craigslist",
          "LinkedIn",
          "Facebook",
          "Inc.com",
          "Indeed",
          "Friend/Family",
          "Business Associate",
          "Kopf website",
          "ChatGPT/Perplexity/AI Search",
          "Other",
        ]}
        required
        hint="Check all that apply."
      />

      {/* — DOT eligibility (WP fields #7, #26, #27) — */}
      <RadioGroup
        label="Do you have three years of verifiable employment? *"
        name="three_year_employment"
        options={["Yes", "No"]}
      />

      <RadioGroup
        label="Have you ever been denied a license, permit or privilege to operate a motor vehicle? *"
        name="license_denied"
        options={["Yes", "No"]}
      />

      <RadioGroup
        label="Has any license, permit or privilege ever been suspended or revoked? *"
        name="license_suspended"
        options={["Yes", "No"]}
      />

      {/* — Truck experience + equipment (WP fields #28, #29) — */}
      <TextField
        label="How many years experience do you have driving a truck?"
        name="years_truck_driving"
        type="number"
        maxLength={5}
      />

      <CheckboxGroup
        label="What types of equipment are you licensed to operate? *"
        name="equipment_licensed"
        options={[
          "Straight Truck",
          "Tractor-Trailer",
          "Tractor-Double Trailers",
          "Tractor-Triple Trailers",
          "Tractor-Flatbed Trailer",
          "Tractor-Tank Trailer",
          "Tractor-Dump Trailer",
          "Other",
        ]}
        required
        hint="Check every type you're qualified to drive."
      />

      {/* — Awards / training / motivation (WP fields #2, #31, #32) — */}
      <TextAreaField
        label="List safe driving awards: *"
        name="safe_driving_awards"
        rows={4}
        required
        maxLength={1500}
      />

      <TextAreaField
        label="List any special training: *"
        name="special_training"
        rows={4}
        required
        maxLength={1500}
      />

      <TextAreaField
        label="Why are you interested in this opportunity? *"
        name="why_interested"
        rows={5}
        required
        maxLength={1500}
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
