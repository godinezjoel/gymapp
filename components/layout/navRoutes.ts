// Auf der Login-Seite gibt es noch nichts, wohin man navigieren dürfte – und auf
// der Offline-Seite führte jedes Ziel nur wieder dorthin zurück. Beide Seiten
// zeigen deshalb keine Navigation.
export const NAV_FREE_ROUTES: readonly string[] = ["/login", "/offline"];

// Breite der Seitenleiste als Innenabstand des Inhalts. Die beiden Werte gehören
// zusammen: ändert sich `w-60` in BottomNav, muss dieser mitwandern.
export const SIDEBAR_OFFSET_CLASS = "md:pl-60";
