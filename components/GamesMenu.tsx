"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type GamesMenuItem = {
  slug: string;
  shortName: string;
  tagline: string;
};

/**
 * Menu déroulant « Jeux » de la navbar : regroupe tous les dossiers pour
 * éviter de surcharger la navigation à mesure que des jeux sont ajoutés.
 * Le panneau se ferme par Échap, clic à l'extérieur ou après navigation.
 * État initial fermé côté serveur et client : aucun mismatch d'hydratation.
 */
export default function GamesMenu({ games }: { games: GamesMenuItem[] }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="games-menu" ref={rootRef}>
      <button
        type="button"
        className="games-menu-btn"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((value) => !value)}
      >
        Jeux
        <svg
          className="games-menu-chevron"
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M1 1l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && (
        <div className="games-menu-panel" role="menu">
          <span className="games-menu-caption">Nos dossiers</span>
          {games.map((game) => (
            <Link
              key={game.slug}
              href={`/${game.slug}/`}
              className="games-menu-link"
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              <span className="games-menu-name">{game.shortName}</span>
              <span className="games-menu-tagline">{game.tagline}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
