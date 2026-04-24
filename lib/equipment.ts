/**
 * Equipment & freight services Kopf operates.
 *
 * Each entry powers (a) the bento grid card on the homepage, (b) the
 * click-through modal dialog, and (c) the Service JSON-LD structured data.
 *
 * Copy is written to be SEO-useful: every modal includes the search-friendly
 * service name (e.g. "full truckload (FTL)"), an industry vertical list, a
 * cargo list, and a benefits list. All content is rendered server-side inside
 * a <dialog> so crawlers index it on first paint.
 */

export interface EquipmentItem {
  /** URL fragment + dialog id (e.g. "truckload" → #equipment-truckload) */
  slug: string;
  /** Display name on the card and dialog heading */
  label: string;
  /** Short search-keyword string used as the dialog standfirst */
  tagline: string;
  /** Filename in /public/kopf-original/images/ */
  icon: string;
  /** ~150-word body, rendered as <p>. Indexed for long-tail freight queries. */
  description: string;
  /** 3–5 concrete benefits — what the shipper gets */
  benefits: string[];
  /** Industries / shipper profiles best matched to this mode */
  bestFor: string[];
  /** Representative cargo types — strong long-tail keyword surface */
  cargo: string[];
  /** CTA destination (defaults to /shippers if unspecified) */
  ctaPath: string;
  /** CTA label */
  ctaLabel: string;
}

