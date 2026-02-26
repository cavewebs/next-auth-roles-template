"use server";

import bcrypt from "bcryptjs";

import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/validations/auth";
import { getUserByEmailForAuth } from "@/lib/user";

export async function register(values: {
  name: string;
  email: string;
  password: string;
}) {
  const validated = registerSchema.safeParse(values);

  if (!validated.success) {
    return { error: "Invalid fields." };
  }

  const { name, email, password } = validated.data;

  const existingUser = await getUserByEmailForAuth(email.toLowerCase());

  if (existingUser) {
    if (existingUser.password) {
      return { error: "An account with this email already exists." };
    }

    return {
      error:
        "An account with this email already exists. Try signing in with Google or magic link.",
    };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    },
  });

  return { success: "Account created! You can now sign in." };
}
