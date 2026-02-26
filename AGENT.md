Stage #1: COMPLETE

Goals:

- build a slick web interface for Sui Display
- Sui Display is a way to build a JSON-style template to view an object and access its internal fields
- the interface should allow pasting an object ID
- the interface should have "JSON editor" where keys and values can be edited
- the interface should have a "preview" button which renders the display
- keys and values should have syntax highlighting support (maybe auto-completion, tbd)

Approach:

- do not do the querying yet, do UI first and a stab
- use React for the interface, optionally Vite
- use Tailwind CSS for the styling
- react and tailwind components should be used as needed
- currently just print the template to the output, no rendering yet, but UI should be correct (as if it was rendered)
- use pnpm for the package manager

Notes:

- syntax hl should only highlight content inside curly braces, eg: `hello {world}` should highlight `{world}`
- syntax hl should highlight function calls eg `format(field.value)`
- syntax hl should highlight braces, parens

Stage #2: COMPLETE

Goals:

- use sui.js on mainnet with GraphQL client to query the data and render the display
- show error messages in the UI if the query fails

Approach:

- use https://sdk.mystenlabs.com/sui/clients/graphql#custom-graphql-queries for docs
- network should be mainnet
- let's implicitly build the query for up to 10 keys and values (with ability to change it later)
- $f0 is a key, $f1 is a value, $i0 and $i1 are boolean flags to include or exclude the key and value from the query
- the query should be pre-built, but arguments should be substituted dynamically based on the keys and values entered by the user
- use this GQL query template starter to build the query:

```graphql
query TryFormat(
  $object: SuiAddress!,
  $f0: String!,
  $i0: Boolean!,
  $f1: String!
  $i1: Boolean!,
  # ... etc
) {
  object(address: $object) {
    asMoveObject {
      contents {
        f0: format(format: $f0) @include(if: $i0)
        f1: format(format: $f1) @include(if: $i1)
        # ... etc
      }
    }
  }
}
```

Notes:

- prefill object ID with this: 0xbe0d9b1297154b5329f26552e14e1203071707a49a88859fb85d4d59e243ba35

Stage #3: IN PROGRESS

Goals:

- add presets for example objects, follow this:

Preset: SuiNS
Object ID: 0xbe0d9b1297154b5329f26552e14e1203071707a49a88859fb85d4d59e243ba35

```
{
    "name": "{domain_name}",
    "image_url": "{image_url}",
    "tld": "{domain.labels[0u8]}",
    "domain": "{domain.labels[1u8]}",
    "subdomain": "{subdomain.labels[2u8] | 'No subdomain'}",
    "expires": "{expiration_timestamp_ms:ts}"
}
```


Preset: SuiFren
Object ID: 0x7859ac2c04f75be763f9e4639eb6dc4a0148e0c147ebbd325b3552ca47b5b2ca
```
{
    "name": "{name}",
    "image_url": "{image_url}",
    "description": "{description}",
    "link": "{link}",
    "project_url": "{project_url}",
    "creator": "{creator}"
}
```

Stage #4: IN PROGRESS

Goals:

- add a "dynamic" preview, which renders the display with an image
- use fields `project_url`, `image_url`, `name` and `description` as main content
- use other (non-standard) fields as extra metadata
- pop up a modal with the preview upon clicking the "preview" button
- previous preview should be renamed to "JSON Preview"

Approach:

- use `image_url` to show the image in the modal
- use `name` and `description` to show the name and description in the modal
- if there's no image or it fails to load, show a placeholder with some explanation that `image_url` is not set
- use other (non-standard) fields as extra metadata in the modal

Notes:

- the modal should be styled to match the rest of the UI
- the modal should close on clicking the "X" button or outside the modal, or escape key
- the modal should be responsive and look good on both desktop and mobile

Stage #5: TODO

Goals:

- add small explorer link when object ID is present in the input (https://suiscan.xyz/mainnet/object/{ID}), place it under the object ID input
- add a hint to default presets to explain what user can see in them
  * SuiNS: nested fields and vector access (tld, domain, subdomain), timestamp transformation
  * SuiFren: dynamic object fields access (*_item), vector access, timestamp transformation
- add default fields in the "empty" preset, use these:
  * name: A name for the object. The name is displayed when users view the object.
  * description: A description for the object. The description is displayed when users view the object.
  * link: A link to the object to use in an application.
  * image_url: A URL or a blob with the image for the object.
  * thumbnail_url: A URL to a smaller image to use in wallets, explorers, and other products as a preview.
  * project_url: A link to a website associated with the object or creator.
  * creator: A string that indicates the object creator.
