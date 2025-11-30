import { Profile } from "@prisma/client";

export function buildCandidateProfileText(profile: any): string {
  const parts: string[] = [];

  // Bio
  if (profile.bio) {
    parts.push(`Bio: ${profile.bio}`);
  }

  // Skills
  if (profile.skills && profile.skills.length > 0) {
    parts.push(`Skills: ${profile.skills.join(", ")}`);
  }

  // Experience level and years
  if (profile.experienceLevel) {
    parts.push(`Experience Level: ${profile.experienceLevel}`);
  }
  if (profile.yearsOfExperience) {
    parts.push(`Years of Experience: ${profile.yearsOfExperience}`);
  }

  // Education
  if (profile.education && Array.isArray(profile.education)) {
    const educationText = profile.education
      .map(
        (edu: any) => `${edu.degree} in ${edu.field} from ${edu.institution}`
      )
      .join(". ");
    if (educationText) {
      parts.push(`Education: ${educationText}`);
    }
  }

  // Work Experience
  if (profile.workExperience && Array.isArray(profile.workExperience)) {
    const workText = profile.workExperience
      .map(
        (work: any) =>
          `${work.title} at ${work.company}. ${work.description || ""}`
      )
      .join(". ");
    if (workText) {
      parts.push(`Work Experience: ${workText}`);
    }
  }

  // CV Text
  if (profile.cvText) {
    parts.push(`CV Content: ${profile.cvText}`);
  }

  // Location
  if (profile.location) {
    parts.push(`Location: ${profile.location}`);
  }

  return parts.join("\n\n");
}

export function buildJobText(job: any): string {
  const parts: string[] = [];

  parts.push(`Job Title: ${job.title}`);
  parts.push(`Description: ${job.description}`);
  parts.push(`Requirements: ${job.requirements}`);
  parts.push(`Responsibilities: ${job.responsibilities}`);

  if (job.skills && job.skills.length > 0) {
    parts.push(`Required Skills: ${job.skills.join(", ")}`);
  }

  parts.push(`Experience Level: ${job.experienceLevel}`);
  parts.push(`Job Type: ${job.jobType}`);
  parts.push(`Location: ${job.location}`);

  if (job.benefits && job.benefits.length > 0) {
    parts.push(`Benefits: ${job.benefits.join(", ")}`);
  }

  return parts.join("\n\n");
}
