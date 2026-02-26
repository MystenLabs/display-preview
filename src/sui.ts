// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { SuiGraphQLClient } from "@mysten/sui/graphql";

const MAX_FIELDS = 20;

const OBJECT_FIELDS_QUERY = `
  query ObjectFields($object: SuiAddress!) {
    object(address: $object) {
      asMoveObject {
        contents {
          json
          type {
            repr
          }
        }
      }
    }
  }
`;

const client = new SuiGraphQLClient({
  url: "https://graphql.mainnet.sui.io/graphql",
  network: "mainnet",
});

function buildQuery(): string {
  const vars: string[] = ["$object: SuiAddress!"];
  const fields: string[] = [];

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

const TRY_FORMAT_QUERY = buildQuery();

export interface ObjectFields {
  type: string;
  fields: string[];
}

export async function queryObjectFields(
  objectId: string,
): Promise<ObjectFields> {
  const { data, errors } = await client.query({
    query: OBJECT_FIELDS_QUERY,
    variables: { object: objectId },
  });

  if (errors?.length) {
    throw new Error(errors.map((e) => e.message).join("\n"));
  }

  const contents = (
    data as {
      object?: { asMoveObject?: { contents?: { json?: Record<string, unknown>; type?: { repr?: string } } } };
    }
  )?.object?.asMoveObject?.contents;
  if (!contents) {
    throw new Error("Object not found or is not a Move object");
  }

  return {
    type: contents.type?.repr ?? "",
    fields: Object.keys(contents.json ?? {}),
  };
}

export interface DisplayFieldInput {
  key: string;
  value: string;
}

export async function queryDisplay(
  objectId: string,
  fields: DisplayFieldInput[],
): Promise<Record<string, string>> {
  const activeFields = fields.filter((f) => f.key && f.value);

  if (activeFields.length === 0) {
    throw new Error("No fields to query — add at least one key/value pair");
  }

  if (activeFields.length > MAX_FIELDS) {
    throw new Error(`Maximum ${MAX_FIELDS} fields supported`);
  }

  const variables: Record<string, unknown> = { object: objectId };

  for (let i = 0; i < MAX_FIELDS; i++) {
    const field = activeFields[i];
    variables[`f${i}`] = field?.value ?? "";
    variables[`i${i}`] = !!field;
  }

  const { data, errors } = await client.query({
    query: TRY_FORMAT_QUERY,
    variables,
  });

  if (errors?.length) {
    throw new Error(errors.map((e) => e.message).join("\n"));
  }

  const contents = (
    data as {
      object?: { asMoveObject?: { contents?: Record<string, unknown> } };
    }
  )?.object?.asMoveObject?.contents;
  if (!contents) {
    throw new Error("Object not found or is not a Move object");
  }

  const result: Record<string, string> = {};
  activeFields.forEach((field, i) => {
    const value = contents[`f${i}`];
    if (value !== undefined) {
      result[field.key] =
        typeof value === "string" ? value : JSON.stringify(value, null, 2);
    }
  });

  return result;
}
