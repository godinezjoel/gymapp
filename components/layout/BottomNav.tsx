"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, Home, LineChart } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  { href: "/", label: "Start", icon: Home },
  { href: "/workouts", label: "Workouts", icon: Dumbbell },
  { href: "/weight", label: "Gewicht", icon: LineChart },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Hauptnavigation"
      className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+12px)]"
    >
      <ul className="flex items-center gap-1 rounded-full bg-white/70 p-1.5 shadow-lg shadow-black/10 ring-1 ring-black/5 backdrop-blur-xl">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <li key={href}>
              <Link
                href={href}
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
  );
}
