import { ADS_ENABLED } from "@/lib/site";

/**
 * Emplacement publicitaire — prêt pour Google AdSense ou autre régie.
 * Tant que ADS_ENABLED vaut false (lib/site.ts), le composant ne rend rien.
 * Pour activer : passer ADS_ENABLED à true, remplacer le contenu par votre
 * snippet AdSense (script ins.adsbygoogle) et ajouter le script global
 * dans app/layout.tsx.
 */
export default function AdSlot({
  format = "leaderboard",
}: {
  format?: "leaderboard" | "rectangle" | "in-article";
}) {
  if (!ADS_ENABLED) return null;

  return (
    <div className={`ad-slot ad-${format}`} role="complementary" aria-label="Publicité">
      <span className="ad-label">ESPACE PUBLICITAIRE</span>
      <span className="ad-size">
        {format === "leaderboard" && "728 × 90"}
        {format === "rectangle" && "300 × 250"}
        {format === "in-article" && "In-article"}
      </span>
    </div>
  );
}
