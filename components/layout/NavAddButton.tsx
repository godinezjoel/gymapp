"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Fab } from "konsta/react";
import { useNavActionSlot } from "@/components/layout/NavActionContext";

// Exakt so groß wie der grüne Aktiv-Kreis in der Navigationspille (h-14 w-14)
// – der Bodenabstand in BottomNav gleicht die 8px Pillenpolster aus, sonst
// stünden beide Kreise nicht auf derselben Linie.
//
// !bg-black: Konstas Fab hüllt seinen Inhalt immer in eine <Glass>-Komponente
// (Frosted-Glass-Effekt) – die bringt ihr eigenes, halbtransparentes
// bg-ios-light-glass mit, das Fab nie mit der eigenen colors-Prop
// überschreibt. Ohne !important gewinnt je nach Tailwind-Regelreihenfolge
// mal die eine, mal die andere Klasse, und der Knopf wirkt milchig-grau statt
// schwarz.
const BUTTON_CLASSES =
  "flex h-14 w-14 items-center justify-center rounded-full !bg-black !text-white shadow-xl shadow-black/25 ring-1 ring-black/5 backdrop-blur-none transition-transform active:scale-90 motion-reduce:transition-none";
const FAB_COLORS = { bgIos: "bg-black", textIos: "text-white" };

type Props = { label: string } & (
  { href: string; onClick?: never } | { href?: never; onClick: () => void }
);

/**
 * Meldet einen Aktionsknopf neben der mobilen Navigation an, statt ihn selbst
 * zu zeichnen – gerendert wird er von BottomNav, damit Höhe und Zeile beider
 * garantiert übereinstimmen, unabhängig davon, welche Seite ihn anmeldet.
 *
 * Rendert selbst nichts sichtbares an ihrer Stelle im Baum.
 */
export function NavAddButton(props: Props) {
  const { setAction } = useNavActionSlot();
  const { label } = props;
  const href = props.href;
  const onClick = props.onClick;

  useEffect(() => {
    setAction(
      href ? (
        <Fab
          component={Link}
          href={href}
          aria-label={label}
          className={BUTTON_CLASSES}
          colors={FAB_COLORS}
          icon={<Plus size={24} className="text-white" aria-hidden />}
        />
      ) : (
        <Fab
          component="button"
          type="button"
          onClick={onClick}
          aria-label={label}
          className={BUTTON_CLASSES}
          colors={FAB_COLORS}
          icon={<Plus size={24} className="text-white" aria-hidden />}
        />
      ),
    );
    return () => setAction(null);
  }, [href, onClick, label, setAction]);

  return null;
}
