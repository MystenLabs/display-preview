import { useState, useCallback, useEffect } from "react";
import { DisplayEditor } from "./components/DisplayEditor";
import { DisplayModal } from "./components/DisplayModal";
import { DisplayPreview } from "./components/DisplayPreview";
import { DocsPage } from "./components/DocsPage";
import { queryDisplay, queryObjectFields, type ObjectFields } from "./sui";

export interface DisplayField {
  id: string;
  key: string;
  value: string;
}

interface Preset {
  name: string;
  objectId: string;
  fields: { key: string; value: string }[];
}

const PRESETS: Preset[] = [
  {
    name: "SuiNS",
    objectId:
      "0xbe0d9b1297154b5329f26552e14e1203071707a49a88859fb85d4d59e243ba35",
    fields: [
      { key: "name", value: "{domain_name}" },
      { key: "image_url", value: "{image_url}" },
      { key: "tld", value: "{domain.labels[0u8]}" },
      { key: "domain", value: "{domain.labels[1u8]}" },
      { key: "subdomain", value: "{subdomain.labels[2u8] | 'No subdomain'}" },
      { key: "expires", value: "{expiration_timestamp_ms:ts}" },
    ],
  },
  {
    name: "SuiFren",
    objectId:
      "0x7859ac2c04f75be763f9e4639eb6dc4a0148e0c147ebbd325b3552ca47b5b2ca",
    fields: [
      { key: "image_url", value: "https://api-mainnet.suifrens.sui.io/suifrens/{id:hex}/svg" },
      { key: "description", value: "This SuiFren is a Capy born on {birthdate:ts} in {birth_location}" },
      { key: "link", value: "https://suifrens.com/fren/{id:hex}" },
      { key: "project_url", value: "https://suifrens.com" },
      { key: "pattern", value: "{attributes[0u8]}" },
      { key: "main_color", value: "{attributes[1u8]}" },
      { key: "secondary_color", value: "{attributes[2u8]}" },
      { key: "eyes", value: "{attributes[3u8]}" },
      { key: "genes", value: "{genes:hex}" },
      { key: "head_item", value: "{id=>[0x7aee872d77cade27e7d9b79bf9c67ac40bfb1b797e8b7438ee73f0af21bb4664::accessories::AccessoryKey('head')].name | 'Not equipped'}" },
      { key: "torso_item", value: "{id=>[0x7aee872d77cade27e7d9b79bf9c67ac40bfb1b797e8b7438ee73f0af21bb4664::accessories::AccessoryKey('torso')].name | 'Not equipped'}" },
      { key: "legs_item", value: "{id=>[0x7aee872d77cade27e7d9b79bf9c67ac40bfb1b797e8b7438ee73f0af21bb4664::accessories::AccessoryKey('legs')].name | 'Not equipped'}" }
    ],
  },
  {
    name: "Empty",
    objectId: "",
    fields: [],
  },
];

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
      queryObjectFields(objectId)
        .then(setObjectFields)
        .catch(() => setObjectFields(null))
        .finally(() => setFieldsLoading(false));
    }, 500);

    return () => {
      clearTimeout(timer);
      setFieldsLoading(false);
    };
  }, [objectId]);

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
      const data = await queryDisplay(objectId, fields);
      setResult(data);
      setShowModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [objectId, fields]);

  const handleHidePreview = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

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
          <button
            onClick={() => {
              window.location.hash = page === "editor" ? "#docs" : "#editor";
            }}
            className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 transition hover:border-gray-500 hover:text-white"
          >
            {page === "editor" ? "Docs" : "Editor"}
          </button>
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
                  onClick={() => {
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
              {result && (
                <button
                  onClick={() => setShowModal(true)}
                  className="rounded-lg border border-gray-700 px-5 py-2.5 text-sm font-medium text-gray-300 transition hover:border-gray-500 hover:text-white"
                >
                  Show Preview
                </button>
              )}
              {(result || error) && (
                <button
                  onClick={handleHidePreview}
                  className="rounded-lg border border-gray-700 px-5 py-2.5 text-sm font-medium text-gray-300 transition hover:border-gray-500 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="mt-6 rounded-lg border border-red-800/50 bg-red-950/50 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* JSON Preview */}
            {result && (
              <DisplayPreview objectId={objectId} result={result} />
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
