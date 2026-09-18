import type { Metadata } from "next";
import Link from "next/link";
import { games } from "@/lib/games";

export const metadata: Metadata = {
  title: "À propos — qui sommes-nous ?",
  description:
    "NeonActu est un blog indépendant dédié à l'actualité des jeux vidéo. Découvrez notre ligne éditoriale, nos dossiers, notre équipe et notre transparence.",
  alternates: { canonical: "/a-propos/" },
};

export default function About() {
  return (
    <div className="container about-page">
      <p className="hero-kicker">Qui sommes-nous ?</p>
      <h1 className="about-title">À propos de NeonActu</h1>

      <div className="prose about-prose">
        <p>
          <strong>NeonActu</strong> est un blog indépendant francophone né
          d'une conviction simple : l'actualité jeux vidéo mérite mieux que du
          clicbait. Nous couvrons les jeux qui comptent vraiment pour les
          joueurs, avec des articles vérifiés, sourcés et mis à jour.
        </p>

        <h2>Notre ligne éditoriale</h2>
        <ul>
          <li>
            <strong>Vérifier avant de publier.</strong> Rumeurs et fuites sont
            toujours signalées comme telles, jamais présentées comme des faits.
          </li>
          <li>
            <strong>Aller à l'essentiel.</strong> Chaque article s'ouvre sur un
            résumé actionnable, pour les pressés comme pour les passionnés.
          </li>
          <li>
            <strong>Mettre à jour.</strong> Un dossier vivant vaut mieux qu'une
            actualité morte : nos guides sont révisés à chaque annonce.
          </li>
        </ul>

        <h2>Nos dossiers</h2>
        <p>
          Grand Theft Auto VI, attendu le <strong>19 novembre 2026</strong>,
          reste notre couverture phare — tout simplement le jeu le plus attendu
          de la décennie. Mais il n'est plus tout seul : chaque jeu qui compte
          pour les joueurs français a son dossier spécial, suivi de la
          première rumeur jusqu'au test de sortie.
        </p>
        <div className="about-games">
          {games.map((game) => (
            <Link
              key={game.slug}
              href={`/${game.slug}/`}
              className="chip about-games-chip"
            >
              {game.shortName}
            </Link>
          ))}
        </div>

        <h2>L'équipe</h2>
        <p>
          NeonActu est animé par une petite équipe de passionnés. La veille et
          une première rédaction sont assistées par des outils d'IA, mais{" "}
          <strong>chaque publication est vérifiée, sourcée et validée
          humainement</strong> avant d'être mise en ligne. Les choix éditoriaux
          — quoi couvrir, quel angle, quelle info mérite votre attention —
          restent 100 % humains.
        </p>

        <h2>Transparence</h2>
        <p>
          NeonActu est un site de fans <strong>indépendant</strong>, non
          affilié aux éditeurs et studios que nous couvrons (Rockstar Games,
          Take-Two Interactive, Electronic Arts, Square Enix, Kojima
          Productions, Xbox Game Studios…). Les visuels d'illustration sont
          des images officielles appartenant à leurs éditeurs respectifs,
          utilisées à titre informatif avec crédit ©. Le site est financé par
          des espaces publicitaires clairement identifiés.
        </p>
        <p>
          Une question, une correction, une info à partager ?{" "}
          <Link href="/">Revenez à l'accueil</Link> et retrouvez-nous sur les
          réseaux.
        </p>
      </div>
    </div>
  );
}
