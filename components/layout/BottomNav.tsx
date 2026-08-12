"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Dumbbell, Home } from "lucide-react";
import { NAV_FREE_ROUTES } from "@/components/layout/navRoutes";
import { useNavActionSlot } from "@/components/layout/NavActionContext";
import { AppLink } from "@/components/layout/AppLink";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  { href: "/", label: "Heute", icon: Home },
  { href: "/workouts", label: "Training", icon: Dumbbell },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
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
  const { action } = useNavActionSlot();

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

      {/* Mobil: schwebende Pille, immer mittig und unabhängig von der
          Aktion – deren Anwesenheit darf die Navigation nicht verschieben. */}
      <nav
        aria-label="Hauptnavigation"
        className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+20px)] md:hidden"
      >
        {/* Reines Icon-Layout ohne Beschriftung: das aktive Symbol trägt statt
            einer Textfarbe einen eigenen grünen Kreis, wie eine gefüllte
            Statusfläche statt eines Textwechsels. */}
        <div className="flex items-center gap-1 rounded-full bg-white p-2 shadow-2xl ring-1 shadow-black/10 ring-black/[0.06]">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = isCurrent(pathname, href);

            return (
              <AppLink
                key={href}
                href={href}
                direction="tab"
                aria-label={label}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-full transition-colors active:scale-90 motion-reduce:transition-none",
                  isActive
                    ? "bg-emerald-500 text-white"
                    : "text-neutral-400 hover:text-neutral-600",
                )}
              >
                <Icon size={22} strokeWidth={isActive ? 2.25 : 1.75} aria-hidden />
              </AppLink>
            );
          })}
        </div>
      </nav>

      {/* Von der Seite angemeldete Aktion (siehe NavAddButton): eigene Ecke
          unten rechts. +28px statt +20px: die Pille legt um ihre Kreise noch
          8px Polster (p-2), ohne den Ausgleich stünde der Knopf 8px zu tief. */}
      {action && (
        <div className="fixed right-4 bottom-[calc(env(safe-area-inset-bottom)+28px)] z-50 md:hidden">
          {action}
        </div>
      )}
    </>
  );
}
