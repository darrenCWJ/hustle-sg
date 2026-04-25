// Realistic SG seed data. All fictitious.

export interface SeedProfile {
  nric: string;
  handle: string;
  display_name: string;
  headline: string;
  bio: string;
  role: "freelancer" | "employer" | "both";
  avatar_url?: string;
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
}

export interface SeedApplication {
  applicant_handle: string;
  gig_title: string;
  status: "applied" | "interviewing" | "hired" | "rejected";
  cover_note?: string;
}

export const FREELANCERS: SeedProfile[] = [
  {
    nric: "S1234567D",
    handle: "arif_rahman",
    display_name: "Arif Rahman",
    headline: "Product designer · ex-GovTech",
    bio: "Figma all day. UX research, design systems, end-to-end product design. 3 years at GovTech on LifeSG and MyInfo redesigns, now freelancing for F&B brands around Kampong Glam.",
    role: "freelancer",
    certs: [
      {
        kind: "university",
        issuer: "NUS",
        title: "B.Arts (Hons) in Industrial Design",
        issued_at: "2020-05-12",
        extracted_skills: ["figma", "user research", "design systems", "sketching", "usability testing"],
        verified: true,
      },
      {
        kind: "wsq",
        issuer: "SkillsFuture SG",
        title: "WSQ Advanced Certificate in UX Design",
        issued_at: "2023-08-10",
        extracted_skills: ["wireframing", "prototyping", "accessibility"],
        verified: true,
      },
    ],
    portfolio: [
      {
        kind: "video",
        title: "GovTech LifeSG redesign walkthrough",
        description: "Walkthrough of the LifeSG mobile nav redesign — reduced drop-off by 31% in beta testing.",
        tags: ["ux", "govtech", "case-study"],
      },
      {
        kind: "writeup",
        title: "Redesigning kopitiam loyalty",
        description: "Case study for a 12-outlet kopitiam chain. Moved from punch cards to a QR + WhatsApp loyalty flow. +38% repeat visits in 6 weeks.",
        tags: ["ux", "figma", "research"],
      },
      {
        kind: "website",
        title: "Design portfolio",
        external_url: "https://example.com/arif",
        tags: ["portfolio"],
      },
    ],
  },
  {
    nric: "S2345678H",
    handle: "priya_sg",
    display_name: "Priya Krishnan",
    headline: "A-level Maths & Physics tutor · WSQ ACTA",
    bio: "Five years with centres in Tampines and Bukit Timah. Specialise in H2 Maths. Small group and 1-on-1. A-level results: 92% distinctions last batch.",
    role: "freelancer",
    certs: [
      {
        kind: "wsq",
        issuer: "SkillsFuture SG",
        title: "WSQ Advanced Certificate in Training and Assessment (ACTA)",
        issued_at: "2021-03-04",
        extracted_skills: ["lesson planning", "adult learning", "assessment design"],
        verified: true,
      },
      {
        kind: "university",
        issuer: "NTU",
        title: "B.Sc. in Mathematical Sciences",
        issued_at: "2018-07-10",
        extracted_skills: ["h2 maths", "calculus", "statistics", "problem solving"],
        verified: true,
      },
    ],
    portfolio: [
      {
        kind: "writeup",
        title: "H2 Maths: from U to A",
        description: "Thread of case studies from my past students. Systems: spaced retrieval + past-year-paper drilling + weekly doubt clinics.",
        tags: ["tuition", "maths", "a-level"],
      },
    ],
  },
  {
    nric: "S3456789A",
    handle: "weijie",
    display_name: "Wei Jie Tan",
    headline: "Full-stack dev · Next.js, Go, Postgres",
    bio: "NUS CS 2022. Worked a year in Tokyo at a fintech. Now freelance. Built 3 production Next.js apps and a real-time trading dashboard in Go.",
    role: "freelancer",
    certs: [
      {
        kind: "university",
        issuer: "NUS",
        title: "B.Comp. in Computer Science",
        issued_at: "2022-06-18",
        extracted_skills: ["typescript", "go", "postgres", "kubernetes", "distributed systems"],
        verified: true,
      },
      {
        kind: "accreditation",
        issuer: "SCS",
        title: "Certified IT Practitioner",
        issued_at: "2024-02-15",
        extracted_skills: ["software architecture", "code review"],
        verified: true,
      },
    ],
    portfolio: [
      {
        kind: "website",
        title: "Trade-dash demo",
        external_url: "https://example.com/weijie/trade-dash",
        tags: ["go", "websockets", "postgres"],
      },
    ],
  },
  {
    nric: "T0123456G",
    handle: "siti_mc",
    display_name: "Siti Nurhaliza",
    headline: "Emcee · trilingual · D&Ds, weddings, launches",
    bio: "English, Malay, Bahasa. 140+ events emceed. Corporate D&Ds, product launches, Malay weddings. Based in Yishun, will travel.",
    role: "freelancer",
    certs: [
      {
        kind: "wsq",
        issuer: "Workforce Singapore",
        title: "WSQ Certificate in Service Excellence",
        issued_at: "2020-04-01",
        extracted_skills: ["event hosting", "stage presence", "public speaking"],
        verified: true,
      },
    ],
    portfolio: [
      {
        kind: "writeup",
        title: "Live-host for DBS SEA kickoff",
        description: "2-hour bilingual (EN/BM) emcee for 600 attendees at Marina Bay Sands. Script + run-of-show designed in 3 days.",
        tags: ["emcee", "events", "bilingual"],
      },
    ],
  },
  {
    nric: "S4567890C",
    handle: "chef_mei",
    display_name: "Mei Lin Tan",
    headline: "Home chef · halal-certified kitchen · nasi lemak",
    bio: "Ran a weekend pop-up at Pasir Ris hawker, 2022–23. Halal-certified home kitchen. Take orders for events up to 200 pax.",
    role: "freelancer",
    certs: [
      {
        kind: "wsq",
        issuer: "SkillsFuture SG",
        title: "WSQ Food Safety Course Level 2",
        issued_at: "2023-01-20",
        extracted_skills: ["food safety", "haccp", "hygiene", "catering ops"],
        verified: true,
      },
    ],
    portfolio: [
      {
        kind: "writeup",
        title: "200-pax corporate catering log",
        description: "How I batch-cooked nasi lemak sambal for 200 at a Raffles Place D&D.",
        tags: ["catering", "halal", "event"],
      },
    ],
  },
  {
    nric: "S5678901D",
    handle: "jayden_fx",
    display_name: "Jayden Lee",
    headline: "Videographer · wedding, corporate",
    bio: "Sony FX3 kit. 60 weddings shot. Also do gimbal & drone coverage. Based in Punggol.",
    role: "freelancer",
    certs: [],
    portfolio: [
      {
        kind: "website",
        title: "Reel — weddings 2025",
        external_url: "https://example.com/jayden/reel",
        tags: ["video", "wedding", "drone"],
      },
    ],
  },
  {
    nric: "S6789012D",
    handle: "ahmad_tech",
    display_name: "Ahmad Yusoff",
    headline: "Aircon technician · 24/7 callout · WSQ-certified",
    bio: "Specialise in split & VRV systems. Emergency callouts for condos in the east. Clean, honest pricing, no upsells.",
    role: "freelancer",
    certs: [
      {
        kind: "wsq",
        issuer: "SkillsFuture SG",
        title: "WSQ Certificate in Refrigeration & Air-Conditioning",
        issued_at: "2019-11-04",
        extracted_skills: ["aircon servicing", "refrigerant handling", "electrical safety"],
        verified: true,
      },
    ],
    portfolio: [],
  },
  {
    nric: "S7890123C",
    handle: "rachel_pt",
    display_name: "Rachel Ong",
    headline: "Personal trainer · ACSM-certified",
    bio: "Boutique gym in Tanjong Pagar. Strength + hypertrophy for busy professionals. 3x-a-week programmes + nutrition calls.",
    role: "freelancer",
    certs: [
      {
        kind: "accreditation",
        issuer: "ACSM",
        title: "Certified Exercise Physiologist",
        issued_at: "2023-09-12",
        extracted_skills: ["strength training", "programming", "nutrition coaching"],
        verified: true,
      },
    ],
    portfolio: [],
  },
  {
    nric: "S8901234A",
    handle: "eden_tt",
    display_name: "Eden Goh",
    headline: "TikTok creator · 180k followers · F&B reviews",
    bio: "I eat hawker food and post about it. Open to brand collabs, menu launches, shop-openings. Paid partnerships only.",
    role: "freelancer",
    certs: [],
    portfolio: [
      {
        kind: "website",
        title: "@edeneats on TikTok",
        external_url: "https://tiktok.com/@example",
        tags: ["tiktok", "f&b", "reviews"],
      },
    ],
  },
  {
    nric: "S9012345I",
    handle: "daniel_copy",
    display_name: "Daniel Wong",
    headline: "Copywriter · brand voice · B2B SaaS",
    bio: "Ex-agency, now freelance. Worked with 12 SG SaaS startups on landing pages + email sequences. Conversion-first, not clever-first.",
    role: "freelancer",
    certs: [
      {
        kind: "university",
        issuer: "SMU",
        title: "B.B.A. in Marketing",
        issued_at: "2019-08-03",
        extracted_skills: ["copywriting", "brand strategy", "email marketing"],
        verified: true,
      },
    ],
    portfolio: [],
  },
];

