"use client";

import KopfFormShell, {
  TextField,
  NumericField,
  TextAreaField,
  RadioGroup,
  CheckboxGroup,
  SelectField,
} from "./KopfFormShell";
import { US_STATE_OPTIONS_INTL } from "@/lib/us-states";

/**
 * Freight Agent Application form — used on /agent.
 *
 * Field structure mirrors the original WordPress Agent form (form_id 18269,
 * scraped directly from https://kopflogisticsgroup.com/agent/) one-for-one
 * — every visible field, every option, in the exact order. Two original WP
 * fields are intentionally NOT carried over:
 *   - field_3 ("last present months?")  — corrupt label in WP admin, gibberish
 *   - field_25 (Custom Captcha)         — Turnstile + CleanTalk replace this
 *
 * Conditional WP fields (#20 country, #11 customer count) are rendered as
 * always-visible optional inputs here for simplicity — adding React state
 * to dynamically show/hide them is a future polish.
 *
 * Every field that asks for a number (phone, years of experience, customer
 * count, loads/week, and the three money questions) renders as <NumericField>,
 * which strips non-numeric characters as they are typed. The live WordPress
 * form accepts free text in all of these — see HOG-587. Currency formats keep
 * "$", "," and "%" so "$1,250,000" and "18%" still go through.
 *
 * Submissions are tagged source="agent" so they show up under their own
 * filter in /admin/inquiries.
 */
export default function AgentApplicationForm({
  turnstileSiteKey,
}: {
  turnstileSiteKey?: string;
}) {
  return (
    <KopfFormShell
      source="agent"
      turnstileSiteKey={turnstileSiteKey}
      submitLabel="Submit"
      successTitle="Thanks — your application is in our queue."
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
      {/* — Identity (WP fields #0, #1, #23) — */}
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
        <NumericField
          label="Phone *"
          name="phone"
          format="phone"
          required
          autoComplete="tel"
        />
      </div>

      {/* — State + (conditional) Country (WP fields #6, #20) — */}
      <SelectField
        label="State (please select): *"
        name="state"
        options={US_STATE_OPTIONS_INTL}
        placeholder="Choose State Below"
        required
        autoComplete="address-level1"
      />

      <TextField
        label="If outside the US, which Country?"
        name="country_if_outside_us"
        hint="Only fill this in if you selected Not in the US above."
        maxLength={100}
      />

      {/* — How heard (WP field #5) — */}
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

      {/* — Current position (WP field #7, all 5 options) — */}
      <RadioGroup
        label="What is your current position? *"
        name="current_position"
        options={[
          "Agent (1099)",
          "Employee (W-2)",
          "Owner (Self Employed)",
          "Non-Agent Industry Experience",
          "Other",
        ]}
      />

      {/* — Work history (WP fields #2, #17) — */}
      <TextAreaField
        label="Describe all past and present work experience. *"
        name="work_experience"
        rows={5}
        required
        maxLength={2000}
      />

      <NumericField
        label="How many years of freight brokerage experience do you have? *"
        name="years_brokerage_experience"
        format="decimal"
        required
        hint="Numbers only — e.g. 7"
        maxLength={50}
      />

      {/* — Customer following (WP fields #9, #11) — */}
      <RadioGroup
        label="Do you have a customer following? *"
        name="has_customer_following"
        options={["Yes", "No"]}
      />

      <NumericField
        label="If so, how many customers?"
        name="customer_count"
        format="integer"
        hint='Whole number. Only fill this in if you answered "Yes" above.'
        maxLength={50}
      />

      {/* — Business volume (WP fields #12, #14, #15, #16) — */}
      <div className="grid md:grid-cols-2 gap-6">
        <NumericField
          label="How many loads per week? *"
          name="loads_per_week"
          format="integer"
          required
          hint="Whole number — e.g. 25"
          maxLength={50}
        />
        <NumericField
          label="Gross sales the last 12 months? *"
          name="gross_sales_12mo"
          format="currency"
          required
          hint="Dollars — e.g. $1,250,000"
          maxLength={50}
        />
        <NumericField
          label="Gross profit the last 12 months? *"
          name="gross_profit_12mo"
          format="currency"
          required
          hint="Dollars — e.g. $1,250,000"
          maxLength={50}
        />
        <NumericField
          label="Profit margin per load? *"
          name="profit_margin_per_load"
          format="currency-or-percent"
          required
          hint="Dollars or a percentage — e.g. $325 or 18%"
          maxLength={50}
        />
      </div>

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