export const equipment: EquipmentItem[] = [
  {
    slug: "truckload",
    label: "Truckload",
    tagline: "Full truckload freight, sealed and direct.",
    icon: "01_TRUCKLOAD.png",
    description:
      "Full truckload (FTL) is the most direct way to move 10,000–45,000 lbs of freight — your cargo fills an entire 53-foot dry van and travels straight from origin to destination with no intermediate stops, no LTL terminal handling, and a single sealed trailer from dock to dock. That means faster transit, lower damage rates, and tighter chain-of-custody than any shared-haul mode. Kopf coordinates dry van truckload capacity across the contiguous 48 states through a vetted carrier base of more than 35,000 contract carriers and our own family-owned fleet — so we can match your lane, your weight, and your delivery window without bouncing your load between brokers.",
    benefits: [
      "Direct origin-to-destination transit (no terminal handling)",
      "Sealed trailer for chain-of-custody and reduced damage",
      "Capacity in all 48 contiguous states",
      "Vetted contract carriers, single point of contact",
      "Weekly settlements, transparent rate confirmations",
    ],
    bestFor: [
      "Manufacturers shipping full pallet loads",
      "Distributors with consistent lane volume",
      "E-commerce fulfillment, retail replenishment",
      "Time-sensitive consumer goods",
    ],
    cargo: [
      "Palletized goods",
      "Boxed consumer products",
      "Beverages, packaged food",
      "Paper, packaging materials",
      "Building products",
    ],
    ctaPath: "/shippers",
    ctaLabel: "Quote a Truckload",
  },
  {
    slug: "temperature-controlled",
    label: "Temperature-Controlled",
    tagline: "Refrigerated and frozen freight, -20°F to ambient.",
    icon: "02_TEMPERATURE-CONTROLLED.png",
    description:
      "Temperature-controlled (refrigerated, or \"reefer\") freight moves perishable and climate-sensitive cargo in trailers that hold a precise temperature throughout transit — anywhere from deep-frozen at -20°F up to controlled-ambient. Kopf manages reefer truckload across the cold chain for produce, frozen and fresh proteins, dairy, baked goods, pharmaceuticals, paint, adhesives, and chocolate. Every load is matched to a carrier with current FDA Sanitary Transportation of Human and Animal Food (STF) compliance, continuous temperature monitoring, and the right trailer spec for your protocol — single-temp, multi-temp, or with bulkheads for split loads.",
    benefits: [
      "Continuous temperature monitoring with download on delivery",
      "FDA STF / FSMA-compliant carrier vetting",
      "Single-temp, multi-temp, and bulkhead-divided trailers",
      "Pre-cool and load-time temperature verification",
      "Cold-chain expertise for food, pharma, and chemicals",
    ],
    bestFor: [
      "Food & beverage processors",
      "Produce shippers and importers",
      "Pharmaceutical and life-science distributors",
      "Specialty chemicals and adhesives",
    ],
    cargo: [
      "Frozen and refrigerated foods",
      "Fresh produce, meat, dairy",
      "Pharmaceuticals and vaccines",
      "Confectionery, chocolate",
      "Temperature-sensitive chemicals",
    ],
    ctaPath: "/shippers",
    ctaLabel: "Book a Reefer",
  },
  {
    slug: "open-deck",
    label: "Open-Deck",
    tagline: "Flatbed, step-deck, and RGN for oversized freight.",
    icon: "03_OPEN-DECK.png",
    description:
      "Open-deck transportation moves freight that can't fit inside a van — equipment, building materials, machinery, steel coils, lumber, prefab structures, and anything tall, wide, or top-loaded. Kopf coordinates flatbed, step-deck (drop-deck), conestoga, and removable gooseneck (RGN) capacity for legal and oversize/overweight loads, including permitted moves with pilot car coordination. We work with carriers trained in load securement to NHTSA cargo-securement standards, with the tarps, straps, chains, edge protectors, and corner protectors needed for your commodity.",
    benefits: [
      "Flatbed, step-deck, conestoga, and RGN capacity",
      "Trained securement crews (straps, chains, tarps, edge protection)",
      "Permitted oversize / overweight load coordination",
      "Pilot car arrangement for super-loads",
      "Heavy-haul experience for construction and energy",
    ],
    bestFor: [
      "Construction and concrete contractors",
      "Steel mills and metals distributors",
      "Heavy equipment manufacturers and dealers",
      "Energy, oil & gas, wind",
      "Modular and prefab building manufacturers",
    ],
    cargo: [
      "Steel coils, plate, structural beams",
      "Lumber, drywall, building materials",
      "Construction and ag equipment",
      "Pipe, tubing, conduit",
      "Modular structures and prefab housing",
    ],
    ctaPath: "/shippers",
    ctaLabel: "Get an Open-Deck Quote",
  },
  {
    slug: "ltl",
    label: "Less-Than-Truckload (LTL)",
    tagline: "Shared trailer space for shipments under 15,000 lbs.",
    icon: "04_LESS-THAN-TRUCKLOAD.png",
    description:
      "Less-than-truckload (LTL) is the cost-efficient choice when your shipment is too large for parcel but too small for a full truckload — typically 150 to 15,000 lbs and one to six pallets. Your freight shares trailer space with other shippers, terminal-routed through carrier hubs and reconsolidated for delivery. Kopf negotiates LTL pricing across a national carrier network and helps shippers select the right freight class, packaging, and accessorials (liftgate, residential, inside delivery, limited-access) to keep costs predictable and avoid reclassification charges.",
    benefits: [
      "National LTL carrier network",
      "Freight class consultation to avoid reclass charges",
      "Liftgate, residential, inside, and limited-access accessorials",
      "Pallet-level tracking and PRO-number visibility",
      "Volume LTL options for 6+ pallets",
    ],
    bestFor: [
      "Small and mid-size manufacturers",
      "E-commerce shipping pallet-sized SKUs",
      "Distributors moving partial loads",
      "Trade show and event shippers",
    ],
    cargo: [
      "1–6 palletized shipments",
      "Crated machinery and parts",
      "Furniture and appliances",
      "Trade-show booths and displays",
    ],
    ctaPath: "/shippers",
    ctaLabel: "Quote LTL Freight",
  },
  {
    slug: "bulk-transport",
    label: "Bulk Transport",
    tagline: "Liquid, dry, and pneumatic bulk hauling.",
    icon: "05_BULK-TRANSPORT.png",
    description:
      "Bulk freight moves loose, unpackaged cargo in specialized trailers — liquid tankers for chemicals, fuels, food-grade products and water; pneumatic tankers for plastic pellets, cement, fly ash and flour; dry hopper trailers for grain, sugar, and aggregates; and end-dump or belt trailers for construction materials. Kopf coordinates bulk capacity with carriers carrying the right HM-181/183 hazmat endorsements, food-grade tank wash certificates, and Compartment-by-compartment cleaning records when you need them. Our brokerage team understands bulk loading practices, wash-out documentation, and seal protocols specific to each commodity class.",
    benefits: [
      "Liquid, dry-bulk, pneumatic, and end-dump capacity",
      "Food-grade and chemical-grade tank options",
      "Hazmat-endorsed carriers (HM-181/183)",
      "Tank wash documentation and seal protocols",
      "Bulk loading and unloading expertise",
    ],
    bestFor: [
      "Agricultural producers and grain elevators",
      "Plastic and resin manufacturers",
      "Chemical and petrochemical companies",
      "Food ingredient and beverage producers",
      "Construction aggregate suppliers",
    ],
    cargo: [
      "Grain, sugar, flour, feed",
      "Plastic pellets and resins",
      "Liquid chemicals and fuels",
      "Cement, fly ash, sand",
      "Food-grade liquids and dry goods",
    ],
    ctaPath: "/shippers",
    ctaLabel: "Discuss a Bulk Lane",
  },
  {
    slug: "drop-hook",
    label: "Drop & Hook Service",
    tagline: "Pre-loaded trailers, zero dock dwell time.",
    icon: "08_DROP-HOOK-SERVICE.png",
    description:
      "Drop & hook service positions a pre-loaded trailer at your facility so the inbound driver simply hooks up and rolls — no waiting at the dock, no detention charges, no live-load coordination delays. Kopf manages trailer pools at high-volume shipper and consignee locations so loading happens on your schedule, not a driver's clock. The result is faster turn times for the carrier, predictable pickup windows for your operations team, and lower freight costs because we eliminate the wait time priced into live-load rates.",
    benefits: [
      "No dock dwell time — drivers hook and go",
      "Eliminates detention and demurrage charges",
      "Loading on your schedule, not the driver's HOS clock",
      "Trailer pool managed by Kopf",
      "Faster carrier turns = better lane rates",
    ],
    bestFor: [
      "High-volume distribution centers",
      "Just-in-time manufacturers",
      "Shippers with frequent picks on the same lane",
      "Operations with extended loading windows",
    ],
    cargo: [
      "Any palletized or floor-loaded freight",
      "Multi-stop consolidations",
      "Recurring shipments on a fixed schedule",
    ],
    ctaPath: "/shippers",
    ctaLabel: "Set Up a Trailer Pool",
  },
  {
    slug: "power-only",
    label: "Power Only",
    tagline: "Tractors and drivers for your existing trailers.",
    icon: "06_POWER-ONLY.png",
    description:
      "Power only service supplies a tractor and qualified driver to pull your existing trailer — useful when you have your own trailer pool but need additional drivers, when you're repositioning trailers between yards, or when you want to keep your branded trailers on the road without operating your own fleet. Kopf vets power-only carriers for the right hitch hardware (fifth-wheel height, kingpin compatibility), proper insurance, and current authority. We can move dry vans, reefers, flatbeds, step-decks, container chassis and tank trailers — across town or across the country.",
    benefits: [
      "Tractor + driver on-demand for your trailer",
      "Vetted owner-operators and carriers",
      "Compatible with vans, reefers, flatbeds, tanks, chassis",
      "Trailer repositioning and yard moves",
      "Keep your branded trailers in the network",
    ],
    bestFor: [
      "Shippers with their own trailer pools",
      "Carriers needing supplemental capacity",
      "Asset-based operations covering driver shortages",
      "Container and intermodal trailer moves",
    ],
    cargo: [
      "Any cargo your trailer is rated for",
      "Trailer repositioning (loaded or empty)",
    ],
    ctaPath: "/carriers",
    ctaLabel: "Power-Only Capacity",
  },
  {
    slug: "drop-trailer",
    label: "Drop-Trailer Service",
    tagline: "Trailer staging at your dock, picked up when ready.",
    icon: "07_DROP-TRAILER-SERVICE.png",
    description:
      "Drop-trailer service places empty trailers at your facility for loading on your schedule, then a Kopf-coordinated driver returns to pick them up when ready. It eliminates the back-and-forth of live-load appointments, frees your dock workers from racing a driver's clock, and lets you build loads across multiple shifts or consolidate orders before pickup. We manage drop-trailer programs for high-volume shippers across our 48-state coverage, with dedicated trailer pools at facilities that need them.",
    benefits: [
      "Empty trailers staged at your dock for flexible loading",
      "Build loads across multiple shifts or days",
      "No live-load appointment coordination",
      "Eliminates dock-worker idle time",
      "Trailer pool managed and tracked by Kopf",
    ],
    bestFor: [
      "Variable-volume shippers",
      "Multi-day or multi-shift load builds",
      "Operations with limited dock door availability",
      "Manufacturers consolidating from multiple cells",
    ],
    cargo: [
      "Any palletized or floor-loaded freight",
      "Consolidated outbound from production runs",
    ],
    ctaPath: "/shippers",
    ctaLabel: "Set Up Drop Trailers",
  },
  {
    slug: "trailer-interchange",
    label: "Trailer Interchange",
    tagline: "Carrier-to-carrier trailer transfers under written agreement.",
    icon: "09_TRAILER-INTERCHANGE.png",
    description:
      "Trailer interchange agreements allow a different carrier to legally pull your trailer for a leg of the route — useful for relay routes, regional hand-offs, intermodal pickup or delivery, and equipment repositioning across the country. Kopf manages the written interchange paperwork, verifies the receiving carrier's interchange insurance (covers damage to the trailer while in their possession), and coordinates the location-specific transfer logistics. It's the established way to keep a trailer moving across multiple carriers without losing accountability for the equipment.",
    benefits: [
      "Written interchange agreements and documentation",
      "Verified trailer interchange insurance",
      "Relay-route and regional hand-off coordination",
      "Intermodal first/last-mile trailer transfers",
      "Equipment positioning across long lanes",
    ],
    bestFor: [
      "Asset-based carriers running relay routes",
      "Intermodal shippers and IMCs",
      "Regional hand-offs across carrier territories",
      "Trailer repositioning operations",
    ],
    cargo: [
      "Any freight in the interchanged trailer",
      "Intermodal containers and chassis (where applicable)",
    ],
    ctaPath: "/carriers",
    ctaLabel: "Discuss Interchange",
  },
  {
    slug: "owner-operators",
    label: "Owner Operators",
    tagline: "Independent owner-operators leased to Kopf.",
    icon: "10_OWNER-OPERATORS.png",
    description:
      "Owner-operators are independent business owners who own their own truck and contract with Kopf for freight, dispatching, settlements, fuel discounts, and back-office support. Leasing on with Kopf means you get steady freight from our shipper base, weekly settlements paid upon billing with clean paperwork, $2,500 advances after three loads, fuel-card discounts, base-plate and permit assistance, and a 24/7 dispatch team that knows you by name — without giving up the independence of running your own business. We've been a family-owned brokerage since 1966 and we treat the people in our trucks like family.",
    benefits: [
      "Steady freight across the 48 contiguous states",
      "Weekly settlements with clean paperwork",
      "Up to $2,500 advances (40% of line haul) after 3 loads",
      "Fuel-card discounts and base-plate assistance",
      "24/7 dispatch and dedicated driver support",
    ],
    bestFor: [
      "Owner-operators wanting independence with broker support",
      "Drivers transitioning from company truck to ownership",
      "Small fleets seeking consistent freight",
    ],
    cargo: [
      "Dry van, reefer, flatbed depending on your equipment",
      "Long-haul, regional, and dedicated lanes",
    ],
    ctaPath: "/drivers",
    ctaLabel: "Lease On With Kopf",
  },
];

/**
 * Build schema.org Service entities for the equipment list. Used by the
 * homepage to emit JSON-LD inside an ItemList so search engines can index
 * each freight mode as a discrete service offered by Kopf.
 */
export function equipmentJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Freight Services Operated by Kopf Logistics Group",
    itemListElement: equipment.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Service",
        "@id": `https://kopflogisticsgroup.com/#equipment-${item.slug}`,
        name: item.label,
        description: item.description,
        provider: { "@id": "https://kopflogisticsgroup.com/#organization" },
        areaServed: {
          "@type": "Country",
          name: "United States (48 contiguous states)",
        },
        serviceType: item.label,
        category: "Freight transportation",
      },
    })),
  };
}
