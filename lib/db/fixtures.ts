// Realistic SG seed data. All fictitious.
// Designed with 5 semantic clusters for a clear vector-map demo:
// Tech (ML/dev) · Design (UX/motion) · Education · Events/Media · Logistics/Content

export interface SeedProfile {
  nric: string;
  handle: string;
  display_name: string;
  headline: string;
  bio: string;
  role: "freelancer" | "employer" | "both";
  lat: number | null;
  lon: number | null;
  certs: SeedCert[];
  portfolio: SeedPortfolio[];
}

export interface SeedCert {
  kind: "wsq" | "university" | "accreditation" | "other";
  issuer: string;
  title: string;
  issued_at: string;
  extracted_skills: string[];
  verified?: boolean;
}

export interface SeedPortfolio {
  kind: "video" | "website" | "image" | "writeup";
  title: string;
  description?: string;
  external_url?: string;
  tags: string[];
}

export interface SeedGig {
  employer_handle: string;
  title: string;
  description: string;
  skills: string[];
  location: string;
  category: string;
  budget_cents: number;
  budget_kind: "fixed" | "hourly";
  questions?: string[];
  requires_employer_approval?: boolean;
  is_instant?: boolean;
  instant_urgency?: "now" | "today" | "this_week";
  applications_close_at?: string;
  starts_at?: string;
  ends_at?: string;
  duration_label?: string;
  lat?: number;
  lon?: number;
}

export interface SeedApplication {
  applicant_handle: string;
  gig_title: string;
  status: "applied" | "interviewing" | "hired" | "rejected" | "withdrawn" | "offered";
  cover_note?: string;
}

// ─── FREELANCERS ────────────────────────────────────────────────────────────

