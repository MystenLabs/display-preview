import type { JSX } from "react";

/**
 * Syntax highlighter for Display V2 template strings.
 *
 * Covers the full grammar from DISPLAY_V2_SYNTAX.md:
 * - Expression braces {}, escaped braces {{/}}
 * - Single-quote strings ('...', b'...', x'...')
 * - Square brackets [], parens ()
 * - Pipe | for alternates, colon : for transforms
 * - Arrow operators -> and =>
 * - Transform keywords (str, hex, base64, bcs, json, timestamp, ts, url)
 * - Number literals with type suffixes (42u8, 0x1abcu64)
 * - Address literals (@0x...)
 * - Boolean keywords (true, false)
 * - vector keyword
 * - Field identifiers (purple inside expressions)
 */

const BRACKET_COLORS = [
  "text-yellow-300",
  "text-fuchsia-400",
  "text-cyan-300",
  "text-orange-400",
];

const TRANSFORMS = new Set([
  "str",
  "hex",
  "base64",
  "bcs",
  "json",
  "timestamp",
  "ts",
  "url",
]);

const KEYWORDS = new Set(["true", "false", "vector"]);

type BracketKind = "{" | "(" | "[";

export function HighlightedValue({ value }: { value: string }) {
  if (!value) {
    return <span className="text-gray-600 italic">empty</span>;
  }

  const parts: JSX.Element[] = [];
  let i = 0;
  let depth = 0;
  const stack: BracketKind[] = [];

  /** Are we currently inside at least one `{` expression? */
  const inExpr = () => stack.includes("{");

  /** Was the most recent meaningful token a `:` (indicating transform position)? */
  let afterColon = false;

  while (i < value.length) {
    const ch = value[i];
    const next = i + 1 < value.length ? value[i + 1] : "";

    // --- Escaped braces {{ and }} (literal brace output) ---
    if (ch === "{" && next === "{") {
      parts.push(<span key={`esc-${i}`}>{"{"}</span>);
      i += 2;
      continue;
    }
    if (ch === "}" && next === "}") {
      parts.push(<span key={`esc-${i}`}>{"}"}</span>);
      i += 2;
      continue;
    }

    // --- Single-quote strings (with optional b' or x' prefix) ---
    if (
      ch === "'" ||
      ((ch === "b" || ch === "x") && next === "'")
    ) {
      const start = i;
      if (ch === "b" || ch === "x") i++; // skip prefix
      i++; // skip opening quote
      while (i < value.length && value[i] !== "'") i++;
      if (i < value.length) i++; // closing quote
      parts.push(
        <span key={`str-${start}`} className="text-green-400">
          {value.slice(start, i)}
        </span>,
      );
      afterColon = false;
      continue;
    }

    // --- Arrow operators -> and => ---
    if ((ch === "-" && next === ">") || (ch === "=" && next === ">")) {
      parts.push(
        <span key={`arrow-${i}`} className="text-orange-400">
          {ch}
          {next}
        </span>,
      );
      i += 2;
      afterColon = false;
      continue;
    }

    // --- Address literal @0x... ---
    if (ch === "@" && next === "0") {
      const start = i;
      i++; // skip @
      // consume 0x and hex digits
      if (i < value.length && value[i] === "0" && i + 1 < value.length && value[i + 1] === "x") {
        i += 2;
        while (i < value.length && /[0-9a-fA-F]/.test(value[i])) i++;
      }
      parts.push(
        <span key={`addr-${start}`} className="text-amber-300">
          {value.slice(start, i)}
        </span>,
      );
      afterColon = false;
      continue;
    }

    // --- Open brace { ---
    if (ch === "{") {
      const color = BRACKET_COLORS[depth % BRACKET_COLORS.length];
      parts.push(
        <span key={`ob-${i}`} className={color}>
          {ch}
        </span>,
      );
      stack.push("{");
      depth++;
      i++;
      afterColon = false;
      continue;
    }

    // --- Close brace } ---
    if (ch === "}") {
      if (stack.length > 0 && stack[stack.length - 1] === "{") stack.pop();
      depth = Math.max(0, depth - 1);
      const color = BRACKET_COLORS[depth % BRACKET_COLORS.length];
      parts.push(
        <span key={`cb-${i}`} className={color}>
          {ch}
        </span>,
      );
      i++;
      afterColon = false;
      continue;
    }

    // --- Open paren ( ---
    if (ch === "(") {
      const color = BRACKET_COLORS[depth % BRACKET_COLORS.length];
      parts.push(
        <span key={`op-${i}`} className={color}>
          {ch}
        </span>,
      );
      stack.push("(");
      depth++;
      i++;
      afterColon = false;
      continue;
    }

    // --- Close paren ) ---
    if (ch === ")") {
      if (stack.length > 0 && stack[stack.length - 1] === "(") stack.pop();
      depth = Math.max(0, depth - 1);
      const color = BRACKET_COLORS[depth % BRACKET_COLORS.length];
      parts.push(
        <span key={`cp-${i}`} className={color}>
          {ch}
        </span>,
      );
      i++;
      afterColon = false;
      continue;
    }

    // --- Open bracket [ ---
    if (ch === "[") {
      const color = BRACKET_COLORS[depth % BRACKET_COLORS.length];
      parts.push(
        <span key={`osb-${i}`} className={color}>
          {ch}
        </span>,
      );
      stack.push("[");
      depth++;
      i++;
      afterColon = false;
      continue;
    }

    // --- Close bracket ] ---
    if (ch === "]") {
      if (stack.length > 0 && stack[stack.length - 1] === "[") stack.pop();
      depth = Math.max(0, depth - 1);
      const color = BRACKET_COLORS[depth % BRACKET_COLORS.length];
      parts.push(
        <span key={`csb-${i}`} className={color}>
          {ch}
        </span>,
      );
      i++;
      afterColon = false;
      continue;
    }

    // --- Pipe | (alternate separator) ---
    if (ch === "|") {
      parts.push(
        <span key={`pipe-${i}`} className="text-yellow-300">
          {ch}
        </span>,
      );
      i++;
      afterColon = false;
      continue;
    }

    // --- Colon : (transform separator) ---
    if (ch === ":") {
      parts.push(
        <span key={`colon-${i}`} className="text-gray-500">
          {ch}
        </span>,
      );
      i++;
      afterColon = true;
      continue;
    }

    // --- Number literals: digits followed by type suffix or hex 0x... ---
    if (/[0-9]/.test(ch) && inExpr()) {
      const start = i;
      // hex literal 0x...
      if (ch === "0" && next === "x") {
        i += 2;
        while (i < value.length && /[0-9a-fA-F]/.test(value[i])) i++;
      } else {
        while (i < value.length && /[0-9]/.test(value[i])) i++;
      }
      // type suffix (u8, u16, u32, u64, u128, u256)
      if (i < value.length && value[i] === "u") {
        i++;
        while (i < value.length && /[0-9]/.test(value[i])) i++;
      }
      parts.push(
        <span key={`num-${start}`} className="text-amber-300">
          {value.slice(start, i)}
        </span>,
      );
      afterColon = false;
      continue;
    }

    // --- Identifiers (word characters) ---
    if (/[a-zA-Z_]/.test(ch)) {
      const start = i;
      while (i < value.length && /[\w]/.test(value[i])) i++;
      const word = value.slice(start, i);

      // Transform keyword (after colon)
      if (afterColon && TRANSFORMS.has(word)) {
        parts.push(
          <span key={`xf-${start}`} className="text-teal-400">
            {word}
          </span>,
        );
      }
      // Boolean / vector keyword
      else if (inExpr() && KEYWORDS.has(word)) {
        if (word === "vector") {
          parts.push(
            <span key={`kw-${start}`} className="text-teal-400">
              {word}
            </span>,
          );
        } else {
          // true/false
          parts.push(
            <span key={`kw-${start}`} className="text-amber-300">
              {word}
            </span>,
          );
        }
      }
      // Function-like — followed by '('
      else if (i < value.length && value[i] === "(") {
        parts.push(
          <span key={`fn-${start}`} className="text-teal-400">
            {word}
          </span>,
        );
      }
      // Field/identifier inside expression
      else if (inExpr()) {
        parts.push(
          <span key={`id-${start}`} className="text-purple-400">
            {word}
          </span>,
        );
      }
      // Plain text outside expressions
      else {
        parts.push(<span key={`txt-${start}`}>{word}</span>);
      }
      afterColon = false;
      continue;
    }

    // --- Any other characters (dots, spaces, commas, etc.) ---
    const start = i;
    while (
      i < value.length &&
      !/[a-zA-Z_0-9{}"'()\[\]|:@]/.test(value[i]) &&
      !(value[i] === "-" && i + 1 < value.length && value[i + 1] === ">") &&
      !(value[i] === "=" && i + 1 < value.length && value[i + 1] === ">")
    ) {
      i++;
    }
    if (i === start) {
      // single unrecognized char — advance to avoid infinite loop
      parts.push(<span key={`ch-${i}`}>{value[i]}</span>);
      i++;
    } else {
      parts.push(<span key={`x-${start}`}>{value.slice(start, i)}</span>);
    }
  }

  return <span className="font-mono">{parts}</span>;
}
