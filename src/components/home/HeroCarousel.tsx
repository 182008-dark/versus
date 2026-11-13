"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import { Button } from "@/components/ui/Button";
import { ProductVisual } from "@/components/product/ProductVisual";
import { formatFCFA } from "@/lib/format/fcfa";
import { heroStyle, heroThemes } from "@/lib/brand-themes";
import type { CatalogProduct } from "@/lib/catalog/types";
import { productHref } from "@/config/site";

const INTERVAL = 6000;

export function HeroCarousel({
  slides,
  today,
}: {
  slides: readonly CatalogProduct[];
  today: string;
}) {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback(
    (index: number) => setActive((index + slides.length) % slides.length),
    [slides.length],
  );
  const paused = hovered || focused || hidden || reducedMotion;

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotion = () => setReducedMotion(motion.matches);
    const handleVisibility = () => setHidden(document.hidden);
    handleMotion();
    handleVisibility();
    motion.addEventListener("change", handleMotion);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      motion.removeEventListener("change", handleMotion);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    timer.current = setTimeout(() => goTo(active + 1), INTERVAL);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [active, goTo, paused, slides.length]);

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(active - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(active + 1);
    }
  }

  return (
    <section
      aria-label="Produits à la une"
      aria-roledescription="carrousel"
      className="hero-carousel relative overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
      }}
      onKeyDown={onKeyDown}
    >
      {slides.map((product, index) => {
        const selected = index === active;
        const theme = heroStyle(product.brand_slug);
        const tone = heroThemes[product.brand_slug].tone;
        return (
          <div
            key={product.code}
            data-product-slide={product.code}
            aria-hidden={!selected}
            inert={!selected}
            className={`hero-slide ${selected ? "hero-slide-active" : ""}`}
            data-tone={tone}
            style={theme as CSSProperties}
          >
            <div className="hero-slide-inner wrap">
              <div className="relative z-10 max-w-[620px]">
                <p className="hero-eyebrow flex items-center gap-3 text-xs font-semibold tracking-[0.12em] uppercase">
                  {product.brand_name}
                  {product.new_until >= today ? (
                    <span className="rounded-full bg-on-dark/15 px-3 py-1 text-[11px] tracking-normal text-on-dark normal-case">
                      Nouveau
                    </span>
                  ) : null}
                </p>
                <h2 className="hero-copy mt-4 max-w-[620px] text-display-hero">{product.name}</h2>
                <p className="hero-muted mt-4 max-w-lg text-base leading-relaxed sm:text-lg">
                  {product.tagline}
                </p>
                <p className="hero-copy mt-5 text-sm font-medium">
                  À partir de {formatFCFA(product.min_price_fcfa)}
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Button
                    href={productHref(product.slug)}
                    variant={tone === "dark" ? "light" : "dark"}
                    size="lg"
                  >
                    Acheter
                  </Button>
                </div>
              </div>
              <div className="hero-art">
                <span aria-hidden="true" className="hero-halo" />
                <ProductVisual
                  product={product}
                  priority={index === 0}
                  sizes="(max-width: 640px) 60vw, (max-width: 1024px) 42vw, 36vw"
                  className="hero-product-image"
                />
              </div>
            </div>
          </div>
        );
      })}
      <div className="hero-controls" role="group" aria-label="Commandes du carrousel">
        <button
          type="button"
          aria-label="Diapositive précédente ←"
          onClick={() => goTo(active - 1)}
        >
          ←
        </button>
        {slides.map((slide, index) => (
          <button
            key={slide.code}
            type="button"
            aria-label={`Afficher ${slide.name}`}
            aria-current={index === active ? "true" : undefined}
            className={`hero-dot ${index === active ? "hero-dot-active" : ""}`}
            onClick={() => goTo(index)}
          >
            <span key={`${active}-${paused}`} className={paused ? "hero-progress-paused" : ""} />
          </button>
        ))}
        <button type="button" aria-label="Diapositive suivante →" onClick={() => goTo(active + 1)}>
          →
        </button>
      </div>
    </section>
  );
}
