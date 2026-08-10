"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useNavActionSlot } from "@/components/layout/NavActionContext";

// Exakt so hoch wie die Navigationspille (56px Symbole + 2 * 8px Polster) –
// nur so stehen beide auf einer Linie, wenn BottomNav sie nebeneinander
// rendert.
const BUTTON_CLASSES =
  "flex h-[72px] w-[72px] items-center justify-center rounded-full bg-neutral-900 text-white shadow-xl shadow-black/25 ring-1 ring-black/5 transition-transform active:scale-90 motion-reduce:transition-none";

type Props = { label: string } & ({ href: string; onClick?: never } | { href?: never; onClick: () => void });

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
        <Link href={href} aria-label={label} className={BUTTON_CLASSES}>
          <Plus size={28} aria-hidden />
        </Link>
      ) : (
        <button type="button" onClick={onClick} aria-label={label} className={BUTTON_CLASSES}>
          <Plus size={28} aria-hidden />
        </button>
      ),
    );
    return () => setAction(null);
  }, [href, onClick, label, setAction]);

  return null;
}
