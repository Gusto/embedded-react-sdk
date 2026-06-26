# @gusto/embedded-sdk-docs-mcp

A local [MCP](https://modelcontextprotocol.io) server that exposes the [Gusto
Embedded React SDK docs](https://sdk.gusto.com) to AI coding tools. Once
installed, tools like Claude Code and Cursor can search and fetch SDK
documentation directly while you're working on an integration — no copy/paste,
no "open the docs tab," and answers cite the version of the SDK you're on.

## What it does

The server exposes two tools to AI agents:

| Tool | What it does |
|---|---|
| `docs_search` | Full-text search of every SDK doc page. Returns titles, URLs, snippets, and relevance scores. |
| `docs_fetch` | Returns the complete markdown content of a doc page, given its URL. |

Both run **locally over stdio** — nothing leaves your machine, no network call,
no auth.

## Quick start

### Claude Code

```bash
claude mcp add gusto-sdk-docs -- npx -y @gusto/embedded-sdk-docs-mcp
```

That's it. Restart Claude Code if it was already running. Ask it something like
*"Use gusto-sdk-docs to find how theming works in the Embedded React SDK"* — it
will call `docs_search`, then `docs_fetch` to pull the full page, and answer
from the actual docs.

### Cursor / VS Code (MCP)

Add to your MCP config (`~/.cursor/mcp.json` or workspace `.vscode/mcp.json`):

```json
{
  "mcpServers": {
    "gusto-sdk-docs": {
      "command": "npx",
      "args": ["-y", "@gusto/embedded-sdk-docs-mcp"]
    }
  }
}
```

### Pinning to a specific SDK version

This package is versioned in lock-step with `@gusto/embedded-react-sdk`. If
you're on SDK `0.47.x`, get the matching docs by pinning:

```bash
npx -y @gusto/embedded-sdk-docs-mcp@0.47
```

## How it works (the two-package design)

There are two pieces in this repo that work together:

```
┌──────────────────────────────┐       build       ┌──────────────────────────────┐
│ docs-site/                   │  ───────────────▶ │ docs-site/build/mcp/         │
│   docusaurus.config.ts       │                   │   docs.json                  │
│   + docusaurus-plugin-       │   docs source     │   search-index.json          │
│     mcp-server               │   ───▶ artifacts  │   manifest.json              │
└──────────────────────────────┘                   └──────────────────────────────┘
                                                                  │
                                                                  │ copy at publish time
                                                                  ▼
                                                   ┌──────────────────────────────┐
                                                   │ docs-mcp/                    │
                                                   │   src/cli.ts                 │
                                                   │   artifacts/  (bundled)      │
                                                   │   → npm: @gusto/embedded-    │
                                                   │     sdk-docs-mcp             │
                                                   └──────────────────────────────┘
                                                                  │
                                                                  │ npx
                                                                  ▼
                                                            Claude / Cursor
                                                            (stdio MCP)
```

**`docs-site/`** owns the docs source and runs the Docusaurus build.
`docusaurus-plugin-mcp-server` plugs into that build and emits three JSON files
into `build/mcp/`:

- `docs.json` — every page's content as markdown (~3 MB)
- `search-index.json` — pre-built FlexSearch index (~19 MB)
- `manifest.json` — server metadata

These are static artifacts. No Docusaurus is needed to *use* them.

**`docs-mcp/`** is the runtime distribution. It's a thin CLI that:

1. Loads the bundled artifacts
2. Constructs an MCP server backed by them (search + fetch tools)
3. Connects that server to stdio so AI clients can talk to it

`npm run build` in `docs-mcp/` copies the artifacts from `docs-site/build/mcp/`
into `docs-mcp/artifacts/`, then compiles the CLI. The published npm package
ships the artifacts inline — no Docusaurus on the partner's machine, no
network, just `npx`.

### Why two packages?

Build-time and runtime have **completely different dependency graphs**.
Building the docs site needs Docusaurus, MDX, Webpack, the full theme. Serving
the search needs ~one MB of FlexSearch + the MCP SDK. Shipping the build deps
to every partner running `npx` would be 100+ MB of unused tooling. So we split:

- `docs-site/` runs once at SDK release time and produces the artifacts
- `docs-mcp/` ships only what's needed at runtime

It also means a docs-only fix doesn't need to bump the SDK — and an SDK release
automatically refreshes the MCP package since the build runs from the same
source tree.

## Local development

### Iterate on the docs and see changes in the MCP server

```bash
# 1. Edit docs in /docs/
# 2. Rebuild docs-site artifacts
cd docs-site && npm run build

# 3. Run the MCP server against those fresh artifacts (no copy step needed)
cd ../docs-mcp
GUSTO_SDK_DOCS_MCP_ARTIFACTS=../docs-site/build/mcp npm run start
```

`GUSTO_SDK_DOCS_MCP_ARTIFACTS` overrides the bundled-artifacts lookup. Useful
for fast iteration — you don't need to run `copy-artifacts` between docs edits.

### Point a local Claude Code at the local server

```bash
claude mcp add gusto-sdk-docs-dev -- \
  env GUSTO_SDK_DOCS_MCP_ARTIFACTS=$(pwd)/../docs-site/build/mcp \
  node $(pwd)/dist/cli.js
```

### Smoke-test the protocol by hand

```bash
printf '%s\n%s\n%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"smoke","version":"0.0.0"}}}' \
  '{"jsonrpc":"2.0","method":"notifications/initialized"}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"docs_search","arguments":{"query":"theming","limit":3}}}' \
  | node dist/cli.js
```

## FAQ

**Why not host a remote MCP endpoint at `sdk.gusto.com/mcp`?**

We can — eventually. It needs a serverless function (Cloudflare Worker, Vercel
Edge, etc.) wrapping the artifacts, which doesn't exist today (the docs site
deploys to gh-pages, which is static-only). `npx` ships now, requires no
hosting changes, and gives partners offline-capable docs that match the SDK
version they actually have installed.

**Why is the package ~22 MB?**

The pre-built search index is the bulk. We could regenerate it lazily on first
run from `docs.json` (~3 MB), trading startup time for download size. Worth
revisiting if the size becomes a real friction point.

**Does this leak anything?**

No. The server runs locally over stdio, reads only the bundled artifacts, and
the artifacts contain exactly the same content already published at
[sdk.gusto.com](https://sdk.gusto.com).
