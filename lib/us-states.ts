/**
 * US States + DC for the State dropdown shared across audience forms.
 *
 * Stored value matches the FULL state name (not the 2-letter postal code) so
 * the JSONB extra_fields column reads naturally in the admin dashboard and
 * mirrors what the original WordPress forms persisted (the WP options were
 * `<option value="Indiana">Indiana</option>` — value === label).
 *
 * Two variants:
 *   US_STATE_OPTIONS        — 50 states + DC (shippers form)
 *   US_STATE_OPTIONS_INTL   — 50 states + DC + "Not in the US" (agent + drivers,
 *                              both of which support out-of-country applicants)
 */

const STATE_NAMES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "District of Columbia",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
] as const;

/** 50 states + DC. Used by the shippers form. */
export const US_STATE_OPTIONS: ReadonlyArray<{ value: string; label: string }> =
  STATE_NAMES.map((name) => ({ value: name, label: name }));

/** 50 states + DC + "Not in the US". Used by agent + drivers forms which both
 * support out-of-country applicants via a conditional follow-up country field. */
export const US_STATE_OPTIONS_INTL: ReadonlyArray<{ value: string; label: string }> = [
  ...US_STATE_OPTIONS,
  { value: "Not in the US", label: "Not in the US" },
];
