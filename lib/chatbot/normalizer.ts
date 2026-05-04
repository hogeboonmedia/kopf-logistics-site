/**
 * Typo / synonym normalization for chatbot user input.
 *
 * Logistics-specific lexicon: common misspellings, abbreviations, and
 * industry shorthand that the regex patterns wouldn't otherwise match.
 */

const TYPO_MAP: Record<string, string> = {
  // Generic misspellings
  servce: "service",
  servic: "service",
  contractor: "contractor",
  // Logistics terms
  carrer: "carrier",
  carriers: "carrier",
  truk: "truck",
  trcuk: "truck",
  triler: "trailer",
  freigth: "freight",
  freihgt: "freight",
  shippping: "shipping",
  shipping: "shipping",
  loadboard: "load board",
  driverpay: "driver pay",
  // Industry abbreviations expanded for matching
  ltl: "less than truckload ltl",
  tl: "truckload tl",
  fl: "flatbed",
  reefer: "refrigerated reefer",
  ooida: "owner operator ooida",
  oo: "owner operator",
  cdl: "cdl commercial drivers license",
  dot: "dot department of transportation",
  fmcsa: "fmcsa",
  ein: "ein tax id",
  duns: "duns",
  // Common contractions
  whats: "what's",
  dont: "don't",
  im: "i'm",
  ive: "i've",
  cant: "can't",
  wont: "won't",
  theres: "there's",
  // Geo / brand
  elkhart: "elkhart",
  athens: "athens",
  seaford: "seaford",
};

export function normalize(text: string): string {
  const words = text.trim().toLowerCase().split(/\s+/);
  return words.map((w) => TYPO_MAP[w] ?? w).join(" ");
}
