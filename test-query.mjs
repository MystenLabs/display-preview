// Simple test script to verify the GraphQL query against mainnet
// Run: node test-query.mjs

const MAINNET_URL = "https://graphql.mainnet.sui.io/graphql";
const OBJECT_ID =
  "0xbe0d9b1297154b5329f26552e14e1203071707a49a88859fb85d4d59e243ba35";

const MAX_FIELDS = 10;

function buildQuery() {
  const vars = ["$object: SuiAddress!"];
  const fields = [];

  for (let i = 0; i < MAX_FIELDS; i++) {
    vars.push(`$f${i}: String!`, `$i${i}: Boolean!`);
    fields.push(`f${i}: format(format: $f${i}) @include(if: $i${i})`);
  }

  return `
    query TryFormat(${vars.join(", ")}) {
      object(address: $object) {
        asMoveObject {
          contents {
            ${fields.join("\n            ")}
          }
        }
      }
    }
  `;
}

async function main() {
  const testFields = [
    { key: "name", value: "{name}" },
    { key: "description", value: "{description}" },
    { key: "image_url", value: "{image_url}" },
  ];

  const variables = { object: OBJECT_ID };
  for (let i = 0; i < MAX_FIELDS; i++) {
    const field = testFields[i];
    variables[`f${i}`] = field?.value ?? "";
    variables[`i${i}`] = !!field;
  }

  console.log("Query:", buildQuery().trim());
  console.log("\nVariables:", JSON.stringify(variables, null, 2));
  console.log("\nSending request to", MAINNET_URL, "...\n");

  const res = await fetch(MAINNET_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: buildQuery(), variables }),
  });

  if (!res.ok) {
    console.error("HTTP error:", res.status, res.statusText);
    process.exit(1);
  }

  const json = await res.json();

  if (json.errors) {
    console.error("GraphQL errors:");
    for (const err of json.errors) {
      console.error(" -", err.message);
    }
    process.exit(1);
  }

  const contents = json.data?.object?.asMoveObject?.contents;
  if (!contents) {
    console.error("Object not found or not a Move object");
    console.error("Raw response:", JSON.stringify(json, null, 2));
    process.exit(1);
  }

  console.log("Raw contents:", JSON.stringify(contents, null, 2));

  const result = {};
  testFields.forEach((field, i) => {
    const value = contents[`f${i}`];
    if (value !== undefined) {
      result[field.key] = value;
    }
  });

  console.log("\nFormatted result:");
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
