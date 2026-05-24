export interface DemoProfile {
  id: string;
  name: string;
  role: "employer" | "freelancer";
  specialization?: string;
  headline: string;
  avatar: string;
  categories: string[];
  skills?: string[];
  rating?: number;
  hourlyRate?: string;
  completedGigs?: number;
}

export interface DemoGig {
  id: string;
  title: string;
  description: string;
  category: string;
  skills: string[];
  budget: string;
  location: string;
  postedAgo: string;
  duration?: string;  // e.g. "1 day", "3 months", "10 weeks", "Ongoing"
  headcount?: number;
  startTime?: string; // "HH:MM"
  endTime?: string;   // "HH:MM"
  days?: number[];    // 0=Sun … 6=Sat
  questions?: string[]; // async interview questions, up to 3
  distanceKm?: number;  // for community/local gigs
  urgent?: boolean;
  imageUrl?: string;
}

export interface DemoApplication {
  id: string;
  gigId: string;
  freelancerId: string;
  status: "applied" | "interviewing" | "shortlisted" | "accepted" | "rejected" | "completed" | "offered";
  createdAt: string;
}

export interface DemoRating {
  id: string;
  applicationId: string;
  gigId: string;
  fromId: string;
  toId: string;
  stars: number;
  review: string;
  gigTitle: string;
  createdAt: string;
}

export interface DemoMessage {
  id: string;
  applicationId: string;
  senderId: string;
  body: string;
  createdAt: string;
}

export const PROFILES: DemoProfile[] = [
  {
    id: "requestor",
    name: "Darren Loh",
    role: "employer",
    headline: "Operations Director · Demo Corp SG",
    avatar: "DL",
    categories: ["tech", "design", "events", "marketing", "content", "tuition"],
  },
  {
    id: "it",
    name: "Ryan Koh",
    role: "freelancer",
    specialization: "IT & Software Design",
    headline: "Full-stack dev & UI/UX designer",
    avatar: "RK",
    categories: ["tech", "design"],
    skills: ["React", "TypeScript", "Node.js", "Figma", "UI/UX"],
    rating: 4.9,
    hourlyRate: "$120/hr",
    completedGigs: 34,
  },
  {
    id: "events",
    name: "Natasha Wong",
    role: "freelancer",
    specialization: "Events & Marketing",
    headline: "Event coordinator & content strategist",
    avatar: "NW",
    categories: ["events", "marketing", "content"],
    skills: ["Event Planning", "Social Media", "Content Strategy", "Copywriting"],
    rating: 4.8,
    hourlyRate: "$80/hr",
    completedGigs: 22,
  },
  {
    id: "teaching",
    name: "Kavitha Devi",
    role: "freelancer",
    specialization: "Teaching",
    headline: "A-level tutor · Maths, Physics, Chemistry",
    avatar: "KD",
    categories: ["tuition"],
    skills: ["Mathematics", "Physics", "Chemistry", "A-level", "IB"],
    rating: 5.0,
    hourlyRate: "$85/hr",
    completedGigs: 48,
  },
  {
    id: "tech-2-profile",
    name: "Marcus Tan",
    role: "freelancer",
    specialization: "IT & Software Design",
    headline: "Mobile dev · React Native & Flutter",
    avatar: "MT",
    categories: ["tech"],
    skills: ["React Native", "Flutter", "iOS", "Android", "Firebase"],
    rating: 4.7,
    hourlyRate: "$110/hr",
    completedGigs: 19,
  },
  {
    id: "design-2-profile",
    name: "Priya Sharma",
    role: "freelancer",
    specialization: "IT & Software Design",
    headline: "Brand designer & visual storyteller",
    avatar: "PS",
    categories: ["design"],
    skills: ["Branding", "Illustrator", "After Effects", "Motion Graphics"],
    rating: 4.9,
    hourlyRate: "$95/hr",
    completedGigs: 27,
  },
  {
    id: "events-2-profile",
    name: "Jonathan Lee",
    role: "freelancer",
    specialization: "Events & Marketing",
    headline: "Digital marketer & paid ads specialist",
    avatar: "JL",
    categories: ["marketing", "content"],
    skills: ["Google Ads", "Meta Ads", "SEO", "Analytics", "SEM"],
    rating: 4.6,
    hourlyRate: "$90/hr",
    completedGigs: 15,
  },
  {
    id: "teaching-2-profile",
    name: "David Ng",
    role: "freelancer",
    specialization: "Teaching",
    headline: "O/A-level English & GP tutor",
    avatar: "DN",
    categories: ["tuition"],
    skills: ["English", "General Paper", "Creative Writing", "Comprehension"],
    rating: 4.8,
    hourlyRate: "$75/hr",
    completedGigs: 56,
  },
  {
    id: "events-3-profile",
    name: "Sarah Lim",
    role: "freelancer",
    specialization: "Events & Marketing",
    headline: "Video editor & content creator",
    avatar: "SL",
    categories: ["content", "marketing"],
    skills: ["Premiere Pro", "YouTube", "TikTok", "Video Editing", "Colour Grading"],
    rating: 4.7,
    hourlyRate: "$70/hr",
    completedGigs: 31,
  },
];

