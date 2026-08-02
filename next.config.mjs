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
    // Der Client-Router-Cache hielt nach Datenänderungen (auch von außerhalb der
    // App, z. B. direkte DB-Edits) bis zu 30s eine veraltete Seite vor – sichtbar
    // als "eingefrorene" Einträge, die es in der DB längst nicht mehr gibt.
    // dynamic: 0 erzwingt bei jeder Navigation einen frischen Server-Request.
    staleTimes: {
      dynamic: 0,
    },
  },
};

export default nextConfig;
