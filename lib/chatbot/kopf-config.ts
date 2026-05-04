import type { ChatConfig } from "./types";

/**
 * Kopf Logistics Group chatbot config.
 *
 * Intent design priorities (in order):
 *   1. Recruiting funnels — agents, drivers — these are the highest-value
 *      conversions for the business. Each routes to its application form.
 *   2. Shipper inquiries — get them to the shipper form or the phone.
 *   3. Brand / about / location — for the casual visitor learning who
 *      Kopf is.
 *   4. Service-line questions — truckload / refrigerated / flatbed /
 *      LTL / power-only. Establishes capability without a hard sell.
 *   5. Catch-alls — phone, hours, contact, frustration → live human.
 *
 * The bot intentionally does NOT promise rates, transit times, or
 * specific lane availability — those need a human dispatcher. Every
 * trade-quote question routes to the phone (574.349.5600).
 */

export const kopfChatConfig: ChatConfig = {
  company: {
    name: "Kopf Logistics",
    tagline: "Family-owned freight brokerage since 1966",
    poweredBy: "Hogeboon Media",
  },

  behavior: {
    greetings: [
      "Hey — welcome to Kopf Logistics Group. I can help you find the right page, get you to a quote, or answer questions about driving for us, becoming a freight agent, or shipping a load. What brings you here today?",
      "Hi there! I'm here to help. Whether you're looking to ship freight, drive for us, run an agency, or just learn about Kopf, I can point you in the right direction. What do you need?",
      "Welcome to Kopf Logistics. I can help with shipper inquiries, driver applications, freight-agent opportunities, or general questions about the company. What's on your mind?",
    ],
    defaultSuggestions: [
      [
        "I want to ship freight",
        "Become a freight agent",
        "Driver opportunities",
        "Contact the office",
      ],
      [
        "What services do you offer?",
        "Where are you located?",
        "About Kopf Logistics",
        "Get a quote",
      ],
      [
        "Owner-operator?",
        "Company driver?",
        "Refrigerated freight?",
        "Flatbed / open-deck?",
      ],
    ],
    privacyNotice:
      "This chat stays on your device. Your conversation isn't stored or shared.",
    fallbackMessages: [
      "I'm not sure I have a great answer for that. I can help with shipper inquiries, driver and agent applications, our service lines, and general company info. Want to try one of those?",
      "Hmm, that's a bit outside what I know. I'm best at questions about shipping, becoming a driver or agent, our services (truckload, refrigerated, flatbed, LTL, power-only), or how to reach the office. Try one of those?",
      "I don't have a good answer for that one. If it's time-sensitive, the dispatch desk at <strong>574.349.5600</strong> is your fastest path. Otherwise — want to ask about shipping, driving, or our agent program?",
    ],
    frustrationResponse:
      "I'm sorry I'm not being more helpful. Our team would love to talk to you directly.\n\n<strong>Phone:</strong> 574.349.5600 (24/7 dispatch)\n<strong>Email:</strong> recruiter@kopflogisticsgroup.com\n\n<strong>Office hours:</strong> Mon–Fri 8 AM – 5 PM ET (dispatch is around the clock)",
    frustrationSuggestions: [
      "Call the office",
      "Submit a contact form",
      "I want to ship freight",
    ],
  },

  intents: [
    // ── Greetings ────────────────────────────────────────────────────────
    {
      id: "greeting",
      patterns: [
        "^(hi|hey|hello|howdy|good\\s*(morning|afternoon|evening)|what'?s?\\s*up|yo|sup)\\b",
        "^(morning|evening|afternoon)$",
      ],
      responses: [
        "Hey! Welcome to Kopf Logistics. I can help with shipping freight, driver and agent opportunities, or any general questions about the company. What can I do for you?",
        "Hi! Glad you're here. I can point you toward the right form, the right phone number, or the right page. What are you looking for?",
        "Hello! I'm here to help. Looking to ship freight, drive for Kopf, or run a freight agency? Or just looking for general info?",
      ],
      suggestions: [
        ["I want to ship freight", "Become a freight agent", "Driver opportunities"],
        ["About Kopf Logistics", "What services do you offer?", "Contact info"],
      ],
    },

    // ── Shippers ─────────────────────────────────────────────────────────
    {
      id: "shippers",
      patterns: [
        "\\bship(per|ping|ment)?s?\\b",
        "\\bsend\\s+(a|some|my)\\s+(load|freight|shipment)",
        "\\bmove\\s+(freight|a\\s+load|cargo)",
        "\\bneed\\s+to\\s+ship\\b",
        "\\bget\\s+(a\\s+)?quote\\b",
        "\\bquote\\s+(for|on)?\\s*(a\\s+)?(load|shipment)?",
        "\\bcost\\s+to\\s+ship",
        "\\bpricing\\b",
        "\\brate(s)?\\s+(for|to|on)\\b",
        "\\bhow\\s+much\\s+(to\\s+ship|does\\s+it\\s+cost)",
      ],
      responses: [
        "Great — we'd love to move freight for you. The fastest way to get a quote is:\n\n<strong>Call dispatch:</strong> 574.349.5600 (a real person, 24/7)\n<strong>Submit a shipper inquiry:</strong> <a href=\"/shippers/\">/shippers</a>\n\nOur dispatchers will ask about your origin/destination, weight, equipment type (dry van, reefer, flatbed, etc.), and pickup window. Most quotes go out within the hour during business hours.",
        "Happy to help. Here's how to get started shipping with Kopf:\n\n1. <strong>Quick rate?</strong> Call <strong>574.349.5600</strong> — dispatch is staffed 24/7\n2. <strong>New customer?</strong> Fill out the shipper form at <a href=\"/shippers/\">/shippers</a> — we'll get your account set up alongside your first quote\n3. <strong>Have a regular lane?</strong> Mention it on the call — we can often line up a dedicated truck\n\nWe move truckload (TL & LTL), refrigerated (reefer), flatbed/open-deck, bulk, and power-only across all 48 states.",
        "We've been brokering freight since 1966 and we'd love to add you to the customer list. Two ways forward:\n\n<strong>Right now:</strong> 574.349.5600 (dispatch, 24/7)\n<strong>This week:</strong> <a href=\"/shippers/\">/shippers</a> — submit your company info and we'll get you set up as a new customer + quote your first load\n\nIf the load's hot, the phone is faster. If you're shopping carriers for an upcoming move, the form gives us time to put a real proposal together.",
      ],
      suggestions: [
        ["What services do you offer?", "Where do you operate?", "Talk to dispatch"],
        ["Refrigerated freight?", "Flatbed / open-deck?", "LTL?"],
        ["Become a customer", "About Kopf", "Contact us"],
      ],
    },

    // ── Freight Agents (recruiting funnel #1) ────────────────────────────
    {
      id: "agents",
      patterns: [
        "\\b(freight\\s+)?agent(s|cy)?\\b",
        "\\bbecome\\s+(an?\\s+)?agent\\b",
        "\\bagent\\s+program\\b",
        "\\bagent\\s+(opportunity|opportunities|application|apply)",
        "\\bindependent\\s+agent\\b",
        "\\brun\\s+(my\\s+own|an?)\\s+agency\\b",
        "\\bbroker\\s+(career|opportunity|job)\\b",
      ],
      responses: [
        "We're always looking for experienced freight agents. Here's the short version:\n\n– <strong>Weekly settlement</strong> on clean paperwork\n– <strong>Confidential</strong> — your customer list stays yours\n– <strong>Bring your book</strong> or grow into ours — we support both\n– 50+ years of broker reputation behind every load you cover\n\n<strong>Apply:</strong> <a href=\"/agent/\">/agent</a>\n<strong>Or call:</strong> 574.349.5600 and ask for the agent program",
        "The Kopf agent program is built around independence: you run your book, we provide the carrier network, credit lines, billing, and tech.\n\n<strong>What we look for:</strong>\n– Brokerage or freight-sales experience\n– Existing customer relationships (helpful but not required)\n– Self-starter with a clean reputation in the industry\n\n<strong>Pay:</strong> weekly commission settlement upon billing\n<strong>Apply:</strong> <a href=\"/agent/\">/agent</a> — application stays strictly confidential",
        "Glad you're considering Kopf. Quick agent program facts:\n\n<strong>Weekly pay</strong> on settled loads with clean paperwork\n<strong>Your customers stay yours</strong> — we don't poach\n<strong>Tech + back-office</strong> handled, so you focus on freight\n<strong>Family-owned</strong> brokerage since 1966 (Elkhart, IN)\n\nReady to talk? <a href=\"/agent/\">Apply here</a> or call <strong>574.349.5600</strong> and ask for our agent recruiter.",
      ],
      suggestions: [
        ["What's the commission?", "Do I need my own customers?", "Apply now"],
        ["Tech and back-office support?", "About Kopf", "Contact recruiting"],
      ],
    },

    // ── Drivers (recruiting funnel #2) ───────────────────────────────────
    {
      id: "drivers",
      patterns: [
        "\\bdriver\\s*(s|jobs?|position|opportunity|opportunities|application|apply)?\\b",
        "\\bdriving\\s+(job|opportunity|career)",
        "\\bcompany\\s+driver\\b",
        "\\bowner\\s*[-\\s]?\\s*operator\\s*(s)?\\b",
        "\\bo\\W*o\\W*driver\\b",
        "\\blease\\s+(purchase|operator)\\b",
        "\\bhiring\\s+(driver|truck)",
        "\\bcdl\\b",
        "\\bteam\\s+driving\\b",
        "\\bdrive\\s+for\\s+(you|kopf)",
        "\\btrucker\\s+(jobs?|opportunity)?",
      ],
      responses: [
        "We hire both <strong>company drivers</strong> and <strong>owner-operators</strong>. Quick highlights:\n\n– Home-time options: regional, OTR, dedicated\n– Modern equipment, well-maintained\n– Weekly pay\n– 24/7 dispatch backing you up\n\n<strong>Apply:</strong> <a href=\"/drivers/\">/drivers</a>\n<strong>Or call recruiting:</strong> 574.349.5600",
        "Great — we'd love to talk. Two paths:\n\n<strong>Company driver:</strong> Hourly/mileage pay, benefits, regional and OTR runs\n<strong>Owner-operator:</strong> Lease your equipment to Kopf, keep your independence, plug into our freight + back-office\n\nApply at <a href=\"/drivers/\">/drivers</a> or call <strong>574.349.5600</strong> and ask for driver recruiting. Application takes about 10 minutes.",
        "Driving for Kopf:\n\n<strong>Equipment:</strong> Late-model tractors, well-maintained trailers (van, reefer, flatbed)\n<strong>Routes:</strong> Regional and OTR, plus dedicated dispatched freight\n<strong>Pay:</strong> Weekly, plus performance bonuses\n<strong>People:</strong> Family-owned since 1966 — dispatch knows your name\n\n<a href=\"/drivers/\">Apply here</a>, or call 574.349.5600 to talk to a recruiter directly.",
      ],
      suggestions: [
        ["Company driver?", "Owner-operator?", "Apply now"],
        ["Pay and benefits?", "Home time?", "Equipment?"],
        ["Talk to recruiting", "About Kopf", "Contact us"],
      ],
    },

    // ── Carriers (independent fleets) ────────────────────────────────────
    {
      id: "carriers",
      patterns: [
        "\\bcarrier\\s*(s|partnership|setup|application)?\\b",
        "\\bbecome\\s+(a\\s+)?carrier\\b",
        "\\brun\\s+(loads?|freight)\\s+for\\s+(you|kopf)",
        "\\bhaul\\s+(loads?|freight|for)\\b",
        "\\bcarrier\\s+packet\\b",
        "\\bget\\s+(loads?|freight)\\b",
        "\\bmc\\s+(number|authority)\\b",
        "\\bauthority\\s+\\d{4,}\\b",
      ],
      responses: [
        "Welcome — we work with carriers across all 48 states. To get set up to run our freight:\n\n<strong>1. Carrier setup</strong> — we use RMIS for paperwork. Visit <a href=\"https://www.rmissecure.com\" target=\"_blank\" rel=\"noopener\">RMIS</a> and request setup with Kopf Logistics Group.\n<strong>2. Find loads</strong> — we post on the major load boards (DAT, Truckstop) and through Trucker Path\n<strong>3. Call dispatch:</strong> 574.349.5600 for direct freight conversations\n\nWe expect: active MC, clean safety rating, $1M auto liability, $100K cargo. Standard stuff.",
        "Sure — we're always looking for reliable carrier partners. Quick onboarding:\n\n– <strong>Setup paperwork</strong> through RMIS (we'll send a link, or you can request setup with Kopf Logistics Group on <a href=\"https://www.rmissecure.com\" target=\"_blank\" rel=\"noopener\">rmissecure.com</a>)\n– <strong>Insurance:</strong> $1M auto liability, $100K cargo (standard)\n– <strong>Safety:</strong> Active MC, satisfactory FMCSA rating\n\nOnce you're set up, dispatch can offer freight directly. Call <strong>574.349.5600</strong> with questions.",
      ],
      suggestions: [
        ["Insurance requirements?", "Setup paperwork?", "Talk to dispatch"],
        ["Driver opportunities?", "About Kopf", "Contact us"],
      ],
    },

    // ── Services / equipment types ───────────────────────────────────────
    {
      id: "services",
      patterns: [
        "\\bservices?\\b",
        "\\bwhat\\s+do\\s+you\\s+(do|offer|haul|move)",
        "\\btruck\\s*load\\b",
        "\\b(less\\s+than\\s+truckload|ltl)\\b",
        "\\b(refrigerated|reefer|temperature\\s*controlled|cold\\s+chain)\\b",
        "\\b(flatbed|open\\s*deck|step\\s*deck)\\b",
        "\\b(power\\s*only|drop\\s*hook|trailer\\s*interchange)\\b",
        "\\bbulk\\b",
        "\\b(dry\\s+van|van\\s+freight)\\b",
        "\\b(dedicated|expedited|hot\\s*shot)\\b",
        "\\bequipment\\s+types?",
      ],
      responses: [
        "We move freight across every major mode:\n\n<strong>Truckload (TL):</strong> Dry van, dedicated, regional, OTR\n<strong>Less-than-truckload (LTL):</strong> Partial loads with major LTL carriers\n<strong>Refrigerated (reefer):</strong> Temperature-controlled, food-grade\n<strong>Flatbed / open-deck:</strong> Steel, lumber, machinery, oversize\n<strong>Bulk transport:</strong> Liquid and dry bulk\n<strong>Power-only / drop-hook:</strong> We supply the tractor, you provide the trailer (or vice versa)\n<strong>Trailer interchange:</strong> For carriers needing equipment\n\nCall dispatch at <strong>574.349.5600</strong> or visit <a href=\"/shippers/\">/shippers</a> to talk about your specific freight.",
        "Our service lines:\n\n– <strong>Truckload</strong> (van, dedicated)\n– <strong>LTL</strong> (less-than-truckload)\n– <strong>Refrigerated</strong> / temperature-controlled\n– <strong>Flatbed</strong> / open-deck / step-deck\n– <strong>Bulk</strong> (liquid + dry)\n– <strong>Power-only</strong> & drop-hook\n– <strong>Trailer interchange</strong>\n\nWe operate across all 48 states with terminals in Elkhart IN, Athens GA, and Seaford DE. What kind of freight are you moving?",
      ],
      suggestions: [
        ["I want to ship freight", "Refrigerated?", "Flatbed?"],
        ["Where do you operate?", "Get a quote", "Talk to dispatch"],
      ],
    },

    // ── About / company ──────────────────────────────────────────────────
    {
      id: "about",
      patterns: [
        "\\babout\\s+(kopf|the\\s+company|you)",
        "\\bcompany\\s+(history|story|info|background)",
        "\\bwho\\s+(are|is)\\s+(you|kopf)",
        "\\bhow\\s+long\\s+(have\\s+you|has\\s+kopf)",
        "\\b(family\\s*owned|family\\s*business)\\b",
        "\\b(history|founded|established|since|1966)\\b",
        "\\bownership\\b",
      ],
      responses: [
        "Kopf Logistics Group was founded in <strong>1966</strong> in Elkhart, Indiana, and we've been family-owned ever since. We started as a regional trucking outfit and grew into a full-service freight brokerage moving freight across all 48 states.\n\n<strong>Today:</strong>\n– 50+ years brokering freight\n– Terminals in Elkhart IN, Athens GA, Seaford DE\n– Family-owned and operated\n– Serving shippers, carriers, drivers, and freight agents\n\nLearn more on <a href=\"/about/\">our about page</a>.",
        "Kopf has been at it since 1966 — over half a century of family ownership and freight relationships.\n\nWe started in <strong>Elkhart, Indiana</strong> and grew the agent network and terminal footprint from there. Today we cover the lower 48 with a full mix of equipment types (dry van, reefer, flatbed, bulk, power-only).\n\nFull company story: <a href=\"/about/\">/about</a>",
      ],
      suggestions: [
        ["Where are you located?", "What services do you offer?", "Contact us"],
        ["Become an agent", "Driver opportunities", "Ship freight"],
      ],
    },

    // ── Location / terminals / hours ─────────────────────────────────────
    {
      id: "location",
      patterns: [
        "\\b(where\\s+(are\\s+)?you|location|address|terminals?|office)",
        "\\b(elkhart|athens|seaford|indiana|georgia|delaware)\\b",
        "\\b(headquarters|hq)\\b",
        "\\boffice\\s+hours?",
        "\\b(when\\s+(are\\s+)?(you|the\\s+office)\\s+(open|available))",
        "\\b(hours\\s+of\\s+operation|business\\s+hours)",
        "\\b(parking|directions)\\b",
      ],
      responses: [
        "<strong>Headquarters:</strong> Elkhart, Indiana (since 1966)\n\n<strong>Terminals:</strong>\n– Elkhart, IN (HQ)\n– Athens, GA\n– Seaford, DE\n\n<strong>Office hours:</strong> Mon–Fri 8 AM – 5 PM ET\n<strong>Dispatch:</strong> 24/7 at 574.349.5600\n\nFull contact info on <a href=\"/contact/\">our contact page</a>.",
        "We're headquartered in Elkhart, IN with terminals in Athens, GA and Seaford, DE.\n\n<strong>Office:</strong> Mon–Fri 8 AM – 5 PM ET\n<strong>Dispatch:</strong> Around the clock — 574.349.5600\n\nNeed to come visit or send paperwork? Use the form at <a href=\"/contact/\">/contact</a> and we'll route you to the right person.",
      ],
      suggestions: [
        ["Contact info", "What services do you offer?", "Talk to dispatch"],
        ["About Kopf", "Driver opportunities", "Ship freight"],
      ],
    },

    // ── Contact / phone / email ──────────────────────────────────────────
    {
      id: "contact",
      patterns: [
        "\\b(contact|reach\\s+(you|out|someone)|get\\s+in\\s+touch)\\b",
        "\\b(phone|number|call|telephone)\\b",
        "\\bemail\\b",
        "\\b574\\W*349\\W*5600\\b",
        "\\bspeak\\s+(to|with)\\s+(someone|a\\s+person|a\\s+human|dispatch)",
        "\\bcustomer\\s+service\\b",
      ],
      responses: [
        "<strong>Phone (dispatch, 24/7):</strong> 574.349.5600\n<strong>Recruiting email:</strong> recruiter@kopflogisticsgroup.com\n<strong>General contact form:</strong> <a href=\"/contact/\">/contact</a>\n\nFor freight quotes, call dispatch — fastest path. For driver/agent applications, the forms at <a href=\"/drivers/\">/drivers</a> and <a href=\"/agent/\">/agent</a> are the fastest route.",
        "Best ways to reach us:\n\n– <strong>574.349.5600</strong> — dispatch is always staffed (24/7)\n– <strong>recruiter@kopflogisticsgroup.com</strong> — for driver/agent recruiting\n– <strong><a href=\"/contact/\">/contact</a></strong> — general contact form, routes to the right person\n\nWhat's the topic? Quote, application, or general question?",
      ],
      suggestions: [
        ["Get a quote", "Apply (driver)", "Apply (agent)"],
        ["Office hours?", "Where are you located?", "About Kopf"],
      ],
    },

    // ── Track a load ─────────────────────────────────────────────────────
    {
      id: "tracking",
      patterns: [
        "\\b(track|tracking|status\\s+of)\\s+(a|my|the)?\\s*(load|shipment|order|truck|freight)",
        "\\bwhere'?s\\s+(my|the)\\s+(load|shipment|truck|freight)",
        "\\bload\\s+(number|#|update|status)",
        "\\beta\\s+(on|for)?\\b",
      ],
      responses: [
        "For load tracking, the fastest path is to call dispatch directly — they have live visibility on every truck:\n\n<strong>Dispatch (24/7):</strong> 574.349.5600\n\nHave your <strong>load number or PO</strong> ready and they'll get you a status in under a minute. If it's outside business hours, the on-call dispatcher will still pick up.",
        "Call dispatch at <strong>574.349.5600</strong> with your load number — they have real-time visibility and can give you an ETA on the spot. Dispatch is staffed 24/7, including holidays.",
      ],
      suggestions: [
        ["Talk to dispatch", "I want to ship freight", "Contact us"],
      ],
    },

    // ── Blog / news / content ────────────────────────────────────────────
    {
      id: "blog",
      patterns: [
        "\\b(blog|news|articles?|posts?|updates?|content)\\b",
        "\\b(industry\\s+news|freight\\s+news|trucking\\s+news)",
      ],
      responses: [
        "We publish regularly on industry topics, regulations, technology, and Kopf company updates. Browse it all at <a href=\"/blog/\">/blog</a>.",
      ],
      suggestions: [
        ["About Kopf", "Services", "Contact us"],
      ],
    },

    // ── Thanks / closer ──────────────────────────────────────────────────
    {
      id: "thanks",
      patterns: [
        "\\b(thank|thanks|thx|ty|appreciate|appreciated)\\b",
        "\\bthat\\s+help",
        "\\bgot\\s+it\\b",
        "\\b(perfect|awesome|great|sweet|cool|nice)\\b",
      ],
      responses: [
        "You bet. If anything else comes up, I'm right here. And dispatch (574.349.5600) is always one call away.",
        "Anytime. Holler if you need more — and welcome to Kopf if we end up working together!",
        "Glad I could help. Anything else I can point you toward?",
      ],
      suggestions: [
        ["Get a quote", "Apply (driver)", "Apply (agent)"],
        ["About Kopf", "Services", "Contact us"],
      ],
    },
  ],
};
