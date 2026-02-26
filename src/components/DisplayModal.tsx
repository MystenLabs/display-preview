// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from "react";

const STANDARD_FIELDS = new Set(["name", "description", "image_url", "project_url", "link", "creator"]);

interface Props {
  objectId: string;
  result: Record<string, string>;
  onClose: () => void;
}

export function DisplayModal({ objectId, result, onClose }: Props) {
  const [imgError, setImgError] = useState(false);
  const [tab, setTab] = useState<"render" | "json">("render");

  const name = result["name"];
  const description = result["description"];
  const imageUrl = result["image_url"];
  const projectUrl = result["project_url"];
  const link = result["link"];
  const creator = result["creator"];

  const extraFields = Object.entries(result).filter(
    ([key]) => !STANDARD_FIELDS.has(key),
  );

  // Close on Escape, toggle tab on Tab
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        e.preventDefault();
        setTab((t) => (t === "render" ? "json" : "render"));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-gray-800 bg-gray-900 shadow-2xl">
        {/* Tabs + Close */}
        <div className="flex border-b border-gray-800">
          <button
            onClick={() => setTab("render")}
            className={`flex-1 px-4 py-2.5 text-xs font-medium transition ${
              tab === "render"
                ? "border-b-2 border-blue-500 text-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Render
          </button>
          <button
            onClick={() => setTab("json")}
            className={`flex-1 px-4 py-2.5 text-xs font-medium transition ${
              tab === "json"
                ? "border-b-2 border-blue-500 text-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            JSON
          </button>
          <button
            onClick={onClose}
            className="px-3 py-2.5 text-gray-500 transition hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        <div className="relative">
          {/* JSON view */}
          <div className={tab === "json" ? "" : "hidden"}>
            <div className="p-4">
              {objectId && (
                <div className="mb-3 truncate font-mono text-xs text-gray-600">
                  {objectId}
                </div>
              )}
              <pre className="overflow-x-auto rounded-lg bg-gray-950 p-4 font-mono text-sm leading-relaxed text-gray-300">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>

          {/* Render view */}
          <div className={tab === "render" ? "" : "hidden"}>
            {/* Image */}
            {imageUrl && !imgError ? (
              <div className="flex items-center justify-center border-b border-gray-800 bg-gray-950 p-4">
                <img
                  src={imageUrl}
                  alt={name ?? "Object preview"}
                  onError={() => setImgError(true)}
                  className="max-h-72 rounded-lg object-contain"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center border-b border-gray-800 bg-gray-950 p-8">
                <div className="text-center text-sm text-gray-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="mx-auto mb-2 h-10 w-10 text-gray-700"
                  >
                    <path
                      fillRule="evenodd"
                      d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {imgError ? "Failed to load image" : "No image_url field set"}
                </div>
              </div>
            )}

            {/* Content */}
            <div className="p-5">
              {/* Name */}
              {name && (
                <h3 className="text-lg font-semibold text-white">{name}</h3>
              )}

              {/* Description */}
              {description && (
                <p className="mt-1.5 text-sm leading-relaxed text-gray-400">
                  {description}
                </p>
              )}

              {/* Links */}
              {(link || projectUrl || creator) && (
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                  {link && (
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      View object
                    </a>
                  )}
                  {projectUrl && (
                    <a
                      href={projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      Project
                    </a>
                  )}
                  {creator && (
                    <span>
                      by <span className="text-gray-300">{creator}</span>
                    </span>
                  )}
                </div>
              )}

              {/* Object ID */}
              <div className="mt-4 truncate font-mono text-xs text-gray-600">
                {objectId}
              </div>

              {/* Extra metadata */}
              {extraFields.length > 0 && (
                <div className="mt-4 border-t border-gray-800 pt-4">
                  <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Metadata
                  </h4>
                  <div className="space-y-1.5">
                    {extraFields.map(([key, value]) => (
                      <div key={key} className="flex gap-3 text-sm">
                        <span className="shrink-0 text-gray-500">{key}</span>
                        <span className="min-w-0 truncate font-mono text-gray-300">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
