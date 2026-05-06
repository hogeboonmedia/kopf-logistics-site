import type { ChatConfig } from "./types";

/**
 * Kopf Logistics Group chatbot config.
 *
 * Conversation design principles (from research synthesis in
 * docs/chatbot-improvements.md):
 *
 *   1. SHORT bubbles — keep individual `<br><br>`-separated chunks under
 *      ~180 characters. Long monologues kill engagement.
 *
 *   2. EVERY response ends with a question or a clear next-step CTA.
 *      The bot's job is to keep the visitor in the conversation, not
 *      to deliver a brochure.
 *
 *   3. MULTI-BUBBLE — break responses with `<br><br>`. The Chatbot
 *      component renders each chunk as a separate bubble with a
 *      typing-pause between them, mimicking real text-message cadence.
 *
 *   4. PERSONA FLOWS — high-intent intents (shippers, drivers, agents,
 *      carriers) trigger a structured 2-3 question flow that pre-qualifies
 *      the lead before the contact form appears. Each answer is captured
 *      into extra_fields so dispatch knows what they're calling about.
 *
 *   5. INDUSTRY-FLUENT TONE — use freight terms correctly (RPM, deadhead,
 *      drop-and-hook, lumper, detention). Never use buzzword phrasings
 *      ("optimized", "best-in-class") — they signal you don't actually
 *      understand the industry and lose credibility instantly.
 */

