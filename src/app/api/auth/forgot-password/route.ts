import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ForgotPasswordSchema } from "@/lib/validations/auth";
import { generatePasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedFields = ForgotPasswordSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const { email } = validatedFields.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: true,
          message: "If an account exists, a reset email has been sent.",
        },
        { status: 200 }
      );
    }

    const passwordResetToken = await generatePasswordResetToken(email, user.id);
    await sendPasswordResetEmail(email, passwordResetToken.token);

    return NextResponse.json({
      success: true,
      message: "Password reset email sent!",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
