"use client";

import { Navbar, NavbarBackLink } from "konsta/react";
import { BackButton } from "@/components/ui/BackButton";
import { useAppRouter } from "@/components/layout/useAppRouter";

/**
 * Seitenkopf in zwei Ausprägungen: mobil eine echte Konsta-`Navbar` (iOS-Look,
 * mit Zurück-Pfeil), am Desktop weiterhin die bisherige einfache Zeile mit dem
 * bestehenden `BackButton` – die Seitenleiste dort macht eine zweite
 * Navigationsebene überflüssig.
 *
 * Ersetzt das bisher pro Seite wiederholte `<h1>` + optionalen `BackButton`.
 */
export function PageHeader({
  title,
  subtitle,
  back = false,
  fallbackHref = "/",
  right,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  fallbackHref?: string;
  right?: React.ReactNode;
}) {
  const router = useAppRouter();

  function goBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref, "pop");
    }
  }

  return (
    <>
      <div className="-mx-4 -mt-6 mb-2 md:hidden">
        <Navbar
          title={title}
          subtitle={subtitle}
          left={
            back ? <NavbarBackLink text="Back" showText={false} onClick={goBack} /> : undefined
          }
          right={right}
          colors={{ bgIos: "bg-transparent", textIos: "text-neutral-900" }}
        />
      </div>

      <div className="hidden items-start justify-between gap-2 md:flex">
        <div className="flex items-start gap-2">
          {back && <BackButton fallbackHref={fallbackHref} />}
          <div>
            <h1 className="text-xl font-semibold md:text-2xl">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
          </div>
        </div>
        {right}
      </div>
    </>
  );
}
