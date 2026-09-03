import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import GamesMenu from "@/components/GamesMenu";
import { games } from "@/lib/games";

export default function Header() {
  return (
    <header className="site-header">
      <div className="header-meta container">
        <span>ÉDITION N°02</span>
        <span className="header-meta-sep" aria-hidden="true">/</span>
        <span>15 AOÛT 2026</span>
        <span className="header-meta-sep" aria-hidden="true">/</span>
        <span>{games.length} DOSSIERS EN LIGNE</span>
      </div>
      <div className="header-main container">
        <Link href="/" className="logo" aria-label="NeonActu — retour à l'accueil">
          <span className="logo-game">NEON</span>
          <span className="logo-focus">ACTU</span>
        </Link>
        <div className="header-actions">
          <nav className="main-nav" aria-label="Navigation principale">
            <Link href="/">Accueil</Link>
            <GamesMenu
              games={games.map((g) => ({
                slug: g.slug,
                shortName: g.shortName,
                tagline: g.tagline,
              }))}
            />
            <Link href="/a-propos/">À propos</Link>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
