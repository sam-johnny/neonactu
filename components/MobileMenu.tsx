"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type MobileMenuGame = {
  slug: string;
  shortName: string;
  tagline: string;
};

/**
 * Menu mobile de la navbar (≤760px) : bouton burger ouvrant un panneau
 * pleine largeur sous le header. La liste des dossiers se déploie en
 * accordéon pour garder des zones de tap généreuses. Fermeture par Échap,
 * clic à l'extérieur ou après navigation. Invisible côté desktop (CSS).
 */
export default function MobileMenu({ games }: { games: MobileMenuGame[] }) {
  const [open, setOpen] = useState(false);
  const [gamesOpen, setGamesOpen] = useState(false);
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

  function closeAll() {
    setOpen(false);
    setGamesOpen(false);
  }

  return (
    <div className="mobile-menu" ref={rootRef}>
      <button
        type="button"
        className="mobile-menu-btn"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="mobile-menu-burger" data-open={open ? "true" : "false"} aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="mobile-menu-label">Menu</span>
      </button>
      {open && (
        <div className="mobile-menu-panel" role="menu">
          <nav className="mobile-menu-nav" aria-label="Navigation principale mobile">
            <Link href="/" className="mobile-menu-link" role="menuitem" onClick={closeAll}>
              Accueil
            </Link>
            <button
              type="button"
              className="mobile-menu-link mobile-menu-games-toggle"
              aria-expanded={gamesOpen}
              onClick={() => setGamesOpen((value) => !value)}
            >
              Jeux
              <svg
                className="mobile-menu-chevron"
                data-open={gamesOpen ? "true" : "false"}
                width="12"
                height="8"
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
            {gamesOpen && (
              <div className="mobile-menu-games">
                {games.map((game) => (
                  <Link
                    key={game.slug}
                    href={`/${game.slug}/`}
                    className="mobile-menu-game"
                    role="menuitem"
                    onClick={closeAll}
                  >
                    <span className="mobile-menu-game-name">{game.shortName}</span>
                    <span className="mobile-menu-game-tagline">{game.tagline}</span>
                  </Link>
                ))}
              </div>
            )}
            <Link href="/a-propos/" className="mobile-menu-link" role="menuitem" onClick={closeAll}>
              À propos
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