export const FREELANCERS: SeedProfile[] = [
  // ── Tech cluster ──────────────────────────────────────────────────────────
  {
    nric: "S1111111A",
    handle: "aisha_ml",
    display_name: "Aisha Binte Rahmat",
    headline: "ML Engineer · NLP & LLM fine-tuning · ex-DSO",
    lat: 1.2940, lon: 103.7953, // Queenstown (near DSO)
    bio: "5 years building production NLP systems at DSO National Laboratories and a Series B AI startup. Specialise in LLM fine-tuning (LoRA/QLoRA), RAG pipelines, and MLOps on AWS. Now freelancing — available for 4–16 week contracts.",
    role: "freelancer",
    certs: [
      {
        kind: "university",
        issuer: "NTU",
        title: "B.Eng. in Computer Engineering",
        issued_at: "2019-05-20",
        extracted_skills: ["python", "machine learning", "nlp", "signal processing"],
        verified: true,
      },
      {
        kind: "accreditation",
        issuer: "AWS",
        title: "AWS Certified Machine Learning – Specialty",
        issued_at: "2023-03-14",
        extracted_skills: ["sagemaker", "aws", "mlops", "model deployment"],
        verified: true,
      },
    ],
    portfolio: [
      {
        kind: "writeup",
        title: "RAG pipeline for legal document search",
        description: "Built a retrieval-augmented generation system over 200k SG statutes. Reduced hallucination rate from 34% to 6% vs. vanilla GPT-4.",
        tags: ["rag", "llm", "python", "nlp"],
      },
      {
        kind: "website",
        title: "GitHub — ML projects",
        external_url: "https://github.com/example-aisha",
        tags: ["open-source", "pytorch", "huggingface"],
      },
    ],
  },
  {
    nric: "S2222222B",
    handle: "jun_wei",
    display_name: "Jun Wei Chen",
    headline: "Full-stack engineer · Next.js · Go · Supabase",
    lat: 1.3536, lon: 103.9443, // Bedok
    bio: "NUS Computer Science 2022. Year in Tokyo at a payments fintech, now freelancing full-time. Ship production apps fast — Next.js App Router, Go microservices, Postgres, Redis. Love working with small teams that move quickly.",
    role: "freelancer",
    certs: [
      {
        kind: "university",
        issuer: "NUS",
        title: "B.Comp. in Computer Science (Hons)",
        issued_at: "2022-06-15",
        extracted_skills: ["typescript", "go", "postgres", "distributed systems", "software architecture"],
        verified: true,
      },
      {
        kind: "accreditation",
        issuer: "SCS",
        title: "Certified IT Practitioner (Software)",
        issued_at: "2024-01-20",
        extracted_skills: ["software engineering", "code review", "agile"],
        verified: true,
      },
    ],
    portfolio: [
      {
        kind: "website",
        title: "PayGo — real-time payments demo",
        external_url: "https://example.com/junwei/paygo",
        tags: ["go", "websockets", "postgres", "nextjs"],
      },
      {
        kind: "writeup",
        title: "Migrating a monolith to Go microservices",
        description: "How we cut our p99 latency from 800ms to 60ms by splitting a Node.js monolith into 4 Go services behind an API gateway.",
        tags: ["go", "architecture", "performance"],
      },
    ],
  },

  // ── Design cluster ─────────────────────────────────────────────────────────
  {
    nric: "S3333333C",
    handle: "nadia_ux",
    display_name: "Nadia Lim",
    headline: "Senior UX designer · fintech & healthtech · ex-GovTech",
    lat: 1.3343, lon: 103.8456, // Toa Payoh
    bio: "8 years in product design. Led UX for LifeSG and MyInfo at GovTech, then 2 years at a Series A healthtech. Expertise: research-led design, complex data-dense flows, design systems. Available for 8–16 week fintech/govtech engagements.",
    role: "freelancer",
    certs: [
      {
        kind: "university",
        issuer: "NTU",
        title: "B.A. (Hons) in Communication Studies",
        issued_at: "2016-07-10",
        extracted_skills: ["ux research", "information architecture", "usability testing"],
        verified: true,
      },
      {
        kind: "wsq",
        issuer: "SkillsFuture SG",
        title: "WSQ Advanced Certificate in UX Design",
        issued_at: "2020-09-01",
        extracted_skills: ["figma", "wireframing", "prototyping", "accessibility", "design systems"],
        verified: true,
      },
    ],
    portfolio: [
      {
        kind: "writeup",
        title: "GovTech LifeSG nav redesign — 31% drop-off reduction",
        description: "End-to-end redesign of the LifeSG mobile navigation. 8 weeks research → hi-fi → handoff. Reduced task completion time by 40%.",
        tags: ["ux", "govtech", "mobile", "case-study"],
      },
      {
        kind: "website",
        title: "UX portfolio",
        external_url: "https://example.com/nadia",
        tags: ["portfolio", "figma", "fintech"],
      },
    ],
  },
  {
    nric: "S4444444D",
    handle: "ravi_motion",
    display_name: "Ravi Kumar",
    headline: "Motion + brand designer · After Effects · Rive · Figma",
    lat: 1.3508, lon: 103.8490, // Bishan
    bio: "7 years crafting motion graphics and brand identities for SG startups. Fluent in After Effects, Rive, Cinema 4D, and Figma. Shipped 40+ product launch reels and 12 full brand systems. Remote-first.",
    role: "freelancer",
    certs: [
      {
        kind: "university",
        issuer: "NUS",
        title: "B.A. in Visual Communication",
        issued_at: "2017-05-18",
        extracted_skills: ["visual design", "typography", "brand identity", "illustration"],
        verified: true,
      },
    ],
    portfolio: [
      {
        kind: "video",
        title: "Product launch reel — Series A fintech",
        description: "30-second animated hero for a payments startup's Series A reveal. After Effects + Lottie.",
        tags: ["motion", "after effects", "fintech", "animation"],
      },
      {
        kind: "website",
        title: "Ravi's motion portfolio",
        external_url: "https://example.com/ravi",
        tags: ["motion", "rive", "brand"],
      },
    ],
  },

  // ── Education cluster ──────────────────────────────────────────────────────
  {
    nric: "S5555555E",
    handle: "priya_tutor",
    display_name: "Priya Krishnan",
    headline: "H2 Maths & Physics tutor · ACTA-certified · 92% distinctions",
    lat: 1.3343, lon: 103.8456, // Toa Payoh
    bio: "Six years teaching H2 Maths and H2 Physics. Previous batches: 92% distinctions in Maths, 85% in Physics. Small group (≤4) and 1-on-1. Also available for curriculum review and exam paper writing.",
    role: "freelancer",
    certs: [
      {
        kind: "university",
        issuer: "NTU",
        title: "B.Sc. in Physics with Mathematical Sciences",
        issued_at: "2018-06-12",
        extracted_skills: ["h2 maths", "h2 physics", "calculus", "mechanics", "statistics"],
        verified: true,
      },
      {
        kind: "wsq",
        issuer: "SkillsFuture SG",
        title: "WSQ Advanced Certificate in Training and Assessment (ACTA)",
        issued_at: "2021-02-10",
        extracted_skills: ["lesson planning", "adult learning", "assessment design", "curriculum development"],
        verified: true,
      },
    ],
    portfolio: [
      {
        kind: "writeup",
        title: "H2 Maths: from U-grade to A in 10 weeks",
        description: "System I use with struggling students — spaced retrieval, past-year drilling, weekly mock marking. 8 case studies attached.",
        tags: ["h2 maths", "a-level", "tuition", "methodology"],
      },
    ],
  },
  {
    nric: "S6666666F",
    handle: "marcus_psle",
    display_name: "Marcus Tay",
    headline: "PSLE English & Chinese tutor · curriculum writer · 11 years",
    lat: 1.3525, lon: 103.9434, // Tampines
    bio: "11 years of PSLE coaching at MOE schools and private tuition. Write my own exam papers and compo scaffolds. Tampines-based, can travel east/central. Also available to review and write curriculum for ed-tech companies.",
    role: "freelancer",
    certs: [
      {
        kind: "university",
        issuer: "NIE",
        title: "Postgraduate Diploma in Education (PGDE)",
        issued_at: "2013-07-01",
        extracted_skills: ["psle english", "psle chinese", "curriculum design", "lesson planning", "exam paper writing"],
        verified: true,
      },
      {
        kind: "wsq",
        issuer: "SkillsFuture SG",
        title: "WSQ Certificate in Instructional Design",
        issued_at: "2022-06-15",
        extracted_skills: ["instructional design", "e-learning", "content creation"],
        verified: true,
      },
    ],
    portfolio: [
      {
        kind: "writeup",
        title: "PSLE Composition Scaffold Framework",
        description: "3-step scaffold (Situation-Feeling-Reflection) that lifted my students' compo scores by an average of 8 marks.",
        tags: ["psle", "english", "curriculum", "methodology"],
      },
    ],
  },

  // ── Events / Media cluster ─────────────────────────────────────────────────
  {
    nric: "T0111111G",
    handle: "siti_emcee",
    display_name: "Siti Nurhaliza Bte Razak",
    headline: "Corporate emcee · EN / Malay / Mandarin · 180+ events",
    lat: 1.4297, lon: 103.8344, // Yishun
    bio: "Trilingual emcee specialising in corporate D&Ds, product launches, and Malay weddings. 180+ events, including Changi Airport Group, DBS, and MAS annual dinners. Based in Yishun, happy to travel nationwide.",
    role: "freelancer",
    certs: [
      {
        kind: "wsq",
        issuer: "Workforce Singapore",
        title: "WSQ Certificate in Event Operations",
        issued_at: "2019-11-15",
        extracted_skills: ["event hosting", "stage management", "public speaking", "script writing"],
        verified: true,
      },
    ],
    portfolio: [
      {
        kind: "video",
        title: "DBS SEA 2024 Annual Dinner highlight reel",
        description: "3-hour bilingual (EN/BM) emcee for 700 attendees at MBS. Script designed in 48 hours from brief.",
        tags: ["emcee", "corporate", "d&d", "bilingual"],
      },
      {
        kind: "writeup",
        title: "How I handle dead air at corporate events",
        description: "My 5-technique system for re-engaging a quiet room — developed over 180 events.",
        tags: ["emcee", "events", "public-speaking"],
      },
    ],
  },
  {
    nric: "T0222222H",
    handle: "jasmine_events",
    display_name: "Jasmine Ong",
    headline: "Wedding & event coordinator · 120 weddings · island-wide",
    lat: 1.3072, lon: 103.7899, // Buona Vista
    bio: "Freelance wedding and event coordinator with 120 weddings under my belt (Chinese, Malay, Indian, Western). Full-day coverage, day-of coordination, and vendor liaison. Also do corporate retreats and gala dinners.",
    role: "freelancer",
    certs: [
      {
        kind: "accreditation",
        issuer: "SECA",
        title: "Certified Event Coordinator (Singapore Events & Conventions Association)",
        issued_at: "2020-08-20",
        extracted_skills: ["event coordination", "vendor management", "day-of logistics", "budget management"],
        verified: true,
      },
    ],
    portfolio: [
      {
        kind: "writeup",
        title: "Coordinating a 500-pax garden wedding in 6 weeks",
        description: "How I pulled off a last-minute venue change and kept everything on schedule for a multi-faith 500-pax garden wedding.",
        tags: ["wedding", "coordination", "events", "logistics"],
      },
    ],
  },
  {
    nric: "S7777777I",
    handle: "jayden_video",
    display_name: "Jayden Lee",
    headline: "Videographer · Sony FX3 · drone · weddings & corporate",
    lat: 1.4009, lon: 103.9069, // Punggol
    bio: "Sony FX3 + DJI Mavic 3 Pro setup. 80 weddings shot. Also do corporate launch films, product demos, and event coverage. 2-week delivery on highlight reels. Based in Punggol.",
    role: "freelancer",
    certs: [],
    portfolio: [
      {
        kind: "video",
        title: "Wedding highlight reel 2025",
        description: "Compilation from 10 weddings in 2025 — Malay, Chinese, and Western ceremonies.",
        tags: ["wedding", "video", "drone", "highlight"],
      },
      {
        kind: "website",
        title: "Full portfolio",
        external_url: "https://example.com/jayden",
        tags: ["video", "corporate", "wedding"],
      },
    ],
  },

  // ── Logistics / Content cluster ────────────────────────────────────────────
  {
    nric: "S8888888J",
    handle: "hafiz_ops",
    display_name: "Hafiz Bin Osman",
    headline: "Logistics & ops contractor · 5 yrs · multi-site coordination",
    lat: 1.2940, lon: 103.7953, // Queenstown
    bio: "Experienced operations contractor specialising in multi-site logistics, event coordination, and supply chain support. 5 years managing end-to-end delivery operations and on-site event logistics across Singapore. Based in Queenstown.",
    role: "freelancer",
    certs: [
      {
        kind: "wsq",
        issuer: "SkillsFuture SG",
        title: "WSQ Supply Chain & Logistics Management",
        issued_at: "2022-03-10",
        extracted_skills: ["logistics coordination", "supply chain", "inventory management", "operations"],
        verified: true,
      },
      {
        kind: "accreditation",
        issuer: "Singapore Logistics Association",
        title: "Certified Logistics Professional",
        issued_at: "2023-01-05",
        extracted_skills: ["route optimisation", "warehouse ops", "last-mile delivery", "team coordination"],
        verified: true,
      },
    ],
    portfolio: [
      {
        kind: "writeup",
        title: "Multi-venue event logistics for 300-pax conference",
        description: "How I coordinated equipment, staffing, and delivery across 3 venues in a single day for a large-scale corporate conference at Changi.",
        tags: ["logistics", "events", "operations", "coordination"],
      },
    ],
  },
  {
    nric: "S9090909K",
    handle: "eden_tiktok",
    display_name: "Eden Goh",
    headline: "TikTok creator · 210k followers · lifestyle & tech · SG",
    lat: 1.3244, lon: 103.7985, // Bukit Timah
    bio: "210k followers on TikTok, 95% Singapore audience, averaging 500k views per video. I cover lifestyle, consumer tech, and local brand stories. Paid partnerships only — rates and media kit available on request.",
    role: "freelancer",
    certs: [],
    portfolio: [
      {
        kind: "website",
        title: "@edensg TikTok",
        external_url: "https://tiktok.com/@example-eden",
        tags: ["tiktok", "lifestyle", "influencer", "sg"],
      },
      {
        kind: "writeup",
        title: "Media kit — Q1 2025",
        description: "Audience breakdown, past brand partners, rate card, and case studies with view/engagement data.",
        tags: ["media-kit", "influencer", "content"],
      },
    ],
  },
  {
    nric: "S1010101L",
    handle: "zara_copy",
    display_name: "Zara Ng",
    headline: "Brand copywriter · fintech & SaaS · conversion-first",
    lat: 1.2753, lon: 103.8433, // Tanjong Pagar
    bio: "Ex-McCann Singapore. Freelancing since 2022. Worked with 15 SG startups on websites, email sequences, and pitch decks. My last 3 landing pages outperformed client benchmarks by 2–4x conversion lift. Conversion-first, not clever-first.",
    role: "freelancer",
    certs: [
      {
        kind: "university",
        issuer: "SMU",
        title: "B.B.A. in Marketing Communications",
        issued_at: "2019-08-05",
        extracted_skills: ["copywriting", "brand strategy", "content marketing", "email marketing"],
        verified: true,
      },
    ],
    portfolio: [
      {
        kind: "writeup",
        title: "Landing page rewrite — 3.1x trial signups",
        description: "Rewrote a SaaS pricing page. A/B tested over 3 weeks. Conversion went from 1.4% to 4.3%.",
        tags: ["copywriting", "saas", "landing-page", "conversion"],
      },
      {
        kind: "website",
        title: "Portfolio — web + email",
        external_url: "https://example.com/zara",
        tags: ["portfolio", "copywriting", "b2b"],
      },
    ],
  },
];

