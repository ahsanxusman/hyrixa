import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const domain = process.env.AUTH_URL;

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${domain}/auth/verify-email?token=${token}`;

  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: email,
    subject: "Verify your email address",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Verify Your Email</h2>
        <p>Thank you for signing up! Please click the button below to verify your email address.</p>
        <a href="${confirmLink}" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; margin: 16px 0;">
          Verify Email
        </a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666; word-break: break-all;">${confirmLink}</p>
        <p>This link will expire in 1 hour.</p>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${domain}/auth/reset-password?token=${token}`;

  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: email,
    subject: "Reset your password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset Your Password</h2>
        <p>You requested to reset your password. Click the button below to proceed.</p>
        <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; margin: 16px 0;">
          Reset Password
        </a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666; word-break: break-all;">${resetLink}</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
      </div>
    `,
  });
};

export const sendNotificationEmail = async (
  email: string,
  title: string,
  message: string,
  link?: string
) => {
  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: email,
    subject: title,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${title}</h2>
        <p>${message}</p>
        ${
          link
            ? `
          <a href="${link}" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; margin: 16px 0;">
            View Details
          </a>
        `
            : ""
        }
      </div>
    `,
  });
};

export const sendJobMatchEmail = async (
  email: string,
  jobTitle: string,
  companyName: string,
  matchScore: number,
  jobId: string
) => {
  const jobLink = `${domain}/jobs/${jobId}`;

  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: email,
    subject: `New Job Match: ${jobTitle} at ${companyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>🎯 New Job Match Found!</h2>
        <p>Great news! We found a job that matches your profile with a <strong>${matchScore}% match score</strong>.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${jobTitle}</h3>
          <p style="color: #6b7280; margin: 5px 0;">${companyName}</p>
          <div style="display: inline-block; padding: 4px 12px; background-color: #10b981; color: white; border-radius: 4px; font-size: 14px; margin-top: 10px;">
            ${matchScore}% Match
          </div>
        </div>
        
        <a href="${jobLink}" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; margin: 16px 0;">
          View Job Details
        </a>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
          This match was found based on your profile, skills, and preferences.
        </p>
      </div>
    `,
  });
};

export const sendApplicationStatusEmail = async (
  email: string,
  jobTitle: string,
  companyName: string,
  status: string,
  applicationId: string
) => {
  const statusMessages: Record<string, string> = {
    REVIEWING: "Your application is being reviewed",
    INTERVIEWING: "You have been selected for an interview",
    OFFERED: "Congratulations! You received an offer",
    ACCEPTED: "Your acceptance has been confirmed",
    REJECTED: "Unfortunately, you were not selected",
  };

  const message =
    statusMessages[status] || "Your application status has been updated";
  const appLink = `${domain}/dashboard/applications/${applicationId}`;

  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: email,
    subject: `Application Update: ${jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Application Status Update</h2>
        <p>${message} for the position of <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.</p>
        
        <a href="${appLink}" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; margin: 16px 0;">
          View Application
        </a>
      </div>
    `,
  });
};
