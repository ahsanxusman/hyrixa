import { z } from "zod";

export const CandidateProfileSchema = z.object({
  bio: z
    .string()
    .min(10, "Bio must be at least 10 characters")
    .max(500, "Bio must not exceed 500 characters")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number")
    .optional()
    .or(z.literal("")),
  location: z
    .string()
    .min(2, "Location must be at least 2 characters")
    .optional()
    .or(z.literal("")),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  yearsOfExperience: z.number().min(0).max(50).optional(),
  experienceLevel: z
    .enum(["ENTRY", "INTERMEDIATE", "SENIOR", "EXECUTIVE"])
    .optional(),
  education: z
    .array(
      z.object({
        degree: z.string().min(1, "Degree is required"),
        institution: z.string().min(1, "Institution is required"),
        field: z.string().min(1, "Field of study is required"),
        startYear: z.number().min(1950).max(new Date().getFullYear()),
        endYear: z
          .number()
          .min(1950)
          .max(new Date().getFullYear() + 10)
          .optional(),
        current: z.boolean().optional(),
      })
    )
    .optional(),
  workExperience: z
    .array(
      z.object({
        title: z.string().min(1, "Job title is required"),
        company: z.string().min(1, "Company is required"),
        location: z.string().min(1, "Location is required"),
        startDate: z.string(),
        endDate: z.string().optional(),
        current: z.boolean().optional(),
        description: z.string().optional(),
      })
    )
    .optional(),
});

export const CompanyProfileSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  bio: z
    .string()
    .min(10, "Bio must be at least 10 characters")
    .max(500, "Bio must not exceed 500 characters")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number")
    .optional()
    .or(z.literal("")),
  location: z.string().min(2, "Location must be at least 2 characters"),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  companySize: z.string().min(1, "Company size is required"),
  industry: z.string().min(1, "Industry is required"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  foundedYear: z.number().min(1800).max(new Date().getFullYear()).optional(),
  headquarters: z.string().optional(),
});

export type CandidateProfileInput = z.infer<typeof CandidateProfileSchema>;
export type CompanyProfileInput = z.infer<typeof CompanyProfileSchema>;
