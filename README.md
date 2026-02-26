# Sui Display Preview

A web-based editor for building and previewing [Display V2](https://docs.sui.io/standards/display) templates for on-chain Sui objects.

**Live app:** https://mystenlabs.github.io/display-preview/

## What is Display?

Sui Display is a standard for defining how on-chain objects appear in wallets, explorers, and applications. A Display template maps human-readable keys (`name`, `image_url`, `description`, etc.) to format strings that reference an object's Move fields.

For example, a SuiNS name might use:

```
name  ->  {domain.labels[2u8] | ''}@{domain.labels[1u8]}
expires -> {expiration_timestamp_ms:ts}
```

This tool lets you write those templates interactively and preview the resolved output against real mainnet objects.

## Features

- **Template editor** with syntax highlighting for Display V2 expressions (field access, vector indexing, transforms, alternates, dynamic fields)
- **Live preview** against Sui mainnet via GraphQL - paste any object ID and hit Preview
- **Rich render + JSON view** in a modal, switchable with Tab
- **Transform autocomplete** - type `:` inside `{...}` to get suggestions for `:hex`, `:ts`, `:json`, etc.
- **Object field hints** - automatically fetches the object's type and fields so you can click to add them
- **Presets** for SuiNS and SuiFren objects demonstrating nested fields, vector access, dynamic object fields, and timestamp transforms
- **Drag-and-drop** row reordering
- **Built-in docs** page with the full Display V2 syntax reference

## Development

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build
```

Output goes to `dist/`.

## License

Apache-2.0