export const EMPLOYERS: SeedProfile[] = [
  {
    nric: "M1023456L",
    handle: "kopitiam_co",
    display_name: "Hafiz at KopitiamCo",
    headline: "F&B chain · 14 outlets",
    bio: "We run coffee-first kopitiam outlets. Always looking for freelance designers, videographers, and hawkers for events.",
    role: "employer",
    certs: [],
    portfolio: [],
  },
  {
    nric: "M2023457U",
    handle: "nova_studio",
    display_name: "Clara at Nova Studio",
    headline: "Design studio · Tanjong Pagar",
    bio: "We hire UX contractors for 6-12 week bursts on fintech and healthtech clients.",
    role: "employer",
    certs: [],
    portfolio: [],
  },
  {
    nric: "M3023458P",
    handle: "edutech_sg",
    display_name: "Marcus at EduTech SG",
    headline: "Tuition centre network",
    bio: "6 branches islandwide. Looking for subject specialists and curriculum reviewers.",
    role: "employer",
    certs: [],
    portfolio: [],
  },
  {
    nric: "M4023459K",
    handle: "sunrise_events",
    display_name: "Lydia at Sunrise Events",
    headline: "Events agency · D&Ds, weddings",
    bio: "Full-service event management. We hire freelance emcees, videographers, and caterers.",
    role: "employer",
    certs: [],
    portfolio: [],
  },
];

