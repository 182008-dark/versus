"use client";

import { useState } from "react";
import { Pill } from "./Pill";

export type PillOption = { value: string; label: string };

export function PillGroup({
  label,
  options,
  defaultValue,
  onChange,
}: {
  label: string;
  options: readonly PillOption[];
  defaultValue: string;
  onChange?: (value: string) => void;
}) {
  const [value, setValue] = useState(defaultValue);

  function select(next: string) {
    setValue(next);
    onChange?.(next);
  }

  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((option) => (
        <Pill
          key={option.value}
          selected={value === option.value}
          onClick={() => select(option.value)}
        >
          {option.label}
        </Pill>
      ))}
    </div>
  );
}
