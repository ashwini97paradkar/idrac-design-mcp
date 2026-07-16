import * as fs from "node:fs";
import * as path from "node:path";
import * as yaml from "js-yaml";

/**
 * A record loaded from a YAML file, containing both the parsed object
 * and the raw YAML string.
 */
export interface LoadedRecord<T = unknown> {
  id: string;
  parsed: T;
  raw: string;
}

/**
 * The knowledge base indexed by id for each category.
 */
export interface KnowledgeBase {
  components: Map<string, LoadedRecord>;
  patterns: Map<string, LoadedRecord>;
  a11y: Map<string, LoadedRecord>;
  examples: Map<string, LoadedRecord>;
}

/**
 * Loads all YAML files from the idrac-design-knowledge folder.
 * Logs errors to stderr and skips malformed files without crashing.
 *
 * @param knowledgePath - Absolute path to the idrac-design-knowledge folder.
 * @returns Indexed knowledge base.
 */
export function loadKnowledge(knowledgePath: string): KnowledgeBase {
  const base: KnowledgeBase = {
    components: new Map(),
    patterns: new Map(),
    a11y: new Map(),
    examples: new Map(),
  };

  const folders = [
    { name: "components", map: base.components },
    { name: "patterns", map: base.patterns },
    { name: "a11y", map: base.a11y },
    { name: "examples", map: base.examples },
  ];

  for (const folder of folders) {
    const folderPath = path.join(knowledgePath, folder.name);
    if (!fs.existsSync(folderPath)) {
      console.error(`[knowledge] Folder not found: ${folderPath}`);
      continue;
    }

    const entries = fs.readdirSync(folderPath, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith(".yaml")) continue;

      const filePath = path.join(folderPath, entry.name);
      try {
        const raw = fs.readFileSync(filePath, "utf-8");
        const parsed = yaml.load(raw);

        if (parsed && typeof parsed === "object" && "id" in parsed) {
          const id = String((parsed as { id: unknown }).id);
          folder.map.set(id, { id, parsed, raw });
        } else {
          console.error(
            `[knowledge] Skipped malformed file (no id field): ${filePath}`
          );
        }
      } catch (err) {
        console.error(`[knowledge] Failed to load ${filePath}:`, err);
      }
    }
  }

  return base;
}
