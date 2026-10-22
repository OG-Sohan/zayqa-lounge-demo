import { useState } from "react";
import { photoSrcSet } from "@/lib/dish-photos";

type DishImageProps = {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  /** Only the first visible hero image; everything else stays lazy. */
  eager?: boolean;
};

/** Fixed 3:4 dish photo box: zero layout shift, shimmer while loading, branded fallback on error. */
export function DishImage({ src, alt, sizes, className = "", eager = false }: DishImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={`dish-image-frame dish-image-placeholder ${className}`} role="img" aria-label={alt}>
        <span>ZAYQA</span>
      </div>
    );
  }
  return (
    <div className={`dish-image-frame ${loaded ? "is-loaded" : ""} ${className}`}>
      <img
        src={src}
        srcSet={photoSrcSet(src)}
        sizes={sizes}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        decoding="async"
        width="768"
        height="1024"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
    </div>
  );
}
