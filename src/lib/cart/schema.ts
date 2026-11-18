import { z } from "zod";
import { maxQuantityPerLine } from "@/config/policies";
import { MAX_CART_LINES } from "./cart-reducer";
import { SKU_PATTERN, ZONE_CODE_PATTERN } from "./sku";

/**
 * Entrées de la Server Action `priceCart` (côté serveur seulement : zod n'est pas envoyé au
 * navigateur). Le navigateur n'envoie que des SKU, des quantités et un code de zone ; les objets
 * sont stricts, donc un prix ou un total ajouté à la main fait refuser la requête.
 */
export const quoteRequestSchema = z
  .object({
    lines: z
      .array(
        z
          .object({
            sku: z.string().regex(SKU_PATTERN),
            qty: z.number().int().min(1).max(maxQuantityPerLine),
          })
          .strict(),
      )
      .max(MAX_CART_LINES),
    zone: z.string().regex(ZONE_CODE_PATTERN).nullable(),
  })
  .strict();

export type QuoteRequest = z.infer<typeof quoteRequestSchema>;
