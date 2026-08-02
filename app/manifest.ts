import type { MetadataRoute } from "next";

// Wird unter /manifest.webmanifest ausgeliefert. Der Pfad ist in middleware.ts
// von der Passwortprüfung ausgenommen: Browser laden das Manifest ohne Cookies,
// hinter der Sperre bekäme der Installationsdialog eine Weiterleitung auf
// /login statt der Datei und böte "Zum Home-Bildschirm" gar nicht erst an.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Fitness-Tracker",
    // Unter dem Home-Bildschirm-Symbol ist ab etwa 12 Zeichen Schluss, danach
    // kürzt iOS mit Auslassungspunkten.
    short_name: "Fitness",
    description: "Private Fitness-Tracking-App",
    lang: "de",
    dir: "ltr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    // Entspricht dem weißen Seitenhintergrund – der Startbildschirm blitzt
    // sonst in einer anderen Farbe auf, bevor die App steht.
    background_color: "#ffffff",
    theme_color: "#0f1720",
    categories: ["health", "fitness", "lifestyle"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // Getrennte maskable-Varianten: Android beschneidet die Kachel auf eine
      // beliebige Form und würde bei den "any"-Icons in die Rundung schneiden.
      {
        src: "/icons/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
