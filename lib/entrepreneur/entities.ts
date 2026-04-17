// Static, SG-specific comparison data for Sole Proprietorship vs Private Limited.
// Figures reflect ACRA/IRAS guidance as public-reference points for a demo.

export interface EntityFacts {
  type: "sole_prop" | "pte_ltd";
  label: string;
  tagline: string;
  bestFor: string[];
  cost: string;
  liability: string;
  tax: string;
  renewal: string;
  investors: string;
  cpf: string;
  gst_threshold: string;
  paper_trail: string;
  notes: string[];
}

export const SOLE_PROP: EntityFacts = {
  type: "sole_prop",
  label: "Sole Proprietorship",
  tagline: "You, officially trading.",
  bestFor: ["Freelancers solo", "Tuition teachers", "One-person service firms", "Low-risk side hustles"],
  cost: "~S$115 (S$15 name + S$100 / 1-yr, or S$160 / 3-yr)",
  liability: "Unlimited personal liability",
  tax: "Personal income tax (progressive, 0–24%)",
  renewal: "Annual / 3-yearly",
  investors: "Cannot issue shares",
  cpf: "Voluntary Medisave contributions for self-employed (required if net trade income > S$6,000)",
  gst_threshold: "Register for GST when taxable turnover exceeds S$1M",
  paper_trail: "Income reported via IRAS personal tax; simpler bookkeeping",
  notes: [
    "Easiest to set up via ACRA BizFile+.",
    "Can convert to Pte Ltd later without losing the business.",
    "No legal separation between you and the business — protect yourself with insurance.",
  ],
};

export const PTE_LTD: EntityFacts = {
  type: "pte_ltd",
  label: "Private Limited (Pte Ltd)",
  tagline: "Your hustle, now a legal person.",
  bestFor: ["Growing teams", "Investor-ready startups", "Higher-risk business", "Long-term brand"],
  cost: "~S$315 (S$15 name + S$300 incorporation)",
  liability: "Limited to paid-up capital",
  tax: "Corporate tax 17% flat (with startup exemption for the first 3 YAs)",
  renewal: "Annual Return + AGM + audited accounts (audit exempt if small)",
  investors: "Can issue shares; investor-friendly",
  cpf: "As employee of your own company, regular CPF contributions apply to salary",
  gst_threshold: "Same S$1M turnover threshold",
  paper_trail: "Board resolutions, statutory registers, annual return, IRAS Form C/C-S",
  notes: [
    "Needs at least 1 local director (SG Citizen/PR/EntrePass).",
    "Audit exemption for small companies (any 2 of: revenue ≤ S$10M, assets ≤ S$10M, ≤ 50 employees).",
    "Recommended if you plan to hire, raise money, or take on bigger clients.",
  ],
};

export const ENTITIES: Record<"sole_prop" | "pte_ltd", EntityFacts> = {
  sole_prop: SOLE_PROP,
  pte_ltd: PTE_LTD,
};

export const CHECKLIST_STAGES = [
  {
    key: "decide",
    label: "1. Decide the entity",
    body: "Sole-prop if you're flying solo and want to test the market. Pte Ltd if you'll hire, raise, or want liability separation.",
  },
  {
    key: "name",
    label: "2. Reserve your name",
    body: "Via ACRA BizFile+, S$15. Avoid reserved/restricted terms (bank, consulting without cert, etc.). We'll pretend-check for you.",
  },
  {
    key: "register",
    label: "3. Register",
    body: "Submit incorporation forms, appoint directors, pay fee. In real life: via BizFile+. Here: our mock generates a fake UEN.",
  },
  {
    key: "post",
    label: "4. After registration",
    body: "Open a business bank account, register for CPF as self-employed if needed, note your GST threshold, and set up bookkeeping.",
  },
];

export const RESERVED_NAME_TERMS = [
  "bank",
  "finance",
  "insurance",
  "university",
  "temasek",
  "gov",
  "cpf",
  "acra",
  "iras",
  "mas",
];

export function looksReserved(name: string): string | null {
  const n = name.trim().toLowerCase();
  for (const term of RESERVED_NAME_TERMS) {
    if (n.includes(term)) return term;
  }
  return null;
}

export function mockAcraUEN(): string {
  // Format: YYYY + 5 digits + check letter (not real UEN schema, but feels right)
  const year = new Date().getFullYear();
  const digits = Math.floor(10000 + Math.random() * 89999).toString();
  const check = "ABCDEFGHJKLMNPRTX"[Math.floor(Math.random() * 17)];
  return `${year}${digits}${check}`;
}

export const BANK_PICKS = [
  { name: "DBS Business Account", note: "Ubiquitous. Instant with MyInfo." },
  { name: "OCBC Business Growth Account", note: "Unlimited FAST transfers. No min balance Yr 1." },
  { name: "UOB eBusiness", note: "Integrates with Xero. Good for SME." },
  { name: "Aspire", note: "Virtual-first. Great UX. Corp card included." },
  { name: "Wise Business", note: "Multi-currency if you work with overseas clients." },
];

export const BOOKKEEPING = [
  { name: "Xero", note: "Accountant-friendly. Used by most SG SMEs." },
  { name: "QuickBooks Online", note: "Cheaper tier, solid expense tracking." },
  { name: "Wave", note: "Free for solo operators." },
];
