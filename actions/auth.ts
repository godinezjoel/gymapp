"use server";

import { redirect } from "next/navigation";
import { createSupabaseActionClient } from "@/lib/supabase/ssr";
import { loginSchema, type LoginInput } from "@/lib/validation/auth";

export async function loginAction(input: LoginInput, redirectTo = "/"): Promise<void> {
  const { email, password } = loginSchema.parse(input);

  const supabase = createSupabaseActionClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  const safeRedirect = redirectTo.startsWith("/") && !redirectTo.startsWith("//") ? redirectTo : "/";
  redirect(safeRedirect);
}

export async function logoutAction(): Promise<void> {
  const supabase = createSupabaseActionClient();
  await supabase.auth.signOut();
  redirect("/login");
}