// ─── EMPLOYERS ────────────────────────────────────────────────────────────────

export const EMPLOYERS: SeedProfile[] = [
  {
    nric: "M1001001A",
    handle: "techsg_ventures",
    display_name: "Marcus Ho at TechSG Ventures",
    headline: "Fintech startup · Series A · hiring AI & eng talent",
    lat: 1.2847, lon: 103.8514, // Raffles Place
    bio: "We're a Series A payments fintech (12 full-timers). Hire ML contractors, full-stack engineers, and UX designers on project engagements.",
    role: "employer",
    certs: [],
    portfolio: [],
  },
  {
    nric: "M2002002B",
    handle: "nova_studio",
    display_name: "Clara Tan at Nova Studio",
    headline: "Design studio · fintech & healthtech · Tanjong Pagar",
    lat: 1.2753, lon: 103.8397, // Tanjong Pagar
    bio: "Boutique design studio. We hire UX contractors and motion designers for 6–12 week client engagements.",
    role: "employer",
    certs: [],
    portfolio: [],
  },
  {
    nric: "M3003003C",
    handle: "brightmind",
    display_name: "Sarah Lim at BrightMind Academy",
    headline: "Tuition centre network · 8 branches islandwide",
    lat: 1.3508, lon: 103.8490, // Bishan
    bio: "8 centres island-wide. We hire subject tutors, curriculum designers, and relief teachers on flexible contracts.",
    role: "employer",
    certs: [],
    portfolio: [],
  },
  {
    nric: "M4004004D",
    handle: "sunrise_events",
    display_name: "Lydia Chan at Sunrise Events",
    headline: "Full-service events agency · D&Ds, weddings, launches",
    lat: 1.2897, lon: 103.8501, // City Hall
    bio: "15-year-old events agency. We hire freelance emcees, videographers, event coordinators, and caterers for every event.",
    role: "employer",
    certs: [],
    portfolio: [],
  },
  {
    nric: "M5005005E",
    handle: "kopicraft",
    display_name: "Amir at KopiCraft Co",
    headline: "Retail & lifestyle brand · 18 outlets · SG-first",
    lat: 1.3099, lon: 103.8691, // Kallang
    bio: "Fast-growing kopitiam-style chain. Hire content creators, copywriters, and designers for brand campaigns and outlet launches.",
    role: "employer",
    certs: [],
    portfolio: [],
  },
];

