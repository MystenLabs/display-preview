// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { useState, useCallback, useEffect } from "react";
import { DisplayEditor } from "./components/DisplayEditor";
import { DisplayModal } from "./components/DisplayModal";
import { DocsPage } from "./components/DocsPage";
import { PRESETS } from "./presets";
import { queryDisplay, queryObjectFields, type ObjectFields, type Network } from "./sui";

export interface DisplayField {
  id: string;
  key: string;
  value: string;
}

function makeFields(
  pairs: { key: string; value: string }[],
): DisplayField[] {
  return pairs.map((p) => ({ id: crypto.randomUUID(), ...p }));
}

function pageFromHash(): "editor" | "docs" {
  const h = window.location.hash.slice(1);
  return !h || h === "editor" ? "editor" : "docs";
}

function App() {
  const [page, setPage] = useState<"editor" | "docs">(pageFromHash);
  const [network, setNetwork] = useState<Network>("mainnet");
  const [objectId, setObjectId] = useState(PRESETS[0].objectId);
  const [fields, setFields] = useState<DisplayField[]>(
    () => makeFields(PRESETS[0].fields),
  );
  const [result, setResult] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [objectFields, setObjectFields] = useState<ObjectFields | null>(null);
  const [fieldsLoading, setFieldsLoading] = useState(false);

  useEffect(() => {
    const onHash = () => setPage(pageFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    const isValid = objectId.startsWith("0x") && objectId.length >= 66;
    if (!isValid) {
      setObjectFields(null);
      return;
    }

    setFieldsLoading(true);
    const timer = setTimeout(() => {
      queryObjectFields(objectId, network)
        .then(setObjectFields)
        .catch(() => setObjectFields(null))
        .finally(() => setFieldsLoading(false));
    }, 500);

    return () => {
      clearTimeout(timer);
      setFieldsLoading(false);
    };
  }, [objectId, network]);

  const addField = useCallback((): string => {
    const id = crypto.randomUUID();
    setFields((prev) => [...prev, { id, key: "", value: "" }]);
    return id;
  }, []);

  const removeField = useCallback((id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const reorderFields = useCallback((fromIndex: number, toIndex: number) => {
    setFields((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  const updateField = useCallback(
    (id: string, key: string, value: string) => {
      setFields((prev) =>
        prev.map((f) => (f.id === id ? { ...f, key, value } : f))
      );
    },
    []
  );

  const handlePreview = useCallback(async () => {
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const data = await queryDisplay(objectId, fields, network);
      setResult(data);
      setShowModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [objectId, fields, network]);


  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="mx-auto max-w-4xl px-6 py-10">
        {/* Header */}
        <div className="mb-10 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Sui Display
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              Build and preview Display templates for on-chain objects
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Network Switch */}
            <div className="flex rounded-lg border border-gray-700 overflow-hidden">
              {(["mainnet", "testnet"] as const).map((net) => (
                <button
                  key={net}
                  onClick={() => {
                    setNetwork(net);
                    setObjectFields(null);
                    setResult(null);
                    setError(null);
                  }}
                  className={`px-3 py-2 text-xs font-medium transition ${
                    network === net
                      ? "bg-blue-600 text-white"
                      : "bg-gray-900 text-gray-400 hover:text-gray-200"
                  }`}
                >
                  {net}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                window.location.hash = page === "editor" ? "#docs" : "#editor";
              }}
              className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 transition hover:border-gray-500 hover:text-white"
            >
              {page === "editor" ? "Docs" : "Editor"}
            </button>
          </div>
        </div>

        {page === "docs" ? (
          <DocsPage />
        ) : (
          <>
            {/* Presets */}
            <div className="mb-4">
              <span className="mr-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                Presets
              </span>
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  title={preset.hint}
                  onClick={() => {
                    setNetwork(preset.network);
                    setObjectId(preset.objectId);
                    setFields(makeFields(preset.fields));
                    setObjectFields(null);
                    setResult(null);
                    setError(null);
                  }}
                  className={`mr-2 rounded-md px-3 py-1 text-xs font-medium transition ${objectId === preset.objectId
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                    }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
            {PRESETS.find((p) => p.objectId === objectId)?.hint && (
              <p className="-mt-2 mb-4 text-xs text-gray-600">
                {PRESETS.find((p) => p.objectId === objectId)!.hint}
              </p>
            )}

            {/* Object ID */}
            <div className="mb-8">
              <label
                htmlFor="object-id"
                className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Object ID
              </label>
              <input
                id="object-id"
                type="text"
                value={objectId}
                onChange={(e) => setObjectId(e.target.value)}
                placeholder="0x..."
                className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-3 font-mono text-sm text-gray-100 placeholder-gray-600 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              {objectId.startsWith("0x") && objectId.length >= 66 && (
                <a
                  href={`https://suiscan.xyz/${network}/object/${objectId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-block text-xs text-gray-600 transition hover:text-blue-400"
                >
                  View on SuiScan
                </a>
              )}
            </div>

            {/* Field hints */}
            {fieldsLoading && (
              <div className="mb-4 text-xs text-gray-500">Loading fields…</div>
            )}
            {objectFields && !fieldsLoading && (
              <div className="mb-4 space-y-1">
                <p className="truncate font-mono text-xs text-gray-500">
                  {objectFields.type}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {objectFields.fields.map((f) => (
                    <button
                      key={f}
                      onClick={() => {
                        const id = addField();
                        updateField(id, f, `{${f}}`);
                      }}
                      className="rounded bg-gray-800 px-1.5 py-0.5 font-mono text-xs text-gray-500 transition hover:bg-gray-700 hover:text-gray-300"
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Editor */}
            <DisplayEditor
              fields={fields}
              onAdd={addField}
              onRemove={removeField}
              onUpdate={updateField}
              onReorder={reorderFields}
            />

            {/* Actions */}
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={handlePreview}
                disabled={loading}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Loading..." : "Preview"}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-6 rounded-lg border border-red-800/50 bg-red-950/50 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Modal Preview */}
            {showModal && result && (
              <DisplayModal
                objectId={objectId}
                result={result}
                onClose={() => setShowModal(false)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
