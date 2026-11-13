import Image from "next/image";
import type { CSSProperties } from "react";
import type { CatalogProduct } from "@/lib/catalog/types";

export function ProductVisual({
  product,
  priority = false,
  sizes = "(max-width: 640px) 55vw, (max-width: 1024px) 35vw, 260px",
  className,
  style,
}: {
  product: Pick<
    CatalogProduct,
    "code" | "brand_slug" | "image_src" | "image_width" | "image_height" | "image_alt"
  >;
  priority?: boolean;
  sizes?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      data-product={product.code}
      data-brand={product.brand_slug}
      className={className}
      style={style}
    >
      <Image
        src={product.image_src}
        width={product.image_width}
        height={product.image_height}
        alt={product.image_alt}
        sizes={sizes}
        priority={priority}
        className="h-full w-full object-contain"
      />
    </div>
  );
}
