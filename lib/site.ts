// Constantes globales — module sans dépendance Node (importable par les
// composants client, contrairement à lib/articles.ts qui lit content/ via fs).

export const SITE = {
  name: "NeonActu",
  url: "https://neonactu.fr",
  tagline: "L'actualité jeux vidéo, sans le bruit",
  description:
    "NeonActu : actualités, guides et analyses sur les jeux vidéo qui comptent. Dossiers spéciaux GTA 6 (date de sortie, trailers, précommandes) et Palworld (version 1.0, World Tree, élevage, meilleurs Pals) — infos vérifiées et mises à jour.",
};

export const GTA_RELEASE_ISO = "2026-11-19T00:00:00Z";

// Interrupteur publicité : tant que false, les emplacements AdSlot ne rendent
// rien (aucun cadre « espace publicitaire » visible sur le site).
// Passer à true une fois AdSense validé — et remplacer alors le placeholder
// d'AdSlot par le snippet ins.adsbygoogle (+ script global dans app/layout.tsx).
export const ADS_ENABLED = false;
