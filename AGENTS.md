# AGENTS.md — NeonActu

> Ce fichier s'adresse aux agents de code IA. Il décrit le projet tel qu'il est réellement, sans présupposés.

## Aperçu du projet

**NeonActu** (https://neonactu.fr) est un site d'actualité jeux vidéo en français, organisé en **cocon sémantique par jeu** : chaque jeu a son dossier (page hub pilier) regroupant ses news, guides et analyses. Premier dossier : **GTA 6**. C'est un site **100 % statique** : aucune base de données, aucune API, aucun backend. Tout le contenu éditorial est en **fichiers JSON** dans `content/<jeu>/` (un fichier par article), chargés et validés au build — pensé pour être généré par un agent IA sans toucher au code.

**Objectif du site : générer du trafic organique (SEO) pour le monétiser ensuite via Google AdSense.** Toute évolution doit servir cet objectif : maillage interne fort, pages piliers par jeu, contenus à forte intention de recherche, données structurées complètes. Les emplacements pubs (`AdSlot`) sont déjà prévus dans les pages.

- Stack : **Next.js 15.3** (App Router) + **React 19** + **TypeScript strict**
- Export statique complet (`output: "export"` dans `next.config.mjs`) — hébergeable n'importe où (GitHub Pages, Cloudflare Pages, Netlify…)
- **Aucune librairie UI** : design system maison dans `app/globals.css` (~1250 lignes, palette « nuit violette + cyan » en sombre, « papier chaud + violet profond » en clair, esprit magazine)
- **Thème clair/sombre automatique** : suit `prefers-color-scheme` ; bascule manuelle (auto → clair → sombre) via `components/ThemeToggle.tsx`, mémorisée dans `localStorage` (`gf-theme`) et appliquée par `[data-theme]` sur `<html>` — un script inline anti-flash dans `app/layout.tsx` pose le thème avant le premier rendu. Les variables CSS du `:root` existent en deux variantes (sombre par défaut ; clair via `[data-theme="light"]` ou media query). Toute nouvelle couleur doit passer par ces variables, jamais en dur
- Polices via `next/font/google` : Anton (display), Playfair Display (serif), Inter (texte), JetBrains Mono — exposées en variables CSS `--font-*`
- Langue du site et du code (commentaires, contenus) : **français**
- Site de fans, non affilié à Rockstar Games / Take-Two Interactive

## Commandes de build

```bash
npm install
npm run dev    # serveur de développement Next.js
npm run build  # build + export statique, puis copie out/ → dist/
npm run start  # next start (peu utile : le site est pensé pour l'export statique)
```

Le script `build` fait `next build && rm -rf dist && cp -r out dist` : **le livrable final est `dist/`**, pas `out/`.

Note du README : si le build échoue avec « Build directory is not writeable » (montages FUSE), builder dans un dossier classique puis copier `dist/`.

**Il n'y a aucun test, aucun linter, aucun formateur configuré** (pas de vitest/jest, eslint, prettier, ni CI). La seule vérification disponible est le build Next.js (qui type-check le TypeScript strict) :

```bash
npm run build   # sert de vérification après toute modification
```

## Architecture des URLs (cocon sémantique)

```
/                       accueil : hero, compte à rebours, dossiers par jeu, derniers articles
/<jeu>/                 page HUB (pilier) du jeu — ex. /gta-6/
/<jeu>/<article>/       article rattaché au jeu — ex. /gta-6/date-de-sortie-prix-editions-precommande/
/a-propos/              page à propos
```

Règles du cocon (à respecter dans toute évolution) :

- **Chaque hub lie tous ses articles** ; **chaque article lie son hub** (fil d'Ariane + encadré latéral « Dossier »).
- **Les articles liés en bas d'article privilégient le même jeu** avant les autres jeux.
- Les slugs d'articles **ne répètent pas le nom du jeu** (déjà dans l'URL) : `/gta-6/trailer-3-.../`, pas `/gta-6/gta-6-trailer-3-.../`.
- La navigation (Header, Footer) et l'accueil exposent les hubs — ils concentrent le « jus » SEO.

## Organisation du code

```
app/                    pages Next.js (App Router)
  layout.tsx            layout racine : polices, métadonnées globales, JSON-LD WebSite,
                        script anti-flash du thème (localStorage → [data-theme]),
                        Header/Footer, lang="fr"
  page.tsx              accueil : hero (ParticleField), Marquee, compte à rebours,
                        cartes des dossiers (hubs), grille d'articles, AdSlot
  [game]/layout.tsx      layout du jeu : applique game.theme (surcharge des
                         variables CSS --accent*) sur le hub et ses articles, et pose
                         la classe `game-<slug>` qui active les ornements propres au
                         jeu dans globals.css (ex. `.game-gta-6` : ambiance Vice City)
  [game]/page.tsx       page hub par jeu : generateStaticParams + dynamicParams = false,
                        métadonnées + canonical, JSON-LD CollectionPage/ItemList &
                        BreadcrumbList, intro SEO, infos clés, articles du jeu, AdSlot
  [game]/[slug]/page.tsx  page article : generateStaticParams + dynamicParams = false,
                        métadonnées + canonical, JSON-LD Article, FAQPage & BreadcrumbList,
                        keyPoints, ArticleBody, FAQ, articles liés (même jeu d'abord), AdSlot
  a-propos/page.tsx     page à propos
  sitemap.ts            sitemap.xml généré (force-static) : accueil, hubs, articles, à propos
  robots.ts             robots.txt généré (force-static)
  globals.css           design system complet (variables CSS, classes utilitaires .container,
                        .btn, .section-head, .prose, .article-*, .hub-*, etc.)
  icon.svg              favicon
lib/games.ts            loader + validateur des jeux (type Game + getGame)
lib/articles.ts         loader + validateur des articles — LE point d'entrée du contenu
lib/site.ts             constantes SITE / GTA_RELEASE_ISO / ADS_ENABLED (sans Node, importable côté client)
lib/validate.ts         validateurs partagés par les loaders (fail → build cassé)
content/<jeu>/          un dossier par JEU : _jeu.json (définition) + <slug>.json (articles)
components/             composants réutilisables (voir ci-dessous)
public/images/          visuels SVG versionnés (scènes synthwave « Vice City »
                        générées par script : hero.svg, article-*.svg ; référencés en
                        /images/*.svg) — légers, nets à toutes les résolutions
```

`dist/`, `out/`, `.next/` et `node_modules/` sont gitignorés.

### `content/<jeu>/_jeu.json` — la définition du jeu

**Un fichier `_jeu.json` par dossier de jeu** (le préfixe `_` l'exclut du loader d'articles). Le slug du jeu est le nom du dossier. Un jeu se crée donc entièrement par fichiers, sans toucher au code.

Schéma (tous les champs sont **requis**, sauf `releaseIso` et `theme`) :

```json
{
  "name": "Nom complet du jeu",
  "shortName": "Nom court (nav, fil d'Ariane)",
  "tagline": "Accroche courte (cartes, encadrés)",
  "description": "Meta description SEO du hub",
  "intro": ["Paragraphes du hub, **gras** possible"],
  "cover": "/images/visuel-du-jeu.jpg",
  "coverAlt": "Description d'image détaillée, en français",
  "keywords": ["mot-clé 1", "mot-clé 2"],
  "releaseIso": "2026-11-19T00:00:00Z",
  "releaseLabel": "19 novembre 2026",
  "platforms": ["PS5", "Xbox Series X|S"],
  "theme": {
    "accent": "#ff4655",
    "accent2": "#ffb3ba",
    "accentSoft": "rgba(255, 70, 85, 0.12)"
  }
}
```

**Thème par jeu** : `theme` surcharge les variables CSS `--accent`, `--accent-2` et `--accent-soft` sur toutes les pages du jeu (hub + articles), via `app/[game]/layout.tsx`. Sans `theme`, le jeu hérite de la palette par défaut (violette, déclinée en clair/sombre). Le layout pose aussi la classe `game-<slug>` sur le conteneur : les ornements spécifiques d'un jeu (dégradés de titres, halos, cadres néon…) se définissent dans `globals.css` sous `.game-<slug>` — voir le bloc `.game-gta-6` pour l'exemple complet (rose néon #ff2e7a + orange sunset #ffb35c).

**Ajouter un jeu** : créer `content/<slug-du-jeu>/_jeu.json` + ses articles JSON dans le même dossier — le hub `/<jeu>/`, la nav, le footer, l'accueil et le sitemap sont générés automatiquement au build. L'ordre d'affichage des jeux suit l'ordre alphabétique des dossiers.

### `lib/games.ts` — loader des jeux

Exporte le type `Game` (le `slug` y est injecté par le loader — **ne pas le mettre dans le JSON**), `games: Game[]` chargés depuis `content/*/_jeu.json` au build, et `getGame(slug)`. Même validation au build que les articles.

### `content/<jeu>/` — les articles en JSON

**Un fichier JSON par article : `content/<jeu>/<slug>.json`.** Le nom du fichier est le slug (sans le nom du jeu, déjà dans l'URL) ; le jeu est déduit du dossier. C'est le format à produire pour toute génération de contenu par IA — aucun code à modifier.

Schéma d'un article (tous les champs sont **requis**, sauf `source`/`caption`/`credit` dans les blocs) :

```json
{
  "title": "Titre complet (H1 + balise title)",
  "shortTitle": "Titre court (footer, cartes)",
  "description": "Meta description SEO (~150 caractères)",
  "excerpt": "Chapô affiché sur les cartes",
  "category": "Guide | News | Analyse…",
  "date": "2026-08-10",
  "updatedAt": "2026-08-13",
  "readingTime": 8,
  "cover": "/images/mon-visuel.jpg",
  "coverAlt": "Description d'image détaillée, en français",
  "keywords": ["mot-clé 1", "mot-clé 2"],
  "keyPoints": ["L'essentiel, 3 à 6 puces"],
  "blocks": [
    { "type": "p", "text": "Paragraphe, **gras** possible" },
    { "type": "h2", "text": "Intertitre" },
    { "type": "h3", "text": "Sous-intertitre" },
    { "type": "list", "items": ["Puce 1", "Puce 2"] },
    { "type": "quote", "text": "Citation", "source": "Optionnel" },
    { "type": "image", "src": "/images/x.jpg", "alt": "…", "caption": "Optionnel", "credit": "Optionnel" },
    { "type": "youtube", "id": "VQRLujxTm3c", "title": "Titre exact de la vidéo" }
  ],
  "faq": [{ "q": "Question ?", "a": "Réponse." }]
}
```

**Blocs `image` et `youtube` — illustrer avec les visuels officiels.** Les covers restent les visuels SVG maison de `public/images/`, mais le corps d'un article peut s'appuyer sur les visuels officiels du jeu, comme le fait la presse JV : captures des trailers, press kits, images du store. Règles : fichier **copié dans `public/images/`** (jamais de hotlink), champ `credit` **toujours rempli** pour ces visuels (ex. « © Rockstar Games — Trailer 2 »), et usage strictement illustratif d'une actualité. Le bloc `youtube` intègre une vidéo officielle via son embed (domaine `youtube-nocookie.com`, chargement différé) — c'est le moyen le plus sûr d'ajouter un trailer : l'`id` est la suite de 11 caractères après `watch?v=` (validée au build) et le `title` doit être le titre exact de la vidéo (accessibilité). Préférer systématiquement l'embed YouTube à la copie d'une miniature.

**Validation au build** (`lib/articles.ts` + `lib/games.ts`) : toute erreur (champ manquant, bloc de type inconnu, dossier sans `_jeu.json`, JSON invalide) **fait échouer `npm run build`** avec un message `[content] <fichier> : <erreur>`. Ne pas contourner cette validation.

**Ordre d'affichage** : les articles sont triés par `date` décroissante — le plus récent est mis « À la une » sur l'accueil et sert d'article pilier sur le hub.

### `lib/articles.ts` — loader et constantes

Exporte :

- Les types `Block` (union discriminée : `p` | `h2` | `h3` | `list` | `quote` | `image` | `youtube`), `FaqItem`, `Article` (le `slug` et le `game` y sont injectés par le loader — **ne pas les mettre dans le JSON**)
- `SITE` : constantes globales (nom, URL `https://neonactu.fr`, tagline, description SEO)
- `GTA_RELEASE_ISO = "2026-11-19T00:00:00Z"` : date de sortie utilisée par le compte à rebours
- `articles: Article[]` : chargés depuis `content/` au build (Node `fs`, côté serveur uniquement)
- Helpers : `getArticle(slug)`, `getArticlesByGame(gameSlug)`, `articleUrl(article)` → `/<jeu>/<slug>/`, `formatDate(iso)` (format français long, UTC)

**Ajouter un article** : créer `content/<jeu>/<slug>.json` (dans un dossier de jeu ayant son `_jeu.json`) + son visuel dans `public/images/` — la page, le sitemap et les métadonnées sont générés automatiquement au build.

### Composants (`components/`)

| Composant | Type | Rôle |
|---|---|---|
| `Header.tsx` / `Footer.tsx` | serveur | navigation et pied de page — liens générés depuis `games` |
| `ArticleCard.tsx` | serveur | carte article (grille accueil / hub / liés), URLs via `articleUrl()` |
| `ArticleBody.tsx` | serveur | rend les `Block[]` en JSX ; supporte le `**gras**` inline via regex dans les `p` et `list` ; images avec légende et `credit` ; embeds YouTube (`youtube-nocookie`, 16/9 responsive) ; exporte aussi `Rich` (gras inline, utilisé par les intros des hubs) |
| `AdSlot.tsx` | serveur | emplacements publicitaires (`leaderboard` 728×90, `rectangle` 300×250, `in-article`) — ne rend rien tant que `ADS_ENABLED` est `false` (lib/site.ts) ; placeholder prêt pour AdSense une fois activé |
| `Countdown.tsx` | **client** | compte à rebours vers `GTA_RELEASE_ISO` |
| `ParticleField.tsx` | **client** | canvas de particules néon en fond du hero ; respecte `prefers-reduced-motion` |
| `Marquee.tsx` | **client** | bandeau défilant |
| `Reveal.tsx` | **client** | animation d'apparition au scroll |
| `ThemeToggle.tsx` | **client** | bascule de thème auto/clair/sombre (icônes soleil, lune, auto) |

## Conventions de code

- **Alias de chemin `@/*`** → racine du projet (`@/lib/articles`, `@/components/Header`)
- TypeScript **strict** ; props typées, pas de `any`
- Composants **serveur par défaut** ; `"use client"` uniquement quand c'est nécessaire (hooks, canvas, timers) — 5 composants actuellement
- Export `default` pour les composants, nommés `PascalCase` ; fonctions et constantes en camelCase/SCREAMING_SNAKE_CASE
- Images : `<img>` natif partout (pas `next/image`, car `images: { unoptimized: true }` + export statique), avec `alt` descriptif en français et `fetchPriority="high"` sur les visuels hero/cover
- Styles : pas de CSS modules ni Tailwind — classes globales nommées en kebab-case (`.article-page`, `.hero-title`, `.btn-primary`, `.hub-card`) définies dans `app/globals.css`, adossées aux variables CSS du `:root`
- Accessibilité soignée : `aria-label`, `aria-hidden`, rôles ARIA, respect de `prefers-reduced-motion`
- URLs canoniques avec **slash final** (`trailingSlash: true`) : écrire les liens internes comme `/<jeu>/<slug>/` — **toujours via `articleUrl(article)`** pour les articles
- Le gras inline dans les contenus s'écrit `**texte**` (mini-markdown maison, traité par `ArticleBody`/`Rich`) — pas d'autre syntaxe supportée

## SEO (pilier du projet — objectif trafic → AdSense)

Le site est optimisé pour le référencement ; **ne pas casser ces mécanismes** :

- **Cocon sémantique par jeu** : hub pilier `/<jeu>/` + articles satellites, maillage interne systématique (voir « Architecture des URLs »)
- Métadonnées + Open Graph + Twitter card par page (`generateMetadata` par hub et par article, `metadata` global dans le layout)
- Canonical par hub (`/<jeu>/`) et par article (`/<jeu>/<slug>/`)
- JSON-LD : `WebSite` (layout global), `CollectionPage` + `ItemList` + `BreadcrumbList` (hubs), `Article` + `FAQPage` + `BreadcrumbList` (articles)
- `sitemap.xml` et `robots.txt` générés depuis `lib/articles.ts` et `lib/games.ts`
- Export statique = HTML complet servi aux crawlers

## Sécurité et points de vigilance

- Aucun secret, aucune variable d'environnement, aucune dépendance au-delà de next/react/react-dom (+ types et TypeScript en dev)
- `dangerouslySetInnerHTML` utilisé uniquement pour injecter les JSON-LD sérialisés depuis des données locales du dépôt — ne jamais l'étendre à des données externes
- Les visuels `public/images/` sont versionnés (SVG) : tout nouvel article doit référencer un visuel existant ou venir avec le sien, sinon image cassée au build comme en prod. Les captures officielles (trailers, press kits) sont autorisées dans le corps des articles à condition de renseigner `credit` — ne jamais hotlinker ni reprendre d'images trouvées au hasard (droits d'auteur)
- Dates de contenu en ISO (`date`, `updatedAt`) ; `formatDate` suppose `YYYY-MM-DD` et force midi UTC pour éviter les décalages de fuseau
- Publicité : `AdSlot` ne rend rien tant que `ADS_ENABLED` est `false` (lib/site.ts) — aucun cadre publicitaire visible en prod ; activer AdSense = passer le drapeau à `true`, remplacer le placeholder par le snippet `ins.adsbygoogle` et ajouter le script global dans `app/layout.tsx`
