// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useRef, useState } from "react";
import type { DisplayField } from "../App";
import { HighlightedValue } from "./HighlightedValue";
import { TRANSFORMS, detectTransformTrigger } from "../transforms";
import { TransformHints } from "./TransformHints";

interface Props {
  fields: DisplayField[];
  onAdd: () => string;
  onRemove: (id: string) => void;
  onUpdate: (id: string, key: string, value: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export function DisplayEditor({ fields, onAdd, onRemove, onUpdate, onReorder }: Props) {
  // Drag state
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Autocomplete state
  const [acFieldId, setAcFieldId] = useState<string | null>(null);
  const [acCursor, setAcCursor] = useState(0);
  const [acSelected, setAcSelected] = useState(0);
  const [acDismissed, setAcDismissed] = useState(false);
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const overlayRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const syncScroll = (fieldId: string) => {
    const input = inputRefs.current.get(fieldId);
    const overlay = overlayRefs.current.get(fieldId);
    if (input && overlay) {
      overlay.scrollLeft = input.scrollLeft;
    }
  };

  const getAcField = () =>
    acFieldId ? fields.find((f) => f.id === acFieldId) : undefined;

  const getFiltered = () => {
    const field = getAcField();
    if (!field || acDismissed) return [];
    const trigger = detectTransformTrigger(field.value, acCursor);
    if (!trigger) return [];
    return TRANSFORMS.filter((t) =>
      t.name.startsWith(trigger.partial.toLowerCase()),
    );
  };

  const acceptAutocomplete = useCallback(
    (idx: number) => {
      const field = getAcField();
      if (!field) return;
      const trigger = detectTransformTrigger(field.value, acCursor);
      if (!trigger) return;
      const filtered = TRANSFORMS.filter((t) =>
        t.name.startsWith(trigger.partial.toLowerCase()),
      );
      const item = filtered[idx];
      if (!item) return;

      const newValue =
        field.value.slice(0, trigger.start) +
        item.name +
        field.value.slice(acCursor);
      const newCursor = trigger.start + item.name.length;

      onUpdate(field.id, field.key, newValue);
      setAcDismissed(true);
      setAcFieldId(null);

      // Restore cursor position after React re-render
      requestAnimationFrame(() => {
        const input = inputRefs.current.get(field.id);
        if (input) {
          input.focus();
          input.setSelectionRange(newCursor, newCursor);
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [acFieldId, acCursor, fields, onUpdate],
  );

  const trackCursor = (fieldId: string, input: HTMLInputElement) => {
    setAcFieldId(fieldId);
    setAcCursor(input.selectionStart ?? input.value.length);
    setAcDismissed(false);
    setAcSelected(0);
  };

  const handleValueKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    fieldId: string,
  ) => {
    const filtered = getFiltered();
    if (filtered.length === 0) return;

    // Only intercept when popup is visible for this field
    if (acFieldId !== fieldId) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setAcSelected((p) => Math.min(p + 1, filtered.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setAcSelected((p) => Math.max(p - 1, 0));
      return;
    }
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      acceptAutocomplete(acSelected);
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setAcDismissed(true);
      return;
    }
  };

  const filtered = getFiltered();
  const showPopup = filtered.length > 0;

  return (
    <div>
      <div className="mb-3">
        <h2 className="text-xs font-medium uppercase tracking-wider text-gray-500">
          Display Template
        </h2>
      </div>

      <div className="rounded-lg border border-gray-800 bg-gray-900">
        {/* Header row */}
        <div className="grid grid-cols-[auto_1fr_2fr_auto] gap-px border-b border-gray-800 bg-gray-800 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
          <div className="w-8 bg-gray-900" />
          <div className="bg-gray-900 px-4 py-2">Key</div>
          <div className="bg-gray-900 px-4 py-2">Value</div>
          <div className="bg-gray-900 px-4 py-2 w-16" />
        </div>

        {/* Rows */}
        {fields.map((field, index) => (
          <div
            key={field.id}
            data-field-id={field.id}
            draggable
            onDragStart={(e) => {
              setDragIndex(index);
              e.dataTransfer.effectAllowed = "move";
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              setDragOverIndex(index);
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (dragIndex !== null && dragIndex !== index) {
                onReorder(dragIndex, index);
              }
              setDragIndex(null);
              setDragOverIndex(null);
            }}
            onDragEnd={() => {
              setDragIndex(null);
              setDragOverIndex(null);
            }}
            className={`group grid grid-cols-[auto_1fr_2fr_auto] gap-px border-b border-gray-800/50 bg-gray-800 last:border-b-0 ${
              dragIndex === index ? "opacity-50" : ""
            } ${dragOverIndex === index && dragIndex !== index ? "border-t-2 border-t-blue-500" : ""}`}
          >
            {/* Drag handle */}
            <div className="flex w-8 items-center justify-center bg-gray-900 cursor-grab active:cursor-grabbing">
              <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 text-gray-600 group-hover:text-gray-400">
                <circle cx="6" cy="4" r="1.2" />
                <circle cx="10" cy="4" r="1.2" />
                <circle cx="6" cy="8" r="1.2" />
                <circle cx="10" cy="8" r="1.2" />
                <circle cx="6" cy="12" r="1.2" />
                <circle cx="10" cy="12" r="1.2" />
              </svg>
            </div>
            {/* Key */}
            <div className="min-w-0 bg-gray-900 px-1 py-1">
              <div className="relative">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre rounded px-3 py-2 font-mono text-sm"
                >
                  {field.key ? (
                    <HighlightedValue value={field.key} />
                  ) : (
                    <span className="text-gray-600">key</span>
                  )}
                </div>
                <input
                  data-field="key"
                  type="text"
                  value={field.key}
                  onChange={(e) =>
                    onUpdate(field.id, e.target.value, field.value)
                  }
                  placeholder="key"
                  className="relative w-full rounded bg-transparent px-3 py-2 font-mono text-sm text-transparent caret-gray-100 placeholder-transparent outline-none"
                />
              </div>
            </div>

            {/* Value — overlay: highlighted text behind a transparent input */}
            <div className={`min-w-0 bg-gray-900 px-1 py-1 ${showPopup && acFieldId === field.id ? "relative z-10" : ""}`}>
              <div className="relative">
                <div
                  aria-hidden
                  ref={(el) => {
                    if (el) overlayRefs.current.set(field.id, el);
                    else overlayRefs.current.delete(field.id);
                  }}
                  className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre rounded px-3 py-2 font-mono text-sm"
                >
                  {field.value ? (
                    <HighlightedValue value={field.value} />
                  ) : (
                    <span className="text-gray-600">value template</span>
                  )}
                </div>
                <input
                  data-field="value"
                  type="text"
                  ref={(el) => {
                    if (el) inputRefs.current.set(field.id, el);
                    else inputRefs.current.delete(field.id);
                  }}
                  value={field.value}
                  onChange={(e) => {
                    onUpdate(field.id, field.key, e.target.value);
                    trackCursor(field.id, e.target);
                    requestAnimationFrame(() => syncScroll(field.id));
                  }}
                  onKeyDown={(e) => handleValueKeyDown(e, field.id)}
                  onKeyUp={() => syncScroll(field.id)}
                  onSelect={(e) => {
                    const input = e.currentTarget;
                    setAcFieldId(field.id);
                    setAcCursor(input.selectionStart ?? input.value.length);
                    setAcSelected(0);
                    syncScroll(field.id);
                  }}
                  onScroll={() => syncScroll(field.id)}
                  onBlur={() => setAcFieldId(null)}
                  placeholder="value template"
                  className="relative w-full rounded bg-transparent px-3 py-2 font-mono text-sm text-transparent caret-gray-100 placeholder-transparent outline-none"
                />
                {showPopup && acFieldId === field.id && (
                  <TransformHints
                    items={filtered}
                    selected={acSelected}
                    onAccept={acceptAutocomplete}
                  />
                )}
              </div>
            </div>

            {/* Remove */}
            <div className="flex items-start bg-gray-900 px-2 py-2.5 w-16 justify-center">
              <button
                onClick={() => onRemove(field.id)}
                className="rounded p-1 text-gray-600 opacity-0 transition hover:bg-gray-800 hover:text-red-400 group-hover:opacity-100"
                title="Remove field"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}

        {/* Phantom row — looks like a real row, typing triggers add */}
        <div className="grid grid-cols-[auto_1fr_2fr_auto] gap-px bg-gray-800">
          <div className="w-8 bg-gray-900" />
          <div className="bg-gray-900 px-1 py-1">
            <input
              type="text"
              placeholder="key"
              value=""
              onChange={() => {}}
              className="w-full rounded bg-transparent px-3 py-2 font-mono text-sm text-gray-100 placeholder-gray-600 outline-none"
              onKeyDown={(e) => {
                if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
                  e.preventDefault();
                  const id = onAdd();
                  onUpdate(id, e.key, "");
                  requestAnimationFrame(() => {
                    const input = document.querySelector<HTMLInputElement>(
                      `[data-field-id="${id}"] [data-field="key"]`
                    );
                    if (input) {
                      input.focus();
                      input.setSelectionRange(1, 1);
                    }
                  });
                }
              }}
            />
          </div>
          <div className="bg-gray-900 px-1 py-1">
            <input
              type="text"
              placeholder="value template"
              value=""
              onChange={() => {}}
              className="w-full rounded bg-transparent px-3 py-2 font-mono text-sm text-gray-100 placeholder-gray-600 outline-none"
              onKeyDown={(e) => {
                if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
                  e.preventDefault();
                  const id = onAdd();
                  onUpdate(id, "", e.key);
                  requestAnimationFrame(() => {
                    const input = document.querySelector<HTMLInputElement>(
                      `[data-field-id="${id}"] [data-field="value"]`
                    );
                    if (input) {
                      input.focus();
                      input.setSelectionRange(1, 1);
                    }
                  });
                }
              }}
            />
          </div>
          <div className="w-16 bg-gray-900" />
        </div>
      </div>
    </div>
  );
}