export const GIGS: SeedGig[] = [
  {
    employer_handle: "kopitiam_co",
    title: "Design a kopitiam loyalty app — 3 weeks",
    description: "We want to modernize our QR loyalty flow. Needs a designer who has shipped real Figma + can stay in kopi-culture tone. Outcome: hi-fi designs + design system for our 14-outlet chain.",
    skills: ["figma", "ux", "design systems", "user research"],
    location: "Kallang (hybrid)",
    category: "design",
    budget_cents: 840000,
    budget_kind: "fixed",
    questions: [
      "Walk us through a redesign you shipped for a small-team brand.",
      "How do you approach research with non-English-speaking users?",
    ],
  },
  {
    employer_handle: "kopitiam_co",
    title: "Short-form video for new outlet opening",
    description: "We're opening in Bugis. Need a 3-video TikTok/Reels set with on-location shoot. Half-day shoot plus editing.",
    skills: ["video", "tiktok", "editing"],
    location: "Bugis",
    category: "video",
    budget_cents: 180000,
    budget_kind: "fixed",
    questions: ["Show us a reel you shot that converted into real store traffic."],
  },
  {
    employer_handle: "nova_studio",
    title: "Senior UX contractor · 12-week fintech",
    description: "Mid-senior UX contractor for a Pte Ltd fintech. End-to-end: research, wireframe, hi-fi. Work with a PM and a dev lead. Hybrid — 1 day in Tanjong Pagar, rest remote.",
    skills: ["ux", "figma", "fintech", "user research"],
    location: "Tanjong Pagar (hybrid)",
    category: "design",
    budget_cents: 12000,
    budget_kind: "hourly",
    questions: [
      "Describe a tricky fintech flow you've redesigned.",
      "What's your approach when research contradicts the PM's intuition?",
      "Walk through a design system you shipped end-to-end.",
    ],
  },
  {
    employer_handle: "nova_studio",
    title: "Motion designer for brand launch",
    description: "6 short motion pieces for a product reveal. After Effects or Rive. 3 weeks.",
    skills: ["motion", "after effects", "animation"],
    location: "Remote",
    category: "design",
    budget_cents: 300000,
    budget_kind: "fixed",
  },
  {
    employer_handle: "edutech_sg",
    title: "H2 Maths curriculum reviewer",
    description: "We have a 12-chapter H2 Maths curriculum. Need an experienced tutor to QA the content and suggest 3 improvements per chapter. 10 hours/week for 6 weeks.",
    skills: ["h2 maths", "curriculum design", "assessment design"],
    location: "Remote",
    category: "tuition",
    budget_cents: 8000,
    budget_kind: "hourly",
    questions: [
      "Share a lesson plan you're proud of.",
      "How do you handle students who just won't engage?",
    ],
  },
  {
    employer_handle: "edutech_sg",
    title: "Relief tutor — P6 PSLE English",
    description: "Our regular tutor is on parental leave. 3 weekday evenings + Sat morning for 6 weeks. Tampines branch.",
    skills: ["psle", "english", "tuition"],
    location: "Tampines",
    category: "tuition",
    budget_cents: 6500,
    budget_kind: "hourly",
  },
  {
    employer_handle: "sunrise_events",
    title: "Bilingual emcee — corporate D&D, 600 pax",
    description: "Annual D&D for a bank. Need EN + either Malay or Mandarin. Script support provided. 3 hours on stage.",
    skills: ["emcee", "bilingual", "corporate events"],
    location: "Marina Bay Sands",
    category: "events",
    budget_cents: 200000,
    budget_kind: "fixed",
    questions: ["Share a past corporate emcee clip.", "How do you handle a silent crowd in the first 10 minutes?"],
  },
  {
    employer_handle: "sunrise_events",
    title: "Wedding videographer — Nikah + dinner",
    description: "Malay wedding, 250 pax. Full-day shoot, 2-week turnaround for a highlight reel + 40-min full video.",
    skills: ["video", "wedding", "editing"],
    location: "Jurong",
    category: "video",
    budget_cents: 260000,
    budget_kind: "fixed",
  },
  {
    employer_handle: "sunrise_events",
    title: "Halal caterer — 150 pax corporate lunch",
    description: "Launch event. 150 pax halal bento + drinks. 1 week lead-time.",
    skills: ["catering", "halal"],
    location: "Raffles Place",
    category: "f&b",
    budget_cents: 180000,
    budget_kind: "fixed",
  },
  {
    employer_handle: "kopitiam_co",
    title: "TikTok creator partnership — food review",
    description: "Paid partnership for a 3-video campaign around our new nasi lemak. 50k+ followers, SG audience preferred.",
    skills: ["tiktok", "f&b", "content"],
    location: "Remote",
    category: "content",
    budget_cents: 120000,
    budget_kind: "fixed",
  },
  {
    employer_handle: "nova_studio",
    title: "Full-stack Next.js contractor",
    description: "Build 3 feature modules in our Next.js + Postgres stack. 8-week engagement. Must know RSC + server actions.",
    skills: ["nextjs", "typescript", "postgres", "server actions"],
    location: "Remote",
    category: "tech",
    budget_cents: 11000,
    budget_kind: "hourly",
    questions: ["Share a production Next.js app you shipped.", "Explain a gnarly RSC bug you debugged."],
  },
  {
    employer_handle: "edutech_sg",
    title: "Copywriter — parent-facing newsletter",
    description: "Monthly newsletter, 1,200 words. Needs to feel warm and authoritative, not sales-y. 6 editions.",
    skills: ["copywriting", "email", "b2c"],
    location: "Remote",
    category: "content",
    budget_cents: 50000,
    budget_kind: "fixed",
  },
];

