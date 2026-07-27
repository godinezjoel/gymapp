"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE_NAME, computeSessionToken, timingSafeEqual } from "@/lib/auth";
import { loginSchema, type LoginInput } from "@/lib/validation/auth";

export async function loginAction(input: LoginInput, redirectTo = "/"): Promise<void> {
  const { passphrase } = loginSchema.parse(input);

  const expected = process.env.APP_PASSPHRASE;
  if (!expected) {
    throw new Error("Server ist nicht korrekt konfiguriert (APP_PASSPHRASE fehlt).");
  }
  if (!timingSafeEqual(passphrase, expected)) {
    throw new Error("Falsches Passwort.");
  }

  const token = await computeSessionToken(expected);
  cookies().set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 Tage
  });

  // Nur interne, relative Pfade zulassen – verhindert einen Open-Redirect über
  // einen manipulierten "from"-Query-Parameter (z. B. "//evil.com").
  const safeRedirect =
    redirectTo.startsWith("/") && !redirectTo.startsWith("//") ? redirectTo : "/";
  redirect(safeRedirect);
}

export async function logoutAction(): Promise<void> {
  cookies().delete(AUTH_COOKIE_NAME);
  redirect("/login");
}
