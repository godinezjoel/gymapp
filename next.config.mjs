/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
