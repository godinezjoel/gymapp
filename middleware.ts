import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseMiddlewareClient } from "@/lib/supabase/ssr";
import { isValidAccessToken } from "@/lib/supabase/jwt";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  const supabase = createSupabaseMiddlewareClient(request, response);

  // Schneller Pfad: getSession() liest nur das Cookie (kein Netzwerk-Call),
  // die Signatur wird lokal gegen den öffentlichen JWKS-Endpunkt geprüft. Das
  // deckt praktisch jede Navigation ab, solange der Zugriffstoken noch gültig
  // ist (er lebt eine Stunde). Erst wenn kein gültiges Token vorliegt, greift
  // getUser() – das erneuert bei Bedarf über den Refresh-Token und schreibt
  // die neuen Cookies in die Response. So bleibt man wochenlang eingeloggt,
  // ohne bei jeder Seite auf Supabase warten zu müssen.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session && (await isValidAccessToken(session.access_token))) {
    return response;
  }

  const { data } = await supabase.auth.getUser();

  if (data.user) {
    return response;
  }

  const loginUrl = new URL("/login", request.url);
  if (request.nextUrl.pathname !== "/") {
    loginUrl.searchParams.set("from", request.nextUrl.pathname + request.nextUrl.search);
  }
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Ausgenommen sind genau die Pfade, die ohne gültige Sitzung erreichbar sein
  // müssen:
  //
  //   login                  sonst entstünde eine Redirect-Schleife
  //   offline                die Fallback-Seite des Service Workers; sie wird
  //                          gebraucht, wenn gerade nichts erreichbar ist –
  //                          eine Weiterleitung auf /login wäre dann ebenso
  //                          wenig ladbar
  //   manifest.webmanifest   Browser laden das Manifest ohne Cookies. Kommt
  //                          hier eine Weiterleitung zurück, bietet der Browser
  //                          "Installieren" bzw. "Zum Home-Bildschirm" gar
  //                          nicht erst an
  //   sw.js                  das Service-Worker-Skript wird auch beim
  //                          turnusmäßigen Aktualisieren geladen
  //   icons/                 App-Icons holt iOS beim Hinzufügen zum
  //                          Home-Bildschirm teils ohne Cookies
  //   _next/*                Build-Assets
  matcher: [
    "/((?!login|offline|manifest.webmanifest|sw.js|icons/|_next/static|_next/image|favicon.ico).*)",
  ],
};
