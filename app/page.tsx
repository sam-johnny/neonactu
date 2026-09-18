import Link from "next/link";
import Marquee from "@/components/Marquee";
import ParticleField from "@/components/ParticleField";
import Countdown from "@/components/Countdown";
import Reveal from "@/components/Reveal";
import ArticleCard from "@/components/ArticleCard";
import AdSlot from "@/components/AdSlot";
import { articles, articleUrl } from "@/lib/articles";
import { games } from "@/lib/games";

export default function Home() {
  const [featured, ...rest] = articles;

  return (
    <>
      {/* ================= HERO ================= */}
      <section className="hero">
        <div className="hero-bg">
          <img
            src="/images/hero.svg"
            alt="Coucher de soleil aux néons roses et oranges sur une ville tropicale bordée de palmiers, évoquant Vice City dans GTA 6"
            fetchPriority="high"
          />
          <div className="hero-shade" aria-hidden="true" />
          <ParticleField />
        </div>
        <div className="container hero-content">
          <p className="hero-kicker">Le blog des joueurs impatients</p>
          <h1 className="hero-title">
            <span className="hero-title-top">L'ACTU</span>
            <span className="hero-title-script">en</span>
            <span className="hero-title-bottom">NEON</span>
          </h1>
          <p className="hero-sub">
            News vérifiées, guides et analyses — zéro clicbait. En ce moment :
            le compte à rebours de <strong>GTA 6</strong> (19 novembre 2026),
            le lancement de <strong>EA SPORTS FC 27</strong>, le casting de{" "}
            <strong>PHYSINT</strong> dévoilé par Kojima et <strong>FF7
            Revelation</strong> jouable au TGS. Chaque jeu qui compte a son
            dossier.
          </p>
          <div className="hero-cta">
            <Link href={articleUrl(featured)} className="btn btn-primary">
              Lire : {featured.shortTitle}
            </Link>
            <Link href="#articles" className="btn btn-ghost">
              Tous les articles
            </Link>
          </div>
        </div>
        <div className="hero-scroll" aria-hidden="true">
          <span />
        </div>
      </section>

      {/* ================= MARQUEE ================= */}
      <Marquee />

      {/* ================= COMPTE À REBOURS ================= */}
      <section className="section countdown-section">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <span className="section-index">01</span>
              <h2 className="section-title">Compte à rebours — GTA 6</h2>
              <span className="section-note">19 NOV. 2026 · PS5 · XBOX SERIES</span>
            </div>
            <Countdown />
          </Reveal>
        </div>
      </section>

      {/* ================= DOSSIERS PAR JEU ================= */}
      <section className="section">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <span className="section-index">02</span>
              <h2 className="section-title">Nos dossiers</h2>
              <span className="section-note">JEU PAR JEU</span>
            </div>
          </Reveal>
          <div className="hubs-grid">
            {games.map((game, i) => (
              <Reveal key={game.slug} delay={i * 90}>
                <Link href={`/${game.slug}/`} className="hub-card">
                  <div className="hub-card-media">
                    <img src={game.cover} alt={game.coverAlt} loading="lazy" />
                  </div>
                  <div className="hub-card-body">
                    <h3 className="hub-card-title">{game.shortName}</h3>
                    <p className="hub-card-tagline">{game.tagline}</p>
                    <span className="card-more">
                      Tout le dossier <span aria-hidden="true">→</span>
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= À LA UNE ================= */}
      <section className="section">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <span className="section-index">03</span>
              <h2 className="section-title">À la une</h2>
              <span className="section-note">LE GUIDE DE RÉFÉRENCE</span>
            </div>
            <ArticleCard article={featured} featured />
          </Reveal>
        </div>
      </section>

      <div className="container">
        <AdSlot format="leaderboard" />
      </div>

      {/* ================= ARTICLES ================= */}
      <section className="section" id="articles">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <span className="section-index">04</span>
              <h2 className="section-title">Derniers articles</h2>
              <span className="section-note">TOUS LES JEUX</span>
            </div>
          </Reveal>
          <div className="articles-grid">
            {rest.map((article, i) => (
              <Reveal key={article.slug} delay={i * 90} className={`grid-item grid-item-${i % 4}`}>
                <ArticleCard article={article} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SUIVEZ-NOUS ================= */}
      <section className="section follow-section">
        <div className="container">
          <Reveal>
            <div className="follow-box">
              <p className="follow-kicker">Restez branché</p>
              <h2 className="follow-title">
                Une annonce droppe ?
                <br />
                Vous la saurez en premier.
              </h2>
              <p className="follow-text">
                Ajoutez NeonActu à vos favoris : chaque annonce Rockstar, EA,
                Square Enix ou Kojima Productions est décryptée dans l'heure.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
