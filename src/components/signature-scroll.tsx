import { MotionHeading } from "@/components/motion-heading";
import { useEffect, useRef, useState } from "react";
import { DishCard } from "@/components/menu-ui";
import { Button } from "@/components/ui/button";
import { ArrowIcon } from "@/components/zayqa-icons";
import { prominentSlugs } from "@/lib/dish-photos";
import type { Dish } from "@/lib/zayqa-data";

/** Swipe/drag carousel with snap, glass arrows, a live "01 / 06" counter and progress line. */
export function SignatureScroll({ dishes }: { dishes: Dish[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const list = prominentSlugs.map((slug) => dishes.find((d) => d.slug === slug)).filter((d): d is Dish => !!d);
  const total = list.length;
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const max = Math.max(1, el.scrollWidth - el.clientWidth);
        const p = Math.min(1, el.scrollLeft / max);
        setProgress(p);
        setIndex(Math.min(total - 1, Math.round(p * (total - 1))));
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    // Mouse drag: native touch swipe already has momentum; this adds the same feel for desktop pointers.
    let down = false, startX = 0, startLeft = 0, moved = false;
    const pd = (e: PointerEvent) => { if (e.pointerType !== "mouse") return; down = true; moved = false; startX = e.clientX; startLeft = el.scrollLeft; el.classList.add("is-dragging"); };
    const pm = (e: PointerEvent) => { if (!down) return; const dx = e.clientX - startX; if (Math.abs(dx) > 4) moved = true; el.scrollLeft = startLeft - dx; };
    const pu = () => { if (!down) return; down = false; el.classList.remove("is-dragging"); };
    const click = (e: MouseEvent) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } };
    el.addEventListener("pointerdown", pd); addEventListener("pointermove", pm); addEventListener("pointerup", pu); el.addEventListener("click", click, true);
    return () => { cancelAnimationFrame(frame); el.removeEventListener("scroll", onScroll); el.removeEventListener("pointerdown", pd); removeEventListener("pointermove", pm); removeEventListener("pointerup", pu); el.removeEventListener("click", click, true); };
  }, [total]);
  const go = (dir: number) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".dish-card");
    el.scrollBy({ left: dir * ((card?.offsetWidth ?? 300) + 24), behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };
  return (
    <section className="signature-carousel section-pad" aria-label="Signatures">
      <div className="signature-heading">
        <div><p className="eyebrow">From our kitchen</p><MotionHeading>Signatures</MotionHeading></div>
        <div className="signature-controls">
          <span className="signature-counter" aria-live="polite">{String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
          <Button variant="outline" size="icon" className="glass-circle" aria-label="Previous signature" onClick={() => go(-1)}><ArrowIcon direction="left" /></Button>
          <Button variant="outline" size="icon" className="glass-circle" aria-label="Next signature" onClick={() => go(1)}><ArrowIcon /></Button>
        </div>
      </div>
      <div className="signature-track" ref={track} role="region" aria-label="Signature dishes" tabIndex={0}>
        {list.map((d) => <DishCard key={d.slug} dish={d} />)}
      </div>
      <div className="signature-progress"><span style={{ transform: `scaleX(${Math.max(0.08, progress)})` }} /></div>
    </section>
  );
}
