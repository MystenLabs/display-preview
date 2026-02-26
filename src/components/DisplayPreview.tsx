interface Props {
  objectId: string;
  result: Record<string, string>;
}

export function DisplayPreview({ objectId, result }: Props) {
  const json = JSON.stringify(result, null, 2);

  return (
    <div className="mt-8">
      <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-500">
        JSON Preview
      </h2>

      <div className="overflow-hidden rounded-lg border border-gray-800 bg-gray-900">
        {/* Object ID bar */}
        {objectId && (
          <div className="border-b border-gray-800 px-4 py-2 text-xs text-gray-500">
            Object{" "}
            <span className="font-mono text-gray-300">{objectId}</span>
          </div>
        )}

        {/* JSON output */}
        <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed text-gray-300">
          {json}
        </pre>
      </div>
    </div>
  );
}
