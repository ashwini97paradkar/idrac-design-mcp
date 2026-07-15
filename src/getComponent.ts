/**
 * Core lookup logic for the `get_component` tool.
 *
 * Data is intentionally hardcoded for now (no file reads). Keeping this in a
 * standalone, pure function makes it directly unit-testable without spinning
 * up the MCP server or a transport.
 */
export function getComponent(name: string): string {
  switch (name.trim().toLowerCase()) {
    case "button":
      return "Use ic-button from @idrac/ui. Do not use raw HTML buttons.";
    default:
      return "No record found for that component.";
  }
}
