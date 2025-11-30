import { z } from "zod";

export const JobSchema = z
  .object({
    title: z
      .string()
      .min(3, "Job title must be at least 3 characters")
      .max(100, "Job title must not exceed 100 characters"),
    description: z
      .string()
      .min(50, "Description must be at least 50 characters")
      .max(5000, "Description must not exceed 5000 characters"),
    requirements: z
      .string()
      .min(20, "Requirements must be at least 20 characters")
      .max(3000, "Requirements must not exceed 3000 characters"),
    responsibilities: z
      .string()
      .min(20, "Responsibilities must be at least 20 characters")
      .max(3000, "Responsibilities must not exceed 3000 characters"),
    location: z.string().min(2, "Location is required"),
    jobType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"]),
    experienceLevel: z.enum(["ENTRY", "INTERMEDIATE", "SENIOR", "EXECUTIVE"]),
    salaryMin: z.number().min(0).optional(),
    salaryMax: z.number().min(0).optional(),
    currency: z.string().default("USD"),
    skills: z.array(z.string()).min(1, "At least one skill is required"),
    benefits: z.array(z.string()).optional(),
    status: z.enum(["DRAFT", "ACTIVE", "CLOSED"]).default("DRAFT"),
    applicationDeadline: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.salaryMin && data.salaryMax) {
        return data.salaryMax >= data.salaryMin;
      }
      return true;
    },
    {
      message: "Maximum salary must be greater than or equal to minimum salary",
      path: ["salaryMax"],
    }
  );

export type JobInput = z.infer<typeof JobSchema>;