export const kopfChatConfig: ChatConfig = {
  company: {
    name: "Kopf Logistics",
    tagline: "Family-owned freight brokerage since 1966",
    poweredBy: "Hogeboon Media",
  },

  behavior: {
    // Two-bubble greeting — bot introduces itself as Kayla on first
    // contact, then asks what they need. The second bubble appears
    // 1.2s after the first via the multi-bubble renderer. Default
    // suggestions below double as the role chips.
    //
    // Kayla is the bot's persona — referenced in the LLM system prompt
    // (app/api/chat/route.ts) too. Introducing her here makes the LLM
    // fallback feel continuous when it kicks in later in the conversation.
    greetings: [
      "Hey — I'm Kayla, Kopf's assistant.<br><br>What brings you here today?",
      "Hi! I'm Kayla. Glad you stopped by.<br><br>What can I help with?",
      "Welcome to Kopf — I'm Kayla.<br><br>What are you looking for?",
    ],
    // Role-routing chips shown on first open. Each maps cleanly to a
    // pattern in one of the four persona intents below.
    defaultSuggestions: [
      [
        "I want to ship freight",
        "Driver opportunities",
        "Become a carrier",
        "Freight agent program",
      ],
    ],
    privacyNotice:
      "This chat stays on your device. Your conversation isn't stored or shared.",
    fallbackMessages: [
      "Hmm, that's not quite landing for me.<br><br>I can help with shipping, driver/agent applications, or general info about Kopf — which one's closest?",
      "Not sure I caught that.<br><br>Are you looking to ship freight, drive for us, or run an agency?",
      "I don't have a great answer for that one.<br><br>Want me to connect you with a person? Dispatch is at <strong>574.349.5600</strong>, or I can grab your info and have someone call you.",
    ],
    frustrationResponse:
      "Sorry I'm coming up short on this.<br><br>You're better off talking to a person — dispatch is at <strong>574.349.5600</strong> (24/7).<br><br>Or drop your info and someone will call you back within 30 minutes. Which works?",
    frustrationSuggestions: [
      "Have someone call me",
      "I'll call dispatch",
      "Try a different question",
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
        "Hey! What can I help you with — shipping freight, driver work, or something else?",
        "Hi. Are you looking to ship, drive, or run an agency with us?",
        "Hello. What brings you in today?",
      ],
      suggestions: [
        ["I want to ship freight", "Driver opportunities", "Freight agent program"],
        ["Become a carrier", "About Kopf", "Contact info"],
      ],
    },

    // ── Shippers (high-intent — flow + lead capture) ─────────────────────
    {
      id: "shippers",
      leadCapture: true,
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
      // Flow runs INSTEAD of `responses` when this intent fires. Three
      // quick questions pre-qualify the lead so dispatch knows what
      // they're quoting before they pick up the phone.
      flow: [
        {
          field: "lane",
          question:
            "Got it — happy to get you a rate.<br><br>What's the lane (origin → destination)?",
        },
        {
          field: "equipment",
          question: "What kind of equipment do you need?",
          chips: ["Dry van", "Reefer", "Flatbed", "Bulk", "Power-only", "Not sure"],
        },
        {
          field: "timing",
          question: "When do you need pickup?",
          chips: ["ASAP / today", "This week", "Next week", "Recurring lane"],
        },
      ],
      // Fallback responses if the flow is somehow skipped (legacy).
      responses: [
        "We'd love to move freight for you.<br><br>Fastest path: call dispatch at <strong>574.349.5600</strong> (real person, 24/7).<br><br>Want me to grab your details and have a dispatcher call you back instead?",
      ],
      suggestions: [
        ["Have someone call me", "Refrigerated freight?", "Flatbed?"],
      ],
    },

    // ── Drivers (high-intent — flow + lead capture) ──────────────────────
    {
      id: "drivers",
      leadCapture: true,
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
      flow: [
        {
          field: "driver_type",
          question:
            "Glad you're checking us out.<br><br>Are you a company driver or owner-operator?",
          chips: ["Company driver", "Owner-operator", "Either / both"],
        },
        {
          field: "equipment",
          question: "What do you run?",
          chips: ["Dry van", "Reefer", "Flatbed", "Multiple"],
        },
        {
          field: "home_state",
          question:
            "What state are you based in? (helps us match you with the right lanes)",
        },
      ],
      responses: [
        "We hire company drivers AND owner-operators.<br><br>Are you looking for company driver work or running your own truck?",
      ],
      suggestions: [
        ["Company driver", "Owner-operator", "Either / both"],
      ],
    },

    // ── Freight Agents (high-intent — flow + lead capture) ───────────────
    // NOTE on regex length: the matcher scores by pattern.length and the
    // longest match wins. The "about" intent has patterns up to 41 chars
    // ("\\bcompany\\s+(history|story|info|background)"), so any agent
    // pattern shorter than that loses when phrasing overlaps (e.g.,
    // "tell me about your freight agent program"). All patterns below
    // are intentionally at-or-above 42 chars and include explicit
    // freight-agent context to win the score on common phrasings.
    {
      id: "agents",
      leadCapture: true,
      patterns: [
        // High-confidence "I want to be an agent" phrasings (longest wins)
        "\\b(want|wanna|like|looking|interested|hoping)\\s+to\\s+(be|become|join|work\\s+as)\\s+(an?\\s+)?(freight\\s+)?agent\\b",
        "\\b(how\\s+(do|can)\\s+i\\s+|tell\\s+me\\s+about\\s+|info\\s+(on|about)\\s+|details?\\s+(on|about)\\s+)?(becoming|being|joining)\\s+(an?\\s+)?(freight\\s+)?agent\\b",
        "\\b(freight\\s+)?agent\\s+(program|opportunity|opportunities|application|apply|info|details|recruiting|recruiter|jobs?|career|careers|hiring|sign[\\s-]*up)\\b",
        "\\b(tell\\s+me\\s+about\\s+|info\\s+(on|about)\\s+|what\\s+(is|about)\\s+)?(your|the|kopf'?s?)\\s+(freight\\s+)?agent\\s+(program|opportunity|model)\\b",
        "\\b(independent|freight)\\s+agent\\s+(program|opportunity|application|info|career|career\\s+path|details?)\\b",
        // Direct keyword catches (kept for safety; also length-padded with anchors so they still beat about-history)
        "(?:^|\\s|[.!?])(?:freight\\s+)?agent(?:s|cy|cies)?(?=[\\s.!?,;:'\"\\-]|$)",
        "\\bbecome\\s+(an?\\s+)?(freight\\s+)?agent\\b(?:\\s+with\\s+(you|kopf))?",
        "\\bagent\\s+program(?:me)?(?:\\s+at\\s+kopf)?\\b",
        "\\bindependent\\s+(freight\\s+)?agent(?:\\s+program)?\\b",
        "\\brun\\s+(my\\s+own|an?)\\s+(freight\\s+)?(agency|agent\\s+book)\\b",
        "\\bbroker\\s+(career|opportunity|job|career\\s+path|recruiting)\\b",
      ],
      flow: [
        {
          field: "book_status",
          question:
            "Glad you're considering us.<br><br>Are you bringing an existing book of business, or starting fresh?",
          chips: ["I have a book", "Starting fresh", "Mix of both"],
        },
        {
          field: "experience_years",
          question: "Years of brokerage or freight-sales experience?",
          chips: ["Less than 1", "1–3 years", "3–5 years", "5+ years"],
        },
        {
          field: "annual_gross",
          question: "Roughly what's your annual gross? (we keep this confidential)",
          chips: [
            "Under $500K",
            "$500K – $2M",
            "$2M – $5M",
            "$5M+",
            "N/A — starting fresh",
          ],
        },
      ],
      responses: [
        "Great — Kopf's agent program is one of our most direct routes to growth.<br><br>You keep your customers (we don't poach), get weekly commission on clean paperwork, and plug into our carrier network, credit lines, billing/collections, TMS, and back-office.<br><br>Quick question to point you to the right person — are you bringing an existing book of business, or starting fresh?",
        "Happy to tell you about it. Independent agents at Kopf keep their customers, get paid weekly on billed paperwork, and get full back-office support — carrier network, credit lines, billing, TMS, insurance options.<br><br>To get you to the right recruiter, are you coming in with an existing book, or starting from zero?",
      ],
      suggestions: [["I have a book", "Starting fresh", "Mix of both"]],
    },

    // ── Carriers (high-intent — flow + lead capture) ─────────────────────
    {
      id: "carriers",
      leadCapture: true,
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
      flow: [
        {
          field: "active_mc",
          question:
            "Welcome — happy to get you set up.<br><br>Do you have an active MC?",
          chips: ["Yes, active MC", "No / not yet", "In progress"],
        },
        {
          field: "truck_count",
          question: "How many trucks?",
          chips: ["1", "2–5", "6–20", "20+"],
        },
        {
          field: "lanes",
          question: "What lanes do you typically run?",
        },
      ],
      responses: [
        "Welcome — we work with carriers across all 48 states.<br><br>Do you have an active MC?",
      ],
      suggestions: [["Yes, active MC", "No / not yet"]],
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
        "We move every major mode: TL, LTL, reefer, flatbed/open-deck, bulk, power-only, drop-and-hook.<br><br>What kind of freight are you working with?",
        "Truckload, LTL, refrigerated, flatbed, bulk, power-only — all 48 states.<br><br>Looking for a specific equipment type?",
      ],
      suggestions: [
        ["I want to ship freight", "Refrigerated?", "Flatbed?"],
        ["Where do you operate?", "Have someone call me"],
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
        "Kopf's been at it since 1966 — family-owned since day one, headquartered in Elkhart, IN.<br><br>What drew you to ask about us?",
        "60+ years in business, family-owned, terminals in Elkhart IN, Athens GA, and Seaford DE.<br><br>Are you here as a shipper, driver, or agent?",
      ],
      suggestions: [
        ["I want to ship freight", "Driver opportunities"],
        ["Freight agent program", "Where are you located?"],
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
        "HQ is Elkhart, IN. Terminals in Athens, GA and Seaford, DE.<br><br>Office hours Mon–Fri 8–5 ET, but dispatch is staffed 24/7 at <strong>574.349.5600</strong>.<br><br>What can I help you with?",
      ],
      suggestions: [
        ["I want to ship freight", "Driver opportunities", "Have someone call me"],
      ],
    },

    // ── Contact / phone / email ──────────────────────────────────────────
    {
      id: "contact",
      leadCapture: true,
      patterns: [
        "\\b(contact|reach\\s+(you|out|someone)|get\\s+in\\s+touch)\\b",
        "\\b(phone|number|call|telephone)\\b",
        "\\bemail\\b",
        "\\b574\\W*349\\W*5600\\b",
        "\\bspeak\\s+(to|with)\\s+(someone|a\\s+person|a\\s+human|dispatch)",
        "\\bcustomer\\s+service\\b",
        "\\bhave\\s+someone\\s+call\\s+me\\b",
      ],
      responses: [
        "Easiest is <strong>574.349.5600</strong> — dispatch picks up 24/7.<br><br>Or I can grab your info and have someone call you back. Which works better?",
        "Dispatch line: <strong>574.349.5600</strong> (24/7).<br><br>Want me to set up a callback instead?",
      ],
      suggestions: [
        ["Have someone call me", "I'll call them"],
      ],
    },

    // ── Track a load ─────────────────────────────────────────────────────
    {
      id: "tracking",
      leadCapture: true,
      patterns: [
        "\\b(track|tracking|status\\s+of)\\s+(a|my|the)?\\s*(load|shipment|order|truck|freight)",
        "\\bwhere'?s\\s+(my|the)\\s+(load|shipment|truck|freight)",
        "\\bload\\s+(number|#|update|status)",
        "\\beta\\s+(on|for)?\\b",
      ],
      responses: [
        "For a live status, dispatch needs your load number — they have real-time visibility.<br><br>Quickest path: <strong>574.349.5600</strong>. Want me to grab your info and have them call you instead?",
      ],
      suggestions: [
        ["Have someone call me", "I'll call dispatch"],
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
        "Industry articles and Kopf updates live at <a href=\"/blog/\">/blog</a>.<br><br>Anything specific you're looking for?",
      ],
      suggestions: [
        ["I want to ship freight", "Driver opportunities", "About Kopf"],
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
        "You bet. Anything else I can help with?",
        "Glad to help. Anything else on your mind?",
        "Anytime. Want me to grab your info so someone can follow up?",
      ],
      suggestions: [
        ["Have someone call me", "Tell me about services", "I'm good"],
      ],
    },
  ],
};