export const APPLICATIONS: SeedApplication[] = [
  // Arif applying to design gigs
  {
    applicant_handle: "arif_rahman",
    gig_title: "Design a kopitiam loyalty app — 3 weeks",
    status: "interviewing",
    cover_note: "I literally did this for a kopitiam chain last year — see my case study. Happy to share the Figma file on call.",
  },
  {
    applicant_handle: "arif_rahman",
    gig_title: "Senior UX contractor · 12-week fintech",
    status: "applied",
    cover_note: "3 years in fintech UX at GovTech (MyInfo, LifeSG). Strong in research-led design, comfortable with complex data flows.",
  },
  {
    applicant_handle: "arif_rahman",
    gig_title: "Motion designer for brand launch",
    status: "applied",
    cover_note: "I do motion in Figma + Rive. Happy to share a Rive prototype I built for a product launch last quarter.",
  },

  // Priya applying to tuition gigs
  {
    applicant_handle: "priya_sg",
    gig_title: "H2 Maths curriculum reviewer",
    status: "hired",
    cover_note: "I've taught H2 Maths for 5 years and reviewed O-level content for a publisher. Can start immediately.",
  },
  {
    applicant_handle: "priya_sg",
    gig_title: "Relief tutor — P6 PSLE English",
    status: "applied",
    cover_note: "I have availability on Tuesday and Thursday evenings + Saturday mornings. ACTA-certified adult educator.",
  },

  // Wei Jie applying to tech gigs
  {
    applicant_handle: "weijie",
    gig_title: "Full-stack Next.js contractor",
    status: "interviewing",
    cover_note: "I shipped a Next.js 14 app with Server Actions + Supabase for a SG fintech last month. Can share repo.",
  },

  // Siti applying to events gigs
  {
    applicant_handle: "siti_mc",
    gig_title: "Bilingual emcee — corporate D&D, 600 pax",
    status: "applied",
    cover_note: "I emceed a 600-pax bank D&D at MBS in 2024 — clip available. Fluent EN + BM, conversational Mandarin.",
  },

  // Jayden applying to video gigs
  {
    applicant_handle: "jayden_fx",
    gig_title: "Wedding videographer — Nikah + dinner",
    status: "applied",
    cover_note: "60 weddings shot including 20 Malay weddings. Sony FX3 + drone. Highlight reel from 2024 attached.",
  },
  {
    applicant_handle: "jayden_fx",
    gig_title: "Short-form video for new outlet opening",
    status: "applied",
    cover_note: "I do short-form retail/F&B a lot. Can bring drone for exterior B-roll.",
  },

  // Eden applying to content gigs
  {
    applicant_handle: "eden_tt",
    gig_title: "TikTok creator partnership — food review",
    status: "interviewing",
    cover_note: "180k SG followers, 80% aged 18-35. My nasi lemak reviews average 400k views. Rate card attached.",
  },

  // Daniel applying to copywriting
  {
    applicant_handle: "daniel_copy",
    gig_title: "Copywriter — parent-facing newsletter",
    status: "applied",
    cover_note: "I wrote 12 editions of an EdTech parent newsletter for a SG startup. Open rate went from 22% to 41%.",
  },

  // Mei Lin applying to catering
  {
    applicant_handle: "chef_mei",
    gig_title: "Halal caterer — 150 pax corporate lunch",
    status: "applied",
    cover_note: "Halal-certified kitchen, 200-pax capacity. Did 3 similar corporate lunches in Raffles Place this year.",
  },
];
