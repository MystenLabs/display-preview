// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useRef } from "react";
import { TRANSFORMS } from "../transforms";

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
