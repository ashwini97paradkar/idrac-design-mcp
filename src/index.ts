import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { loadKnowledge, type KnowledgeBase } from "./knowledgeLoader.js";
import {
  getComponent,
  getPattern,
  searchPatterns,
  getA11yRequirements,
  getExample,
} from "./tools.js";

/**
 * IMPORTANT: stdout is reserved for the MCP protocol (JSON-RPC over stdio).
 * Never write logs to stdout. Use console.error() (stderr) for any logging.
 */
const server = new McpServer({
  name: "idrac-design-mcp",
  version: "0.1.0",
});

let kb: KnowledgeBase;

// Register tools
server.registerTool(
  "get_component",
  {
    title: "Get Component",
    description:
      "Call when building or modifying a page or composite UI element. Returns the full component record (as YAML) for a given component id. Do not invent components; use only those defined in the design system.",
    inputSchema: {
      name: z.string().describe("The component id to look up (matches the 'id' field in the component YAML)."),
    },
  },
  async ({ name }) => {
    return {
      content: [{ type: "text", text: getComponent(kb, name) }],
    };
  }
);

server.registerTool(
  "get_pattern",
  {
    title: "Get Pattern",
    description:
      "Call when building or modifying a page or composite UI element. Returns the full pattern record (as YAML) for a given pattern id, including its 'notes' field if present.",
    inputSchema: {
      id: z.string().describe("The pattern id to look up (matches the 'id' field in the pattern YAML)."),
    },
  },
  async ({ id }) => {
    return {
      content: [{ type: "text", text: getPattern(kb, id) }],
    };
  }
);

server.registerTool(
  "search_patterns",
  {
    title: "Search Patterns",
    description:
      "Call when exploring available patterns or looking for a pattern to solve a UX problem. Returns ids and intent text of patterns matching a query (keyword search on title and intent).",
    inputSchema: {
      query: z.string().describe("Plain-text query string to search for in pattern titles and intents."),
    },
  },
  async ({ query }) => {
    return {
      content: [{ type: "text", text: searchPatterns(kb, query) }],
    };
  }
);

server.registerTool(
  "get_a11y_requirements",
  {
    title: "Get Accessibility Requirements",
    description:
      "Call when building or modifying a page or composite UI element to ensure compliance. Returns combined, de-duplicated accessibility rules for the given component ids and/or pattern id (follows pattern a11y_refs and component-level a11y entries).",
    inputSchema: {
      componentIds: z
        .array(z.string())
        .describe("List of component ids to include a11y requirements for."),
      patternId: z
        .string()
        .optional()
        .describe("Optional pattern id to include a11y requirements for (follows its a11y_refs)."),
    },
  },
  async ({ componentIds, patternId }) => {
    return {
      content: [
        {
          type: "text",
          text: getA11yRequirements(kb, componentIds || [], patternId),
        },
      ],
    };
  }
);

server.registerTool(
  "get_example",
  {
    title: "Get Example",
    description:
      "Call when looking for usage examples or reference implementations. Returns the full example record (as YAML) for a given example id, including its snippet field.",
    inputSchema: {
      id: z.string().describe("The example id to look up (matches the 'id' field in the example YAML)."),
    },
  },
  async ({ id }) => {
    return {
      content: [{ type: "text", text: getExample(kb, id) }],
    };
  }
);

// Register resources
server.registerResource(
  "components",
  "idrac-design://components",
  {
    title: "Components",
    description: "All component records from the design system.",
    mimeType: "application/json",
  },
  async () => {
    const arr = Array.from(kb.components.values()).map((r) => r.parsed);
    return {
      contents: [{ uri: "idrac-design://components", mimeType: "application/json", text: JSON.stringify(arr, null, 2) }],
    };
  }
);

server.registerResource(
  "patterns",
  "idrac-design://patterns",
  {
    title: "Patterns",
    description: "All pattern records from the design system.",
    mimeType: "application/json",
  },
  async () => {
    const arr = Array.from(kb.patterns.values()).map((r) => r.parsed);
    return {
      contents: [{ uri: "idrac-design://patterns", mimeType: "application/json", text: JSON.stringify(arr, null, 2) }],
    };
  }
);

server.registerResource(
  "a11y",
  "idrac-design://a11y",
  {
    title: "Accessibility Rules",
    description: "All accessibility rule records from the design system.",
    mimeType: "application/json",
  },
  async () => {
    const arr = Array.from(kb.a11y.values()).map((r) => r.parsed);
    return {
      contents: [{ uri: "idrac-design://a11y", mimeType: "application/json", text: JSON.stringify(arr, null, 2) }],
    };
  }
);

server.registerResource(
  "examples",
  "idrac-design://examples",
  {
    title: "Examples",
    description: "All example records from the design system.",
    mimeType: "application/json",
  },
  async () => {
    const arr = Array.from(kb.examples.values()).map((r) => r.parsed);
    return {
      contents: [{ uri: "idrac-design://examples", mimeType: "application/json", text: JSON.stringify(arr, null, 2) }],
    };
  }
);

async function main(): Promise<void> {
  // Load knowledge from the idrac-design-knowledge folder
  const knowledgePath =
    "C:\\Users\\Ashwini_Paradkar\\OneDrive - Dell Technologies\\Documents\\GitHub\\idrac-design-knowledge";
  kb = loadKnowledge(knowledgePath);

  // Log load counts to stderr (for sanity-checking coverage)
  console.error(`[idrac-design-mcp] Loaded ${kb.components.size} components`);
  console.error(`[idrac-design-mcp] Loaded ${kb.patterns.size} patterns`);
  console.error(`[idrac-design-mcp] Loaded ${kb.a11y.size} a11y rules`);
  console.error(`[idrac-design-mcp] Loaded ${kb.examples.size} examples`);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Log to stderr only — stdout carries the protocol messages.
  console.error("idrac-design-mcp server running on stdio.");
}

main().catch((err) => {
  console.error("Fatal error starting idrac-design-mcp:", err);
  process.exit(1);
});
