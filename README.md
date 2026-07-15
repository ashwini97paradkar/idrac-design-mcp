# idrac-design-mcp

A local [Model Context Protocol](https://modelcontextprotocol.io) (MCP) server that
exposes iDRAC design-system knowledge to MCP-compatible clients. It runs over
**stdio** (no web server) and currently registers a single `get_component` tool
backed by hardcoded placeholder data.

> **Protocol note:** In stdio mode, `stdout` is reserved exclusively for MCP
> protocol messages. All logging in this server goes to `stderr` via
> `console.error()`. Never write to `stdout`.

## Requirements

- Node.js 18+ (ES modules, built-in `node:test`)

## Install

```bash
npm install
```

## Build

Compiles TypeScript from `src/` to `dist/`:

```bash
npm run build
```

## Run

Starts the server on stdio (it will wait for an MCP client to connect):

```bash
npm start
```

## Test

Runs the automated test for the `get_component` handler (builds first):

```bash
npm test
```

The test asserts that `get_component("button")` contains `ic-button` and that an
unknown component returns `No record found`.

## The `get_component` tool

| Field | Type   | Description                                  |
| ----- | ------ | -------------------------------------------- |
| `name`| string | Component name to look up, e.g. `"button"`.  |

Behavior (placeholder data):

- `"button"` -> `Use ic-button from @idrac/ui. Do not use raw HTML buttons.`
- anything else -> `No record found for that component.`

## Inspect with the MCP Inspector

The [MCP Inspector](https://github.com/modelcontextprotocol/inspector) lets you
exercise the tools interactively. After building:

```bash
npm run build
npx @modelcontextprotocol/inspector node dist/index.js
```

This launches the Inspector UI and starts this server as its stdio child
process. Open the printed URL, select the `get_component` tool, and try
`name: "button"`.

## Register in an MCP client

Add an entry to your client's MCP config. Use an **absolute path** to the built
entry file. Example (Claude Desktop / generic `mcpServers` format):

```json
{
  "mcpServers": {
    "idrac-design": {
      "command": "node",
      "args": ["C:/Users/Ashwini_Paradkar/CascadeProjects/idrac-design-mcp/dist/index.js"]
    }
  }
}
```

Build first (`npm run build`) so `dist/index.js` exists, then restart the client.

## Project layout

```
src/
  index.ts            # McpServer + StdioServerTransport wiring, tool registration
  getComponent.ts     # Pure lookup logic (testable, hardcoded data for now)
  getComponent.test.ts# node:test unit tests for the lookup logic
```
