import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { PartyStepper } from "@/components/hospitality-controls";
import { CloseIcon, ArrowIcon } from "@/components/zayqa-icons";
import { openingStatus } from "@/lib/hospitality";
import { MotionHeading } from "@/components/motion-heading";

const QUICK_TIMES = ["6:30 PM", "7:30 PM", "8:30 PM", "9:30 PM"];

/** Live opening status; computed after mount because the server doesn't know the visitor's clock. */
export function OpenPill({ hours }: { hours: string }) {
  const [status, setStatus] = useState("");
  useEffect(() => {
    const update = () => setStatus(openingStatus(hours));
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [hours]);
  const open = status === "Open now";
  return (
    <p className="open-pill glass" aria-live="polite">
      <span className={`open-dot ${open ? "is-open" : ""}`} aria-hidden="true" />
      {status ? (open ? `Open now · ${hours}` : status) : `Open today · ${hours}`}
    </p>
  );
}

export function HeroQuickReserve() {
  const [guests, setGuests] = useState(2);
  const [time, setTime] = useState<string>("7:30 PM");
  return (
    <aside className="hero-quick glass hero-seq" aria-label="Reserve tonight">
      <p className="hero-quick-title">Reserve tonight</p>
      <div className="hero-quick-row">
        <span>Guests</span>
        <PartyStepper value={guests} onChange={setGuests} min={1} max={12} />
      </div>
      <div className="hero-quick-times" role="group" aria-label="Preferred time">
        {QUICK_TIMES.map((t) => (
          <button key={t} type="button" className="time-chip" aria-pressed={time === t} onClick={() => setTime(t)}>
            {t.replace(" PM", "")}
          </button>
        ))}
      </div>
      <Button asChild className="w-full">
        <Link to="/reserve" search={{ guests, time }}>Request this table</Link>
      </Button>
    </aside>
  );
}

const steps = [
  ["Arrive.", "Step in from the city and let the pace soften."],
  ["Settle in.", "Deep seats, warm light and a table made ready."],
  ["Dine.", "Plates for sharing, and a little more time than planned."],
  ["Unwind.", "The evening is yours."],
];

export function RoomStory() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(Number((e.target as HTMLElement).dataset["step"]))),
      { rootMargin: "-45% 0px -45% 0px" },
    );
    el.querySelectorAll(".room-step").forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);
  return (
    <div className="room-story" ref={ref}>
      <p className="eyebrow">The room</p>
      {steps.map(([title, line], i) => (
        <div key={title} className={`room-step ${active === i ? "is-active" : ""}`} data-step={i}>
          <span className="room-dot" aria-hidden="true" />
          <MotionHeading>{title}</MotionHeading>
          <p>{line}</p>
        </div>
      ))}
    </div>
  );
}

export function HomeGallery({ items }: { items: { src: string; alt: string; w: number; h: number }[] }) {
  const [open, setOpen] = useState<number>();
  useEffect(() => {
    if (open === undefined) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(undefined);
      else if (e.key === "ArrowRight") setOpen((i) => ((i ?? 0) + 1) % items.length);
      else if (e.key === "ArrowLeft") setOpen((i) => ((i ?? 0) - 1 + items.length) % items.length);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    addEventListener("keydown", onKey);
    return () => {
      removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, items.length]);
  return (
    <>
      <div className="home-masonry">
        {items.map((g, i) => (
          <button key={g.src + i} type="button" onClick={() => setOpen(i)} aria-label={`Open image: ${g.alt}`}>
            <img src={g.src} alt={g.alt} loading="lazy" decoding="async" width={g.w} height={g.h} />
          </button>
        ))}
      </div>
      {open !== undefined && (
        <div className="lightbox home-lightbox" role="dialog" aria-modal="true" aria-label={items[open]?.alt} onClick={(e) => { if (e.target === e.currentTarget) setOpen(undefined); }}>
          <Button variant="ghost" size="icon" className="lightbox-close" onClick={() => setOpen(undefined)} aria-label="Close gallery" autoFocus><CloseIcon /></Button>
          <Button variant="ghost" size="icon" className="lightbox-prev glass-circle" aria-label="Previous image" onClick={() => setOpen((open - 1 + items.length) % items.length)}><ArrowIcon direction="left" /></Button>
          <img key={open} src={items[open]?.src} alt={items[open]?.alt ?? ""} width={items[open]?.w} height={items[open]?.h} />
          <Button variant="ghost" size="icon" className="lightbox-next glass-circle" aria-label="Next image" onClick={() => setOpen((open + 1) % items.length)}><ArrowIcon /></Button>
        </div>
      )}
    </>
  );
}
