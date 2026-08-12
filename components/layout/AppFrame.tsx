"use client";

import { usePathname } from "next/navigation";
import { App } from "konsta/react";
import { NAV_FREE_ROUTES, SIDEBAR_OFFSET_CLASS } from "@/components/layout/navRoutes";
import { cn } from "@/lib/utils/cn";

/**
 * Rückt den Seiteninhalt neben die Seitenleiste, die ab `md` links steht.
 *
 * Muss dieselben Ausnahmen kennen wie die Navigation selbst: auf Login- und
 * Offline-Seite gibt es keine Seitenleiste, und ein Inhalt, der trotzdem um
 * deren Breite eingerückt wäre, stünde dort sichtbar aus der Mitte gerückt.
 *
 * `children` kommt als Prop herein und bleibt dadurch serverseitig gerendert –
 * die Client-Grenze liegt nur um dieses <div>.
 */
export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hasSidebar = !NAV_FREE_ROUTES.includes(pathname);

  return (
    // dark={false}: die App unterstützt keinen Dark Mode, safeAreas={false}:
    // die eigenen safe-top/safe-bottom-Utilities decken das bereits gezielt
    // ab (z.B. an der schwebenden Pille) statt es global auf den Container zu
    // legen.
    <App theme="ios" dark={false} safeAreas={false} className="min-h-screen bg-white">
      <div className={cn(hasSidebar && SIDEBAR_OFFSET_CLASS)}>{children}</div>
    </App>
  );
}
