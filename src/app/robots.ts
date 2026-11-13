import type { MetadataRoute } from "next";
import { allowIndexing } from "@/lib/env";

// Site fictif : tout est interdit aux robots tant que ALLOW_INDEXING !== "true".
export default function robots(): MetadataRoute.Robots {
  if (!allowIndexing) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return { rules: { userAgent: "*", allow: "/" } };
}
