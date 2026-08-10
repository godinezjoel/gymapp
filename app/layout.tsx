import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppFrame } from "@/components/layout/AppFrame";
import { BottomNav } from "@/components/layout/BottomNav";
import { NavActionProvider } from "@/components/layout/NavActionContext";
import { ServiceWorkerRegistrar } from "@/components/pwa/ServiceWorkerRegistrar";

export const metadata: Metadata = {
  title: "Fitness-Tracker",
  description: "Private Fitness-Tracking-App",
  applicationName: "Fitness-Tracker",
  manifest: "/manifest.webmanifest",

  // iOS liest das Manifest nur teilweise; Vollbildmodus, Titel und
  // Statusleiste kommen dort weiterhin aus diesen herstellereigenen Angaben.
  appleWebApp: {
    capable: true,
    // Steht unter dem Symbol auf dem Home-Bildschirm.
    title: "Fitness",
    // "default" statt "black-translucent": letzteres schöbe den Inhalt unter
    // die Statusleiste, wofür jede Seite oben zusätzlich um
    // env(safe-area-inset-top) einrücken müsste. Der weiße Balken mit dunkler
    // Schrift passt ohnehin zum hellen Seitenhintergrund.
    statusBarStyle: "default",
  },

  // iOS verlinkt sonst Zahlen als Telefonnummern – in einer App voller
  // Gewichte, Wiederholungen und Maße wäre praktisch jede Zeile betroffen.
  formatDetection: { telephone: false },

  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    // Ohne diese Angabe erzeugt iOS beim Hinzufügen zum Home-Bildschirm einen
    // Bildschirmausschnitt der Seite als Symbol.
    apple: [{ url: "/icons/apple-touch-icon-180.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Zeichnet bis in die abgerundeten Ecken und um die Dynamic Island herum;
  // Grundlage dafür, dass env(safe-area-inset-*) überhaupt Werte liefert.
  viewportFit: "cover",
  themeColor: "#0f1720",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-white text-neutral-900 antialiased">
        <NavActionProvider>
          <AppFrame>{children}</AppFrame>
          <BottomNav />
        </NavActionProvider>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