// ─── GIGS ─────────────────────────────────────────────────────────────────────

export const GIGS: SeedGig[] = [
  // ── Tech ──────────────────────────────────────────────────────────────────
  {
    employer_handle: "techsg_ventures",
    title: "ML Engineer (NLP) — 12-week contract",
    description: "We need an ML engineer to fine-tune an LLM on transaction data for fraud classification and build a RAG pipeline over our internal knowledge base. Stack: Python, PyTorch, HuggingFace, AWS SageMaker. Fully remote.",
    skills: ["python", "pytorch", "nlp", "llm", "rag", "sagemaker"],
    location: "Remote",
    category: "tech",
    budget_cents: 14000,
    budget_kind: "hourly",
    questions: [
      "Describe an LLM fine-tuning project you shipped to production — what was the task and what metrics improved?",
      "How do you reduce hallucination in a RAG pipeline over domain-specific documents?",
    ],
  },
  {
    employer_handle: "techsg_ventures",
    title: "Full-stack Next.js contractor — 8 weeks",
    description: "3 feature modules in our Next.js 15 + Supabase stack. RSC, Server Actions, Postgres RLS. Must be comfortable with edge and streaming. Mostly remote, 1 check-in per week at our Raffles Place office.",
    skills: ["nextjs", "typescript", "supabase", "postgres", "server actions"],
    location: "Raffles Place (hybrid)",
    category: "tech",
    budget_cents: 12000,
    budget_kind: "hourly",
    questions: [
      "Share a production Next.js app using RSC and Server Actions — what were the hardest parts?",
      "Walk us through how you'd model a multi-tenant RLS policy in Postgres.",
    ],
  },
  {
    employer_handle: "nova_studio",
    title: "Backend Go API developer — 6 weeks",
    description: "Build 3 REST API modules (notifications, webhooks, rate-limiting) in our Go monolith. Postgres + Redis. Must be comfortable with goroutines and writing integration tests.",
    skills: ["go", "postgres", "redis", "rest api", "testing"],
    location: "Remote",
    category: "tech",
    budget_cents: 11000,
    budget_kind: "hourly",
    questions: [
      "Show us a production Go service you built — how did you handle concurrency and error propagation?",
    ],
  },

  // ── Design ────────────────────────────────────────────────────────────────
  {
    employer_handle: "techsg_ventures",
    title: "UX Lead contractor · 10-week fintech product",
    description: "We're rebuilding our merchant dashboard. Need an experienced UX contractor to own: discovery research → information architecture → hi-fi Figma → design-system component handoff. Work closely with our PM and 2 frontend devs.",
    skills: ["ux", "figma", "design systems", "user research", "fintech", "information architecture"],
    location: "Raffles Place (hybrid)",
    category: "design",
    budget_cents: 13000,
    budget_kind: "hourly",
    questions: [
      "Describe the most complex fintech flow you've redesigned. What was the research process?",
      "Walk us through a design system you shipped — how did you handle component documentation?",
      "What's your process when user research contradicts the PM's assumptions?",
    ],
  },
  {
    employer_handle: "nova_studio",
    title: "Senior UI designer — SaaS dashboard (6 weeks)",
    description: "We need a senior UI designer to produce hi-fi designs for a B2B SaaS analytics dashboard. Must have strong data visualisation chops. Figma. Remote.",
    skills: ["figma", "ui design", "data visualisation", "saas", "dashboard"],
    location: "Remote",
    category: "design",
    budget_cents: 9500,
    budget_kind: "hourly",
    questions: [
      "Show us a dashboard or data-heavy product you've designed. How did you approach hierarchy in data-dense screens?",
    ],
  },
  {
    employer_handle: "nova_studio",
    title: "Motion designer — product launch campaign (3 weeks)",
    description: "6 motion pieces for a healthtech product reveal: hero animation, 3 feature explainers, 2 social cuts. After Effects or Rive. Must be able to work from brand guidelines to finished file with minimal direction.",
    skills: ["motion design", "after effects", "rive", "animation", "brand"],
    location: "Remote",
    category: "design",
    budget_cents: 350000,
    budget_kind: "fixed",
    questions: [
      "Share a product launch animation you shipped. What software, and how long did it take?",
    ],
  },
  {
    employer_handle: "kopicraft",
    title: "Brand designer — outlet identity refresh",
    description: "Refresh the visual identity for 5 of our outlets (new menus, signage, packaging templates). Figma + Illustrator. 4-week project.",
    skills: ["brand design", "figma", "illustrator", "print design", "menu design"],
    location: "Kallang (hybrid)",
    category: "design",
    budget_cents: 450000,
    budget_kind: "fixed",
    questions: [
      "Share a brand identity project you designed for a F&B or retail client.",
    ],
  },

  // ── Education ─────────────────────────────────────────────────────────────
  {
    employer_handle: "brightmind",
    title: "H2 Maths & Physics tutor — weekly classes",
    description: "Teach H2 Maths and H2 Physics at our Bishan branch. 3 sessions/week, small groups of 4–6. Curriculum provided; tutors are expected to supplement with their own materials.",
    skills: ["h2 maths", "h2 physics", "a-level", "lesson planning", "small group tuition"],
    location: "Bishan",
    category: "tuition",
    budget_cents: 8500,
    budget_kind: "hourly",
    questions: [
      "Describe a lesson plan you designed for a struggling H2 student. What adjustments did you make?",
      "How do you handle a student who refuses to attempt exam questions?",
    ],
  },
  {
    employer_handle: "brightmind",
    title: "PSLE English relief tutor — 8 weeks",
    description: "Cover for our regular PSLE English tutor on maternity leave. 3 weekday evenings + Saturday morning. Tampines branch. Curriculum already set — just follow and supplement.",
    skills: ["psle english", "primary school", "tuition", "composition"],
    location: "Tampines",
    category: "tuition",
    budget_cents: 7000,
    budget_kind: "hourly",
  },
  {
    employer_handle: "brightmind",
    title: "O-level Science curriculum reviewer",
    description: "Review and quality-check our 10-chapter O-level Combined Science (Physics/Chemistry) curriculum. Flag errors, suggest exam question additions, improve explanation depth. 15 hours total, fully remote.",
    skills: ["o-level science", "physics", "chemistry", "curriculum review", "assessment design"],
    location: "Remote",
    category: "tuition",
    budget_cents: 950,
    budget_kind: "hourly",
  },

  // ── Events / Media ────────────────────────────────────────────────────────
  {
    employer_handle: "sunrise_events",
    title: "Bilingual emcee — corporate D&D, 800 pax",
    description: "Annual dinner for a government agency, 800 pax at Resorts World. Need a polished EN + Malay or Mandarin emcee. Script support provided. 4-hour event.",
    skills: ["emcee", "bilingual", "corporate events", "public speaking"],
    location: "Resorts World Sentosa",
    category: "events",
    budget_cents: 280000,
    budget_kind: "fixed",
    questions: [
      "Share a past corporate event clip (600+ pax preferred).",
      "How do you warm up a cold room in the opening 10 minutes?",
    ],
  },
  {
    employer_handle: "sunrise_events",
    title: "Wedding videographer — full-day Malay wedding",
    description: "Full-day coverage for a Malay wedding (nikah + solemnisation + dinner reception), 300 pax. Deliver 2-week turnaround on a highlight reel + full-length edit.",
    skills: ["videography", "wedding video", "drone", "editing", "colour grading"],
    location: "Jurong West",
    category: "video",
    budget_cents: 320000,
    budget_kind: "fixed",
    questions: [
      "Share your most recent Malay wedding highlight reel.",
    ],
  },
  {
    employer_handle: "sunrise_events",
    title: "Event coordinator — gala dinner 500 pax",
    description: "Day-of coordination for a 500-pax MNC gala dinner. Pre-event: vendor liaison, run-of-show. Day-of: floor management, AV coordination, VIP hosting.",
    skills: ["event coordination", "vendor management", "day-of logistics", "gala dinner"],
    location: "Marina Bay Sands",
    category: "events",
    budget_cents: 220000,
    budget_kind: "fixed",
  },

  // ── Logistics / Content ────────────────────────────────────────────────────
  {
    employer_handle: "kopicraft",
    title: "TikTok creator partnership — F&B campaign (3 videos)",
    description: "Paid partnership for our new menu launch. 3 TikToks over 4 weeks. Must have 100k+ SG followers, strong F&B content history. We provide filming location and product; you bring the angle.",
    skills: ["tiktok", "f&b", "content creation", "short-form video", "influencer"],
    location: "Remote",
    category: "content",
    budget_cents: 180000,
    budget_kind: "fixed",
    questions: [
      "Share 3 recent F&B TikTok videos. What's your average view count and engagement rate?",
    ],
  },
  {
    employer_handle: "kopicraft",
    title: "Brand copywriter — website + email series",
    description: "Rewrite the KopiCraft website copy (5 pages) and write a 6-edition email welcome series for our loyalty programme members. Tone: warm, local, not corporate.",
    skills: ["copywriting", "brand voice", "email marketing", "website copy", "f&b"],
    location: "Remote",
    category: "content",
    budget_cents: 420000,
    budget_kind: "fixed",
    questions: [
      "Share a website or email project you wrote for a local brand. What was the brief and what was the result?",
    ],
  },
  {
    employer_handle: "sunrise_events",
    title: "Event logistics coordinator — product launch",
    description: "Coordinate on-site logistics for a 200-pax product launch at Raffles Place. Duties: vendor liaison, equipment intake, floor plan execution, and post-event teardown. 1-week lead time.",
    skills: ["event logistics", "coordination", "vendor management", "on-site ops"],
    location: "Raffles Place",
    category: "events",
    budget_cents: 240000,
    budget_kind: "fixed",
  },
];

