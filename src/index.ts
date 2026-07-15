import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { getComponent } from "./getComponent.js";

/**
 * IMPORTANT: stdout is reserved for the MCP protocol (JSON-RPC over stdio).
 * Never write logs to stdout. Use console.error() (stderr) for any logging.
 */
const server = new McpServer({
  name: "idrac-design-mcp",
  version: "0.1.0",
});

server.registerTool(
  "get_component",
  {
    title: "Get Component",
    description:
      "Look up iDRAC design-system guidance for a named component (e.g. \"button\").",
    inputSchema: {
      name: z.string().describe("The component name to look up, e.g. \"button\"."),
    },
  },
  async ({ name }) => {
    return {
      content: [{ type: "text", text: getComponent(name) }],
    };
  }
);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Log to stderr only — stdout carries the protocol messages.
  console.error("idrac-design-mcp server running on stdio.");
}

main().catch((err) => {
  console.error("Fatal error starting idrac-design-mcp:", err);
  process.exit(1);
});
