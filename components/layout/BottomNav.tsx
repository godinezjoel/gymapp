"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Dumbbell, Home, LineChart } from "lucide-react";
import { NAV_FREE_ROUTES } from "@/components/layout/navRoutes";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  { href: "/", label: "Start", icon: Home },
  { href: "/workoutplan", label: "Trainingsplan", icon: CalendarDays },
  { href: "/workouts", label: "Workouts", icon: Dumbbell },
  // Gewicht und Körpermaße waren zwei Reiter mit demselben Aufbau (Formular,
  // Trend, Diagramm, Verlauf) über Zahlen, die man ohnehin nebeneinander liest.
  { href: "/analytics", label: "Analytics", icon: LineChart },
] as const;

// Die Breite der Seitenleiste unten (w-60) hat ihr Gegenstück im Innenabstand
// des Inhalts – siehe SIDEBAR_OFFSET_CLASS in navRoutes.ts.
function isCurrent(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/**
 * Hauptnavigation in zwei Ausprägungen.
 *
 * Die schwebende Pille am unteren Rand ist eine reine Daumen-Navigation: Symbole
 * ohne Text, mittig über dem Inhalt. Am Desktop liegt sie quer – sie verdeckt
 * dort Inhalt, obwohl links 400px Platz frei stehen, und Symbole ohne
 * Beschriftung sind mit der Maus schlicht Ratearbeit. Ab `md` steht deshalb eine
 * klassische Seitenleiste mit Beschriftungen; nur eine der beiden ist je
 * gerendert (display:none blendet die andere auch für Screenreader aus).
 */
export function BottomNav() {
  const pathname = usePathname();

  if (NAV_FREE_ROUTES.includes(pathname)) return null;

  return (
    <>
      {/* Desktop: feste Seitenleiste. */}
      <nav
        aria-label="Hauptnavigation"
        className="fixed inset-y-0 left-0 z-50 hidden w-60 flex-col border-r border-neutral-200 bg-white px-3 py-6 md:flex"
      >
        <span className="px-3 text-base font-semibold tracking-tight">Fitness-Tracker</span>

        <ul className="mt-8 flex flex-col gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = isCurrent(pathname, href);

            return (
              <li key={href}>
                <Link
                  href={href}
                  prefetch={false}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
                  )}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.25 : 1.75} aria-hidden />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Mobil: schwebende Pille. */}
      <nav
        aria-label="Hauptnavigation"
        className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] md:hidden"
      >
        {/* backdrop-blur über scrollendem Inhalt muss pro Scroll-Frame neu
            gesampelt werden – auf Mobilgeräten die teuerste Stelle im Layout.
            Kleinerer Radius (md statt xl) plus höhere Deckkraft kostet spürbar
            weniger GPU-Zeit bei praktisch gleicher Optik. */}
        <ul className="flex items-center gap-1 rounded-full bg-white/80 p-1.5 shadow-lg shadow-black/10 ring-1 ring-black/5 backdrop-blur-md">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = isCurrent(pathname, href);

            return (
              <li key={href}>
                <Link
                  href={href}
                  // Solange staleTimes.dynamic auf 0 steht, wird jede vorab
                  // geladene Route sofort wieder verworfen – der Prefetch aller
                  // vier Ziele auf jeder Seite wäre reine Serverlast ohne Nutzen.
                  prefetch={false}
                  aria-label={label}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
                    isActive
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-500 active:bg-neutral-900/5",
                  )}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.25 : 1.75} aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
