"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMemo } from "react";
import { PillGroup } from "@/components/ui/PillGroup";
import { ProductCard } from "./ProductCard";
import type { ProductCardData } from "@/lib/catalog/types";

export function ProductRail({
  products,
  label,
}: {
  products: readonly ProductCardData[];
  label: string;
}) {
  const railRef = useRef<HTMLUListElement>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(true);
  const [brandFilter, setBrandFilter] = useState("all");
  const filteredProducts = useMemo(
    () =>
      brandFilter === "all"
        ? products
        : products.filter((product) => product.brand_slug === brandFilter),
    [brandFilter, products],
  );

  const updateEdges = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    setCanGoBack(rail.scrollLeft > 1);
    setCanGoForward(rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    updateEdges();
    rail.addEventListener("scroll", updateEdges, { passive: true });
    const observer = new ResizeObserver(updateEdges);
    observer.observe(rail);
    return () => {
      rail.removeEventListener("scroll", updateEdges);
      observer.disconnect();
    };
  }, [updateEdges, filteredProducts.length]);

  function scroll(direction: -1 | 1) {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelector<HTMLElement>("li");
    const gap = Number.parseFloat(getComputedStyle(rail).columnGap) || 0;
    rail.scrollBy({ left: direction * ((card?.offsetWidth ?? 300) + gap), behavior: "smooth" });
  }

  return (
    <section aria-label={label} role="region">
      <div className="mb-3 flex justify-end gap-2">
        <button
          type="button"
          aria-label="Produits précédents"
          disabled={!canGoBack}
          onClick={() => scroll(-1)}
          className="grid size-11 place-items-center rounded-full border border-line text-ink disabled:opacity-35 state-hover:bg-surface"
        >
          <span aria-hidden="true" className="text-xl">
            ←
          </span>
        </button>
        <button
          type="button"
          aria-label="Produits suivants"
          disabled={!canGoForward}
          onClick={() => scroll(1)}
          className="grid size-11 place-items-center rounded-full border border-line text-ink disabled:opacity-35 state-hover:bg-surface"
        >
          <span aria-hidden="true" className="text-xl">
            →
          </span>
        </button>
      </div>
      <PillGroup
        label="Filtrer par marque"
        defaultValue="all"
        onChange={setBrandFilter}
        options={[
          { value: "all", label: "Toutes" },
          { value: "apple", label: "Apple" },
          { value: "samsung", label: "Samsung" },
          { value: "xiaomi", label: "Xiaomi" },
        ]}
      />
      <ul
        ref={railRef}
        tabIndex={0}
        aria-label={label}
        className="grid snap-x snap-mandatory auto-cols-[minmax(260px,300px)] grid-flow-col gap-[18px] overflow-x-auto scroll-smooth px-1 pt-2 pb-6"
      >
        {filteredProducts.map((product) => (
          <li key={product.code} className="snap-start">
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  );
}
