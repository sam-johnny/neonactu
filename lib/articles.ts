import fs from "node:fs";
import path from "node:path";
import { getGame } from "@/lib/games";
import { SITE } from "@/lib/site";
import { isRecord, fail, requireString, requireStringArray, optionalString } from "@/lib/validate";

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "list"; items: string[] }
  | { type: "quote"; text: string; source?: string }
  | { type: "image"; src: string; alt: string; caption?: string; credit?: string }
  | { type: "youtube"; id: string; title: string };

export type FaqItem = { q: string; a: string };

export type Article = {
  slug: string;
  game: string; // slug du jeu = nom du dossier dans content/ (injecté par le loader)
  title: string;
  shortTitle: string;
  description: string;
  excerpt: string;
  category: string;
  date: string; // ISO
  updatedAt: string; // ISO
  readingTime: number;
  cover: string;
  coverAlt: string;
  keywords: string[];
  keyPoints: string[];
  blocks: Block[];
  faq: FaqItem[];
};

// Ré-export pour les consommateurs serveur (pages, layout, sitemap).
// Les composants client doivent importer depuis "@/lib/site" directement.
export { SITE };
export { GTA_RELEASE_ISO } from "@/lib/site";

// ---------------------------------------------------------------------------
// Chargement et validation du contenu éditorial (content/<jeu>/<slug>.json)
// Le contenu est validé au build : toute erreur fait échouer la compilation.
// ---------------------------------------------------------------------------

const CONTENT_DIR = path.join(process.cwd(), "content");

function validateBlock(raw: unknown, file: string, index: number): Block {
  const where = `${file} (bloc n°${index + 1})`;
  if (!isRecord(raw) || typeof raw.type !== "string") {
    fail(where, "chaque bloc doit avoir un « type »");
  }
  switch (raw.type) {
    case "p":
    case "h2":
    case "h3":
      return { type: raw.type, text: requireString(raw, "text", where) };
    case "list":
      return { type: "list", items: requireStringArray(raw, "items", where) };
    case "quote": {
      const quote: Block = { type: "quote", text: requireString(raw, "text", where) };
      const source = optionalString(raw, "source", where);
      if (source !== undefined) quote.source = source;
      return quote;
    }
    case "image": {
      const image: Block = {
        type: "image",
        src: requireString(raw, "src", where),
        alt: requireString(raw, "alt", where),
      };
      const caption = optionalString(raw, "caption", where);
      if (caption !== undefined) image.caption = caption;
      const credit = optionalString(raw, "credit", where);
      if (credit !== undefined) image.credit = credit;
      return image;
    }
    case "youtube": {
      const id = requireString(raw, "id", where);
      if (!/^[A-Za-z0-9_-]{11}$/.test(id)) {
        fail(where, "l'« id » YouTube doit comporter 11 caractères (ex. « VQRLujxTm3c »)");
      }
      return { type: "youtube", id, title: requireString(raw, "title", where) };
    }
    default:
      fail(where, `type de bloc inconnu « ${String(raw.type)} » (attendu : p | h2 | h3 | list | quote | image | youtube)`);
  }
}

function validateArticle(raw: unknown, game: string, slug: string, file: string): Article {
  if (!isRecord(raw)) fail(file, "le JSON doit être un objet");

  if (typeof raw.readingTime !== "number" || raw.readingTime <= 0) {
    fail(file, "« readingTime » doit être un nombre positif");
  }
  if (!Array.isArray(raw.blocks) || raw.blocks.length === 0) {
    fail(file, "« blocks » doit être un tableau non vide");
  }
  if (!Array.isArray(raw.faq)) {
    fail(file, "« faq » doit être un tableau (éventuellement vide)");
  }
  const faq: FaqItem[] = raw.faq.map((item, i) => {
    const where = `${file} (faq n°${i + 1})`;
    if (!isRecord(item)) fail(where, "chaque question doit être un objet");
    return { q: requireString(item, "q", where), a: requireString(item, "a", where) };
  });

  return {
    slug,
    game,
    title: requireString(raw, "title", file),
    shortTitle: requireString(raw, "shortTitle", file),
    description: requireString(raw, "description", file),
    excerpt: requireString(raw, "excerpt", file),
    category: requireString(raw, "category", file),
    date: requireString(raw, "date", file),
    updatedAt: requireString(raw, "updatedAt", file),
    readingTime: raw.readingTime,
    cover: requireString(raw, "cover", file),
    coverAlt: requireString(raw, "coverAlt", file),
    keywords: requireStringArray(raw, "keywords", file),
    keyPoints: requireStringArray(raw, "keyPoints", file),
    blocks: raw.blocks.map((b, i) => validateBlock(b, file, i)),
    faq,
  };
}

/** Lit et valide tous les articles de content/<jeu>/<slug>.json. */
function loadArticles(): Article[] {
  const loaded: Article[] = [];
  for (const game of fs.readdirSync(CONTENT_DIR)) {
    const gameDir = path.join(CONTENT_DIR, game);
    if (!fs.statSync(gameDir).isDirectory()) continue;
    if (!getGame(game)) {
      fail(`${game}/`, "définition du jeu manquante (_jeu.json)");
    }
    for (const file of fs.readdirSync(gameDir)) {
      if (!file.endsWith(".json") || file.startsWith("_")) continue;
      let raw: unknown;
      try {
        raw = JSON.parse(fs.readFileSync(path.join(gameDir, file), "utf8"));
      } catch {
        fail(`${game}/${file}`, "JSON invalide");
      }
      loaded.push(validateArticle(raw, game, path.basename(file, ".json"), `${game}/${file}`));
    }
  }
  // Tri : plus récent d'abord (l'article en tête est mis « À la une » sur l'accueil)
  return loaded.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

export const articles: Article[] = loadArticles();

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getArticlesByGame(gameSlug: string): Article[] {
  return articles.filter((a) => a.game === gameSlug);
}

export function articleUrl(article: Article): string {
  return `/${article.game}/${article.slug}/`;
}

export function formatDate(iso: string): string {
  return new Date(iso + "T12:00:00Z").toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
