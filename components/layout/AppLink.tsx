"use client";

import { useRouter } from "next/navigation";
import Link, { type LinkProps } from "next/link";
import { type AnchorHTMLAttributes, type MouseEvent } from "react";
import { withPageTransition, type TransitionDirection } from "@/components/layout/transitions";

type Props = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    direction?: TransitionDirection;
  };

/**
 * `next/link`, das Navigationen in einen Apple-artigen Seitenübergang
 * einpackt (siehe transitions.ts). Reines Progressive Enhancement: Cmd/Strg-
 * Klick, Mittelklick und `target="_blank"` bleiben unangetastet (neuer Tab
 * braucht keinen Übergang), alles andere übernimmt `router.push` innerhalb
 * der View Transition statt des normalen Link-internen Sprungs.
 */
export function AppLink({ direction = "push", href, onClick, ...rest }: Props) {
  const router = useRouter();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    if (rest.target && rest.target !== "_self") return;

    event.preventDefault();
    withPageTransition(direction, () => router.push(href.toString()));
  }

  return <Link href={href} onClick={handleClick} {...rest} />;
}
