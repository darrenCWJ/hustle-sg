// Mock SkillsFuture/MyCerts certificate catalog.
// Realistic SG WSQ and accreditation data for the demo portal.

export interface SFCert {
  id: string;
  title: string;
  issuer: string;
  kind: "wsq" | "accreditation" | "university" | "other";
  sector: string;
  skills: string[];
  issued_at: string; // ISO date string used as the mock "issue date"
}

export const SF_CATALOG: SFCert[] = [
  {
    id: "sf-ux-advanced",
    title: "WSQ Advanced Certificate in UX Design",
    issuer: "SkillsFuture SG",
    kind: "wsq",
    sector: "Infocomm Technology",
    skills: ["figma", "wireframing", "prototyping", "accessibility", "design systems"],
    issued_at: "2023-09-01",
  },
  {
    id: "sf-digital-mktg",
    title: "WSQ Professional Diploma in Digital Marketing",
    issuer: "SkillsFuture SG",
    kind: "wsq",
    sector: "Marketing",
    skills: ["seo", "social media marketing", "google ads", "analytics", "content strategy"],
    issued_at: "2023-07-15",
  },
  {
    id: "sf-data-analytics",
    title: "WSQ Advanced Certificate in Data Analytics",
    issuer: "SkillsFuture SG",
    kind: "wsq",
    sector: "Infocomm Technology",
    skills: ["python", "sql", "data visualisation", "machine learning", "tableau"],
    issued_at: "2024-02-20",
  },
  {
    id: "sf-acta",
    title: "Advanced Certificate in Training and Assessment (ACTA)",
    issuer: "Institute for Adult Learning (IAL)",
    kind: "accreditation",
    sector: "Education & Training",
    skills: ["instructional design", "adult learning", "facilitation", "assessment"],
    issued_at: "2022-11-10",
  },
  {
    id: "sf-wsh-officer",
    title: "WSQ Certificate for WSH Officer",
    issuer: "WSH Council",
    kind: "wsq",
    sector: "Workplace Safety & Health",
    skills: ["risk assessment", "workplace safety", "incident investigation", "safety management"],
    issued_at: "2023-04-05",
  },
  {
    id: "sf-food-hygiene",
    title: "WSQ Food Hygiene Officer Course",
    issuer: "SkillsFuture SG",
    kind: "wsq",
    sector: "Food & Beverage",
    skills: ["food safety", "haccp", "food hygiene", "food handling"],
    issued_at: "2024-01-08",
  },
  {
    id: "sf-security-ops",
    title: "WSQ Certificate in Security Operations",
    issuer: "Security Industry Institute (SII)",
    kind: "accreditation",
    sector: "Security",
    skills: ["security operations", "patrol", "access control", "incident reporting"],
    issued_at: "2023-06-22",
  },
  {
    id: "sf-retail-ops",
    title: "WSQ Advanced Certificate in Retail Operations",
    issuer: "SkillsFuture SG",
    kind: "wsq",
    sector: "Retail",
    skills: ["merchandising", "inventory management", "customer service", "pos systems"],
    issued_at: "2022-08-30",
  },
  {
    id: "sf-project-mgmt",
    title: "WSQ Diploma in Project Management",
    issuer: "SkillsFuture SG",
    kind: "wsq",
    sector: "Business Management",
    skills: ["project planning", "stakeholder management", "agile", "risk management", "pmp"],
    issued_at: "2023-12-14",
  },
  {
    id: "sf-early-childhood",
    title: "WSQ Certificate in Early Childhood Care and Education",
    issuer: "Early Childhood Development Agency (ECDA)",
    kind: "accreditation",
    sector: "Education & Training",
    skills: ["child development", "early learning", "curriculum planning", "childcare"],
    issued_at: "2024-03-01",
  },
  {
    id: "sf-it-sysadmin",
    title: "WSQ Certificate in IT Systems Administration",
    issuer: "SkillsFuture SG",
    kind: "wsq",
    sector: "Infocomm Technology",
    skills: ["networking", "linux", "windows server", "cloud infrastructure", "cybersecurity"],
    issued_at: "2023-10-17",
  },
  {
    id: "sf-beauty-therapy",
    title: "WSQ Certificate in Beauty Therapy",
    issuer: "SkillsFuture SG",
    kind: "wsq",
    sector: "Personal Services",
    skills: ["skin analysis", "facials", "body treatments", "salon management"],
    issued_at: "2022-05-19",
  },
];
