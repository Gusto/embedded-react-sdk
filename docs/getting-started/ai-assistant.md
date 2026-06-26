---
title: AI Assistant
description: Install a local MCP server so AI coding tools (Claude Code, Cursor, VS Code) can search and read the Gusto Embedded React SDK docs while you're integrating.
order: 6
---

The SDK ships an [MCP (Model Context Protocol)](https://modelcontextprotocol.io)
server that exposes these docs to AI coding tools. Once installed, your AI
assistant can search and fetch SDK documentation directly while you work —
answers come from the version of the SDK you have installed, not from whatever
the model happened to see during training.

## Install

### Claude Code

```bash title="Command line"
claude mcp add gusto-sdk-docs -- npx -y @gusto/embedded-sdk-docs-mcp
```

Restart Claude Code if it was already running. From then on, ask things like:

> Use `gusto-sdk-docs` to find how theming works in the Embedded React SDK.

The agent will call `docs_search`, then `docs_fetch` to pull the full page,
and answer from real docs.

### Cursor / VS Code

Add to your MCP config (`~/.cursor/mcp.json` for Cursor, `.vscode/mcp.json`
for the VS Code MCP extension):

```json title="mcp.json"
{
  "mcpServers": {
    "gusto-sdk-docs": {
      "command": "npx",
      "args": ["-y", "@gusto/embedded-sdk-docs-mcp"]
    }
  }
}
```

### Other MCP-compatible tools

Any tool that supports stdio MCP servers can run the same command. The package
exposes a single binary, `gusto-sdk-docs-mcp`, that speaks MCP over stdio.

## What it exposes

The server exposes two tools to the AI assistant:

| Tool | Purpose |
|---|---|
| `docs_search` | Full-text search across every SDK doc page. Returns titles, URLs, snippets, and relevance scores. |
| `docs_fetch` | Returns the complete markdown content of a doc page, given its URL. |

That's enough for an agent to find the right page for a question, then read it
in full before answering.

## Pin to your SDK version

The MCP package is versioned in lock-step with `@gusto/embedded-react-sdk`.
If you're on SDK `0.47.x`, get the matching docs by pinning the same minor:

```bash title="Command line"
claude mcp add gusto-sdk-docs -- npx -y @gusto/embedded-sdk-docs-mcp@0.47
```

When you upgrade the SDK, upgrade the MCP package the same way and the agent
sees the new docs immediately.

## Privacy

The server runs **locally over stdio**. Nothing leaves your machine — no
network calls, no telemetry, no auth. The bundled artifacts contain the same
content already published at [sdk.gusto.com](https://sdk.gusto.com).
