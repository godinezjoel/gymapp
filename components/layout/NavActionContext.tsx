"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type NavActionContextValue = {
  action: ReactNode | null;
  setAction: (action: ReactNode | null) => void;
};

const NavActionContext = createContext<NavActionContextValue | null>(null);

/**
 * Hält die Aktion, die eine Seite neben der mobilen Navigation zeigen will.
 *
 * Muss oberhalb von AppFrame und BottomNav sitzen: beide sind Geschwister im
 * RootLayout, der Kontext ist ihre einzige Verbindung zueinander.
 */
export function NavActionProvider({ children }: { children: ReactNode }) {
  const [action, setAction] = useState<ReactNode | null>(null);
  const value = useMemo(() => ({ action, setAction }), [action]);

  return <NavActionContext.Provider value={value}>{children}</NavActionContext.Provider>;
}

export function useNavActionSlot(): NavActionContextValue {
  const ctx = useContext(NavActionContext);
  if (!ctx) {
    throw new Error("useNavActionSlot muss innerhalb von NavActionProvider verwendet werden");
  }
  return ctx;
}
