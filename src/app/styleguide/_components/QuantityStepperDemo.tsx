"use client";

import { useState } from "react";
import { QuantityStepper } from "@/components/cart/QuantityStepper";

/** Démonstration de QuantityStepper (styleguide) : bornes 1 et 5, état piloté localement. */
export function QuantityStepperDemo({ label, initial }: { label: string; initial: number }) {
  const [qty, setQty] = useState(initial);
  return <QuantityStepper label={label} qty={qty} max={5} onChange={setQty} />;
}
