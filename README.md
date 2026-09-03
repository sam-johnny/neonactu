# NeonActu

Site d'actualité jeux vidéo en français (**https://neonactu.fr**), construit avec **Next.js 15** (App Router, export statique). Organisé en cocon sémantique par jeu : chaque jeu a son dossier (page hub) regroupant news, guides et analyses. Dossiers en ligne : **GTA 6** (sortie, trailers, précommandes), **Palworld** (version 1.0, World Tree, élevage, astuces), **Onimusha: Way of the Sword**, **Beast of Reincarnation** et **Sorties de la semaine**.

## Stack

- Next.js 15 + React 19 + TypeScript
- Export 100 % statique (`output: "export"`) — hébergeable partout (Vercel, GitHub Pages, Cloudflare Pages, Netlify…)
- Contenu éditorial en JSON (`content/<jeu>/`), chargé et validé au build
- Aucune librairie UI : design system maison en CSS (`app/globals.css`)
- Thème clair/sombre automatique (suit le système, bascule manuelle mémorisée) + palette d'accent propre à chaque jeu
- Polices : Anton, Playfair Display, Inter, JetBrains Mono (via `next/font`)

## Commandes

```bash
npm install
npm run dev    # développement
npm run build  # build + export statique (résultat dans dist/)
```

> Note : si le build échoue avec « Build directory is not writeable » (montages FUSE), builder dans un dossier classique puis copier `dist/`.

## Structure

```
app/                  pages Next.js (App Router)
  page.tsx            accueil (hero, compte à rebours, dossiers, articles)
  [game]/             page hub du jeu + layout (thème par jeu)
  [game]/[slug]/      page article (métadonnées + JSON-LD Article & FAQ)
  a-propos/           page à propos
  sitemap.ts          sitemap.xml généré
  robots.ts           robots.txt généré
  globals.css         design system complet
components/           Header, Footer, ThemeToggle, ArticleCard, Countdown,
                      Marquee, ParticleField, Reveal, AdSlot, ArticleBody
content/<jeu>/        _jeu.json (définition du jeu) + <slug>.json (articles)
lib/                  loaders et validateurs du contenu JSON
public/images/        visuels officiels des éditeurs (copiés localement,
                      crédit affiché) et illustrations SVG générées
                      (scripts/generate-images*.py)
```

## Ajouter un article ou un jeu

Tout se fait par fichiers JSON, sans toucher au code — voir **AGENTS.md** pour les schémas complets :

1. **Article** : créer `content/<jeu>/<slug>.json` + son visuel dans `public/images/`.
2. **Jeu** : créer `content/<jeu>/_jeu.json` (définition, thème optionnel) + ses articles.
3. `npm run build` — validation du contenu, puis génération des pages, du sitemap et des métadonnées.

## SEO embarqué

- Cocon sémantique : hub `/<jeu>/` + articles `/<jeu>/<slug>/`, maillage interne systématique
- Métadonnées + Open Graph + canonical par page
- JSON-LD : `WebSite` (global), `CollectionPage` + `ItemList` (hubs), `Article` + `FAQPage` + `BreadcrumbList` (articles)
- `sitemap.xml` et `robots.txt` générés
- Export statique : HTML complet côté serveur, idéal pour les crawlers

## Publicité

Le composant `components/AdSlot.tsx` matérialise les emplacements (728×90, 300×250, in-article). Remplacer son contenu par le snippet AdSense (ou autre régie) et ajouter le script global dans `app/layout.tsx`.

---

Site de fans, non affilié à Rockstar Games / Take-Two Interactive, Capcom, Game Freak ni Pocketpair.
