import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import type { NextResponse } from "next/server";
import type { Database } from "@/types/database";
import { env } from "@/lib/env";

function applyCookieSet(
  cookieTarget: Pick<ReturnType<typeof cookies>, "set">,
  cookiesToSet: Array<{ name: string; value: string; options: Parameters<typeof cookieTarget.set>[2] }>,
) {
  for (const { name, value, options } of cookiesToSet) {
    cookieTarget.set(name, value, options);
  }
}

export function createSupabaseActionClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        applyCookieSet(cookieStore, cookiesToSet);
      },
    },
  });
}

export function createSupabaseMiddlewareClient(request: NextRequest, response: NextResponse) {
  return createServerClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        applyCookieSet(response.cookies, cookiesToSet);
      },
    },
  });
}