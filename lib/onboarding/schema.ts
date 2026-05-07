import { z } from "zod";

export const roleSchema = z.object({
  role: z.enum(["freelancer", "employer", "both"], {
    required_error: "Please select a role",
  }),
});

export const profileBasicsSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  handle: z
    .string()
    .min(3, "Handle must be at least 3 characters")
    .max(30, "Handle must be under 30 characters")
    .regex(/^[a-z0-9_-]+$/, "Only lowercase letters, numbers, hyphens, and underscores"),
  headline: z.string().min(5, "Headline must be at least 5 characters").max(120),
  bio: z.string().max(500, "Bio must be under 500 characters").optional().default(""),
});

export const skillsSchema = z.object({
  skills: z.array(z.string()).min(1, "Select at least one skill"),
});

export const portfolioSchema = z.object({
  portfolioUrl: z.string().url("Must be a valid URL").nullable(),
  portfolioTitle: z.string().optional().default(""),
});

export const certificationSchema = z.object({
  certFile: z.string().nullable(),
  certTitle: z.string().optional().default(""),
});

export type RoleInput = z.infer<typeof roleSchema>;
export type ProfileBasicsInput = z.infer<typeof profileBasicsSchema>;
export type SkillsInput = z.infer<typeof skillsSchema>;
export type PortfolioInput = z.infer<typeof portfolioSchema>;
export type CertificationInput = z.infer<typeof certificationSchema>;
