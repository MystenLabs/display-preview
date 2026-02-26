// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

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
