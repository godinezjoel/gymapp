import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (await verifySessionToken(token)) {
    return NextResponse.next();
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
