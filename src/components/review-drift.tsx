import { reviews } from "@/lib/zayqa-data";

type Review = (typeof reviews)[number];
function Row({ list, reverse }: { list: Review[]; reverse?: boolean }) {
  const cards = (hidden: boolean) => (
    <div className="review-set" aria-hidden={hidden || undefined}>
      {list.map((r, i) => (
        <figure className="review-card glass" key={i}>
          <blockquote>“{r.quote}”</blockquote>
          <figcaption>{r.name} · {r.detail}</figcaption>
        </figure>
      ))}
    </div>
  );
  // The second set is a visual clone for a seamless loop; screen readers only get the first.
  return <div className={`review-row ${reverse ? "is-reverse" : ""}`}><div className="review-track">{cards(false)}{cards(true)}</div></div>;
}

export function ReviewDrift() {
  const half = Math.ceil(reviews.length / 2);
  return (
    <div className="review-marquee" tabIndex={0} aria-label="Guest reviews">
      <Row list={reviews.slice(0, half)} />
      <Row list={reviews.slice(half)} reverse />
    </div>
  );
}
