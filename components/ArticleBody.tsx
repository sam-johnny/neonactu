import type { Block } from "@/lib/articles";

/** Rend le **gras** inline contenu dans les textes. */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i}>{part.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export default function ArticleBody({ blocks }: { blocks: Block[] }) {
  return (
    <div className="prose">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "h2":
            return <h2 key={i}>{block.text}</h2>;
          case "h3":
            return <h3 key={i}>{block.text}</h3>;
          case "p":
            return (
              <p key={i}>
                <Rich text={block.text} />
              </p>
            );
          case "list":
            return (
              <ul key={i}>
                {block.items.map((item, j) => (
                  <li key={j}>
                    <Rich text={item} />
                  </li>
                ))}
              </ul>
            );
          case "quote":
            return (
              <blockquote key={i}>
                <p>{block.text}</p>
                {block.source && <cite>— {block.source}</cite>}
              </blockquote>
            );
          case "image":
            return (
              <figure key={i}>
                <img src={block.src} alt={block.alt} loading="lazy" />
                {(block.caption || block.credit) && (
                  <figcaption>
                    {block.caption}
                    {block.credit && <span className="credit">{block.credit}</span>}
                  </figcaption>
                )}
              </figure>
            );
          case "youtube":
            // Embed officiel YouTube (domaine nocookie), ratio 16/9 responsive.
            // L'ID est validé au build dans lib/articles.ts.
            return (
              <figure key={i} className="video-embed">
                <div className="video-frame">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${block.id}`}
                    title={block.title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
                <figcaption>{block.title}</figcaption>
              </figure>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
