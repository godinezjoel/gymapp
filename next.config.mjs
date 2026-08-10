/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ein `next build` schreibt in dasselbe Verzeichnis, aus dem ein laufender
  // `next dev` liest – das mischt Development- und Production-Artefakte und
  // führt zu Phantomfehlern (404 auf existierende Routen, kaputter
  // webpack-Cache). Mit NEXT_DIST_DIR=.next-build lässt sich ein Build daher
  // an einem laufenden Dev-Server vorbei ausführen. Default unverändert.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // /weight und /measurements sind in /analytics aufgegangen. Die Weiterleitung
  // bleibt dauerhaft stehen: die App läuft als PWA vom Home-Bildschirm, und ein
  // dort abgelegter Verweis oder ein offener Tab zeigt sonst ins Leere.
  async redirects() {
    return [
      { source: "/weight", destination: "/analytics", permanent: true },
      { source: "/measurements", destination: "/analytics", permanent: true },
    ];
  },
  experimental: {
    // Das eigentliche Problem (veraltete Daten nach direkten DB-Edits) liegt am
    // Fetch-Cache, nicht hier – supabaseAdmin schickt seit lib/supabase/server.ts
    // jede Anfrage mit `cache: "no-store"`, umgeht also Next' Data Cache bereits
    // vollständig. Der Router-Cache (hier) darf deshalb wieder normal cachen;
    // dynamic: 0 hat nur noch jede Navigation künstlich verlangsamt.
    staleTimes: {
      dynamic: 30,
    },
  },
};

export default nextConfig;
