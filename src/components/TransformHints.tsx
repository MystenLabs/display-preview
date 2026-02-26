// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useRef } from "react";

export const TRANSFORMS = [
  { name: "str", desc: "Human-readable string (default)" },
  { name: "hex", desc: "Lowercase hex, zero-padded" },
  { name: "base64", desc: "Base64-encoded" },
  { name: "bcs", desc: "BCS-serialized, base64" },
  { name: "json", desc: "Structured JSON value" },
  { name: "ts", desc: "Unix ms to ISO 8601" },
  { name: "url", desc: "Percent-encoded string" },
];

/**
 * Detect if cursor is in a transform position: after `:` (or `:<partial>`)
 * inside an unmatched `{`. Returns partial text + its start offset, or null.
 */
export function detectTransformTrigger(
  value: string,
  cursor: number,
): { partial: string; start: number } | null {
  let i = cursor - 1;
  while (i >= 0 && /[a-zA-Z0-9]/.test(value[i])) i--;
  if (i < 0 || value[i] !== ":") return null;

  const colonPos = i;
  const partial = value.slice(colonPos + 1, cursor);

  // Verify colon is inside an unmatched `{`
  let depth = 0;
  for (let j = 0; j <= colonPos; j++) {
    if (value[j] === "{" && (j === 0 || value[j - 1] !== "{")) depth++;
    if (value[j] === "}" && (j === 0 || value[j - 1] !== "}")) depth--;
  }
  if (depth <= 0) return null;

  return { partial, start: colonPos + 1 };
}

interface Props {
  items: typeof TRANSFORMS;
  selected: number;
  onAccept: (idx: number) => void;
}

export function TransformHints({ items, selected, onAccept }: Props) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current?.children[selected] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  return (
    <div
      ref={listRef}
      className="absolute left-0 top-full z-50 mt-1 max-h-48 w-64 overflow-y-auto rounded-lg border border-gray-700 bg-gray-900 py-1 shadow-xl"
      onMouseDown={(e) => e.preventDefault()}
    >
      {items.map((t, i) => (
        <div
          key={t.name}
          onClick={() => onAccept(i)}
          className={`flex items-baseline gap-2 px-3 py-1.5 text-sm ${
            i === selected
              ? "bg-blue-600/30 text-white"
              : "text-gray-300 hover:bg-gray-800"
          }`}
        >
          <span className="font-mono font-medium text-teal-400">
            {t.name}
          </span>
          <span className="truncate text-xs text-gray-500">{t.desc}</span>
        </div>
      ))}
    </div>
  );
}