// ─── APPLICATIONS ─────────────────────────────────────────────────────────────

export const APPLICATIONS: SeedApplication[] = [
  // Aisha → tech gigs
  {
    applicant_handle: "aisha_ml",
    gig_title: "ML Engineer (NLP) — 12-week contract",
    status: "interviewing",
    cover_note: "I've shipped 3 production NLP systems — including a RAG pipeline over legal documents that cut hallucination from 34% to 6%. AWS ML Specialty certified. Can start in 2 weeks.",
  },
  {
    applicant_handle: "aisha_ml",
    gig_title: "Full-stack Next.js contractor — 8 weeks",
    status: "applied",
    cover_note: "Strong Python/ML background but also comfortable with Next.js and Supabase — built internal tooling on this stack at my last engagement.",
  },

  // Jun Wei → tech gigs
  {
    applicant_handle: "jun_wei",
    gig_title: "Full-stack Next.js contractor — 8 weeks",
    status: "hired",
    cover_note: "Shipped a Next.js 15 app with RSC + Server Actions + Supabase RLS last month for a SG payments startup. Happy to share repo on call.",
  },
  {
    applicant_handle: "jun_wei",
    gig_title: "Backend Go API developer — 6 weeks",
    status: "applied",
    cover_note: "Go is my primary language — built the microservices layer at my Tokyo fintech. Comfortable with goroutine pools, Postgres, and Redis pub/sub.",
  },

  // Nadia → design gigs
  {
    applicant_handle: "nadia_ux",
    gig_title: "UX Lead contractor · 10-week fintech product",
    status: "interviewing",
    cover_note: "Led UX for two fintech products at GovTech (MyInfo, LifeSG) and one at a Series A healthtech. Strong in research-led design, data-dense flows, and design system handoff.",
  },
  {
    applicant_handle: "nadia_ux",
    gig_title: "Senior UI designer — SaaS dashboard (6 weeks)",
    status: "applied",
    cover_note: "I have 3 dashboard redesigns in my portfolio — all with complex data visualisation requirements. Happy to walk you through one on a call.",
  },

  // Ravi → design gigs
  {
    applicant_handle: "ravi_motion",
    gig_title: "Motion designer — product launch campaign (3 weeks)",
    status: "hired",
    cover_note: "7 years of After Effects and Rive. My last product launch reel (Series A fintech) has been used in 4 investor decks. Can work directly from brand guidelines.",
  },
  {
    applicant_handle: "ravi_motion",
    gig_title: "Brand designer — outlet identity refresh",
    status: "applied",
    cover_note: "Designed full brand systems for 12 SG startups including 3 F&B brands. Very comfortable with menu, signage, and packaging templates.",
  },

  // Priya → education gigs
  {
    applicant_handle: "priya_tutor",
    gig_title: "H2 Maths & Physics tutor — weekly classes",
    status: "hired",
    cover_note: "6 years H2 Maths + Physics, 92% distinctions last batch. ACTA-certified. Can start immediately and bring my own supplementary materials.",
  },
  {
    applicant_handle: "priya_tutor",
    gig_title: "O-level Science curriculum reviewer",
    status: "interviewing",
    cover_note: "Reviewed O-level Physics content for a publisher last year. Can flag conceptual errors, improve explanation depth, and add exam-style practice questions.",
  },

  // Marcus → education gigs
  {
    applicant_handle: "marcus_psle",
    gig_title: "PSLE English relief tutor — 8 weeks",
    status: "interviewing",
    cover_note: "11 years of PSLE English experience, including 3 years teaching at a MOE school. Available Tuesday/Thursday evenings + Saturday mornings.",
  },
  {
    applicant_handle: "marcus_psle",
    gig_title: "O-level Science curriculum reviewer",
    status: "applied",
    cover_note: "I write my own exam papers and have reviewed curriculum for 2 ed-tech companies. Can deliver structured feedback with suggested additions.",
  },

  // Siti → events gigs
  {
    applicant_handle: "siti_emcee",
    gig_title: "Bilingual emcee — corporate D&D, 800 pax",
    status: "interviewing",
    cover_note: "Emceed the DBS SEA Annual Dinner (700 pax, MBS) and the MAS gala (600 pax). Fluent EN + BM, conversational Mandarin. Clip from DBS event attached.",
  },

  // Jasmine → events gigs
  {
    applicant_handle: "jasmine_events",
    gig_title: "Event coordinator — gala dinner 500 pax",
    status: "applied",
    cover_note: "Coordinated 15 gala dinners in the last 3 years, including 2 at MBS. Strong at vendor liaison and day-of floor management for VIP events.",
  },

  // Jayden → video gigs
  {
    applicant_handle: "jayden_video",
    gig_title: "Wedding videographer — full-day Malay wedding",
    status: "applied",
    cover_note: "80 weddings, including 25 Malay weddings (nikah + dinner reception). Sony FX3 + DJI Mavic 3 Pro. 2-week highlight reel turnaround.",
  },

  // Hafiz → event logistics gig
  {
    applicant_handle: "hafiz_ops",
    gig_title: "Event logistics coordinator — product launch",
    status: "applied",
    cover_note: "Coordinated logistics for 3 similar 200-pax corporate events in the CBD this quarter. Familiar with Raffles Place venues and vendor access procedures.",
  },

  // Eden → content gig
  {
    applicant_handle: "eden_tiktok",
    gig_title: "TikTok creator partnership — F&B campaign (3 videos)",
    status: "interviewing",
    cover_note: "210k SG followers, 95% local audience, average 500k views per video. My last 3 brand partnerships drove sold-out launches within 48 hours. Rate card attached.",
  },

  // Zara → content gig
  {
    applicant_handle: "zara_copy",
    gig_title: "Brand copywriter — website + email series",
    status: "applied",
    cover_note: "Rewrote the website for a local retail brand last quarter — conversion up 3x. I write in a warm, locally-inflected voice. Happy to share samples.",
  },
];