export const GIGS: DemoGig[] = [
  // ─── Tech / Design (6) ───────────────────────────────────────────
  {
    id: "tech-1",
    title: "Full-stack developer — 3-month contract",
    description:
      "Build 4 new modules for our B2B SaaS platform. Stack: Next.js 15, TypeScript, Supabase, Postgres. Hybrid — 2 days at Raffles Place office.",
    category: "tech",
    skills: ["nextjs", "typescript", "supabase", "postgres"],
    budget: "$120/hr",
    location: "Raffles Place (hybrid)",
    postedAgo: "1d ago",
    duration: "3 months",
    questions: [
      "Walk us through a complex full-stack feature you built end to end.",
      "How do you approach debugging a performance issue in a React app?",
      "Tell us about a time you had to communicate a technical decision to a non-technical stakeholder.",
    ],
  },
  {
    id: "tech-2",
    title: "React Native mobile app — loyalty programme",
    description:
      "Build v2 iOS/Android app for our loyalty programme. Expo, Supabase auth, push notifications. Fully remote.",
    category: "tech",
    skills: ["react native", "expo", "typescript", "push notifications"],
    budget: "$110/hr",
    location: "Remote",
    postedAgo: "2d ago",
    duration: "Project-based",
  },
  {
    id: "tech-3",
    title: "DevOps engineer — CI/CD pipeline setup",
    description:
      "Set up GitHub Actions, Docker containerisation, and AWS ECS deployment for a Node.js monorepo. 4-week engagement.",
    category: "tech",
    skills: ["docker", "aws", "github actions", "node.js"],
    budget: "$8,000 fixed",
    location: "Remote",
    postedAgo: "3d ago",
    duration: "4 weeks",
  },
  {
    id: "design-1",
    title: "UI/UX redesign — fintech dashboard",
    description:
      "Redesign our analytics dashboard for clarity and accessibility. Figma deliverables, design system tokens, handoff to devs.",
    category: "design",
    skills: ["figma", "ui/ux", "design systems", "accessibility"],
    budget: "$90/hr",
    location: "Tanjong Pagar",
    postedAgo: "1d ago",
    duration: "Project-based",
    questions: [
      "Show us a project where you improved a complex, data-heavy interface.",
      "How do you approach building a design system from scratch?",
    ],
  },
  {
    id: "design-2",
    title: "Brand identity — health-tech startup",
    description:
      "Logo, colour palette, typography, and brand guidelines for a Series A health-tech startup launching in Q3.",
    category: "design",
    skills: ["branding", "illustrator", "typography", "visual design"],
    budget: "$5,500 fixed",
    location: "Remote",
    postedAgo: "4d ago",
    duration: "Project-based",
  },
  {
    id: "design-3",
    title: "Motion graphics for product launch video",
    description:
      "30-second animated explainer video for our new feature launch. After Effects or Rive. Storyboard provided.",
    category: "design",
    skills: ["after effects", "motion graphics", "animation"],
    budget: "$3,000 fixed",
    location: "Remote",
    postedAgo: "2d ago",
    duration: "Project-based",
  },

  // ─── Events / Marketing / Content (6) ─────────────────────────────
  {
    id: "events-1",
    title: "Corporate D&D event coordinator",
    description:
      "Plan and execute a 200-pax dinner & dance at Marina Bay Sands. Full event management from vendor sourcing to day-of coordination.",
    category: "events",
    skills: ["event planning", "vendor management", "budgeting"],
    budget: "$6,000 fixed",
    location: "Marina Bay Sands",
    postedAgo: "1d ago",
    headcount: 3,
    duration: "1 day",
    questions: [
      "Describe the most complex event you've coordinated and what made it challenging.",
      "How do you handle a last-minute vendor issue on the day of an event?",
    ],
  },
  {
    id: "events-2",
    title: "Product launch emcee — bilingual",
    description:
      "Host a 3-hour product launch event. English + Mandarin. Includes rehearsal day-before and day-of hosting.",
    category: "events",
    skills: ["emcee", "public speaking", "bilingual"],
    budget: "$2,500 fixed",
    location: "Suntec Convention Centre",
    postedAgo: "3d ago",
    duration: "2 days",
  },
  {
    id: "marketing-1",
    title: "Social media manager — 3 months",
    description:
      "Manage Instagram, TikTok, and LinkedIn. 4 posts/week, community management, monthly analytics report.",
    category: "marketing",
    skills: ["social media", "content creation", "analytics", "tiktok"],
    budget: "$60/hr",
    location: "Remote",
    postedAgo: "2d ago",
    headcount: 2,
    duration: "3 months",
  },
  {
    id: "marketing-2",
    title: "Google Ads specialist — e-commerce",
    description:
      "Set up and optimise Google Shopping + Search campaigns for a local fashion brand. $15k monthly ad spend.",
    category: "marketing",
    skills: ["google ads", "sem", "e-commerce", "analytics"],
    budget: "$80/hr",
    location: "Remote",
    postedAgo: "1d ago",
    duration: "Ongoing",
  },
  {
    id: "content-1",
    title: "Copywriter — website relaunch",
    description:
      "Write copy for 12 landing pages, about page, and FAQ section. B2B SaaS tone — professional but human.",
    category: "content",
    skills: ["copywriting", "b2b", "seo", "landing pages"],
    budget: "$4,000 fixed",
    location: "Remote",
    postedAgo: "5d ago",
    duration: "Project-based",
  },
  {
    id: "content-2",
    title: "Video editor — YouTube series",
    description:
      "Edit 8 episodes (15-20 min each) for a business education YouTube channel. Cuts, captions, B-roll, colour grade.",
    category: "content",
    skills: ["video editing", "premiere pro", "youtube", "colour grading"],
    budget: "$500/episode",
    location: "Remote",
    postedAgo: "2d ago",
    duration: "Project-based",
  },

  // ─── Teaching / Tuition (6) ────────────────────────────────────────
  {
    id: "tuition-1",
    title: "A-level H2 Maths tutor — JC2 student",
    description:
      "Weekly 1.5h sessions for a JC2 student targeting A grade. Focus on calculus and statistics. Weekday evenings preferred.",
    category: "tuition",
    skills: ["mathematics", "a-level", "h2 maths", "calculus"],
    budget: "$80/hr",
    location: "Bishan",
    postedAgo: "1d ago",
    duration: "Ongoing",
    startTime: "19:00",
    endTime: "20:30",
    days: [1, 2, 3, 4, 5],
  },
  {
    id: "tuition-2",
    title: "O-level Physics tutor — group of 3",
    description:
      "Twice-weekly group tuition for 3 Sec 4 students. Exam prep focus — past year papers and concept drilling.",
    category: "tuition",
    skills: ["physics", "o-level", "exam prep"],
    budget: "$70/hr",
    location: "Tampines",
    postedAgo: "2d ago",
    duration: "Ongoing",
  },
  {
    id: "tuition-3",
    title: "Primary school English enrichment",
    description:
      "Creative writing and comprehension programme for P5 students. Saturday morning class, 8 sessions.",
    category: "tuition",
    skills: ["english", "creative writing", "primary school"],
    budget: "$60/hr",
    location: "Bukit Timah",
    postedAgo: "3d ago",
    duration: "8 weeks",
    startTime: "09:00",
    endTime: "10:30",
    days: [6],
  },
  {
    id: "tuition-4",
    title: "A-level H2 Chemistry tutor",
    description:
      "JC1 student needs help with organic chemistry foundations. Once a week, 2h sessions. Must explain clearly.",
    category: "tuition",
    skills: ["chemistry", "a-level", "h2 chemistry", "organic chemistry"],
    budget: "$85/hr",
    location: "Clementi",
    postedAgo: "1d ago",
    duration: "Ongoing",
  },
  {
    id: "tuition-5",
    title: "IB Mathematics AA HL tutor",
    description:
      "Year 2 IB student preparing for May exams. Focus on calculus, vectors, and probability. Online sessions OK.",
    category: "tuition",
    skills: ["ib maths", "calculus", "vectors", "probability"],
    budget: "$100/hr",
    location: "Online / Orchard",
    postedAgo: "4d ago",
    duration: "Project-based",
  },
  {
    id: "tuition-6",
    title: "Coding tutor — Python for teens",
    description:
      "Teach Python basics to a group of 5 secondary school students. 10-week programme, Saturdays 2-4pm.",
    category: "tuition",
    skills: ["python", "programming", "teaching"],
    budget: "$75/hr",
    location: "Toa Payoh",
    postedAgo: "2d ago",
    headcount: 2,
    duration: "10 weeks",
    startTime: "14:00",
    endTime: "16:00",
    days: [6],
  },

  // ─── Community Help ────────────────────────────────────────────────
  {
    id: "community-1",
    title: "Lost cat — Mochi is missing",
    description:
      "My grey tabby Mochi escaped from Block 412 this morning. Please help look out — last seen near the void deck. I'll reward anyone who finds him. Just needs someone to spot and message me.",
    category: "community",
    skills: [],
    budget: "$30 reward",
    location: "Toa Payoh (Blk 412)",
    postedAgo: "2h ago",
    distanceKm: 0.3,
    urgent: true,
    imageUrl: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=600&h=360&fit=crop&q=80",
  },
  {
    id: "community-2",
    title: "Grocery run — elderly neighbour needs help",
    description:
      "My 78-year-old neighbour Mdm Tan can't make it to NTUC today. Simple grocery list, less than $50 of items. I'll reimburse fully + $15 for your time. Pick up from Bishan MRT NTUC, deliver to Blk 160.",
    category: "community",
    skills: [],
    budget: "$15",
    location: "Bishan (Blk 160)",
    postedAgo: "1h ago",
    distanceKm: 0.6,
    urgent: true,
  },
  {
    id: "community-3",
    title: "Help moving boxes — this Saturday morning",
    description:
      "Moving from a 4-room flat to a 3-room flat. Need 2 helpers for about 3 hours to carry boxes. Lift available. I'll provide drinks and lunch. Heavy items already handled by movers.",
    category: "community",
    skills: [],
    budget: "$40/pax",
    location: "Ang Mo Kio Ave 3",
    postedAgo: "3h ago",
    distanceKm: 1.2,
    startTime: "09:00",
    endTime: "12:00",
    days: [6],
  },
  {
    id: "community-4",
    title: "Dog walk needed — Shiba Inu, 30 min",
    description:
      "Working late tonight and my Shiba Inu Kaito needs his evening walk. Very friendly and walks well on leash. Just 30 minutes around the estate. Muzzle not needed.",
    category: "community",
    skills: [],
    budget: "$12",
    location: "Serangoon Gardens",
    postedAgo: "45m ago",
    distanceKm: 1.5,
    urgent: true,
    startTime: "19:00",
    endTime: "19:30",
    imageUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&h=360&fit=crop&q=80",
  },
  {
    id: "community-5",
    title: "Lost dog — Corgi named Butter",
    description:
      "Butter ran out of our gate during the afternoon. She's a golden Corgi with a red collar. Very friendly — will approach strangers. Please WhatsApp me immediately if spotted. Last seen near Serangoon North Ave 4.",
    category: "community",
    skills: [],
    budget: "$80 reward",
    location: "Serangoon North",
    postedAgo: "30m ago",
    distanceKm: 2.1,
    urgent: true,
    imageUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=360&fit=crop&q=80",
  },
  {
    id: "community-6",
    title: "Babysitting — tonight 7–10pm",
    description:
      "Need a responsible person to watch my 4-year-old daughter for 3 hours while I attend a work dinner. She's well-behaved and will mostly be playing or watching cartoons. Must be comfortable with children.",
    category: "community",
    skills: [],
    budget: "$25",
    location: "Hougang Ave 8",
    postedAgo: "1h ago",
    distanceKm: 0.4,
    urgent: true,
    startTime: "19:00",
    endTime: "22:00",
  },
  {
    id: "community-7",
    title: "Plant watering while I travel",
    description:
      "Going to Bangkok for 5 days (Thu–Mon). Have about 20 indoor plants — mostly ferns and pothos. Just need someone to water every other day and let in some sunlight. Happy to give you a plant as a thank-you!",
    category: "community",
    skills: [],
    budget: "$30",
    location: "Punggol Waterway",
    postedAgo: "4h ago",
    distanceKm: 3.2,
  },
];
