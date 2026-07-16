import * as yaml from "js-yaml";
import type { KnowledgeBase, LoadedRecord } from "./knowledgeLoader.js";

/**
 * get_component: Returns the full component record as raw YAML.
 * If no match, returns a clear "not found" message.
 */
export function getComponent(kb: KnowledgeBase, name: string): string {
  const record = kb.components.get(name);
  if (!record) {
    return `No component record found for id "${name}". Do not invent a component; use only components defined in the design system.`;
  }
  return record.raw;
}

/**
 * get_pattern: Returns the full pattern record as raw YAML, including notes if present.
 */
export function getPattern(kb: KnowledgeBase, id: string): string {
  const record = kb.patterns.get(id);
  if (!record) {
    return `No pattern record found for id "${id}".`;
  }
  return record.raw;
}

/**
 * search_patterns: Returns ids and intent text of patterns matching the query.
 * Simple keyword matching: all query words must appear in title or intent.
 */
export function searchPatterns(kb: KnowledgeBase, query: string): string {
  const queryWords = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (queryWords.length === 0) {
    return "No query provided for pattern search.";
  }

  const results: Array<{ id: string; intent: string }> = [];
  for (const [id, record] of kb.patterns.entries()) {
    const parsed = record.parsed as { title?: string; intent?: string };
    const title = (parsed.title || "").toLowerCase();
    const intent = (parsed.intent || "").toLowerCase();
    const combined = `${title} ${intent}`;

    if (queryWords.every((word) => combined.includes(word))) {
      results.push({ id, intent: parsed.intent || "(no intent)" });
    }
  }

  if (results.length === 0) {
    return `No patterns found matching query: "${query}"`;
  }

  return yaml.dump(results);
}

/**
 * get_a11y_requirements: Returns combined, de-duplicated a11y rules.
 * For a pattern, follows its a11y_refs; for components, includes component-level a11y entries.
 */
export function getA11yRequirements(
  kb: KnowledgeBase,
  componentIds: string[],
  patternId?: string
): string {
  const ruleIds = new Set<string>();
  const inlineRules: unknown[] = [];

  // Collect from components
  for (const cid of componentIds) {
    const record = kb.components.get(cid);
    if (record) {
      const parsed = record.parsed as { a11y?: unknown };
      if (parsed.a11y) {
        if (Array.isArray(parsed.a11y)) {
          for (const item of parsed.a11y) {
            if (typeof item === "string") {
              ruleIds.add(item);
            } else {
              inlineRules.push(item);
            }
          }
        } else {
          inlineRules.push(parsed.a11y);
        }
      }
    }
  }

  // Collect from pattern a11y_refs
  if (patternId) {
    const record = kb.patterns.get(patternId);
    if (record) {
      const parsed = record.parsed as { a11y_refs?: string[] };
      if (parsed.a11y_refs) {
        for (const ref of parsed.a11y_refs) {
          ruleIds.add(ref);
        }
      }
    }
  }

  // Resolve rule ids to a11y records
  const resolvedRules: unknown[] = [];
  for (const rid of ruleIds) {
    const record = kb.a11y.get(rid);
    if (record) {
      resolvedRules.push(record.parsed);
    } else {
      console.error(`[a11y] Referenced rule not found: ${rid}`);
    }
  }

  // Combine resolved rules and inline rules
  const combined = [...resolvedRules, ...inlineRules];
  if (combined.length === 0) {
    return "No accessibility requirements found for the provided components/pattern.";
  }

  return yaml.dump(combined);
}

/**
 * get_example: Returns the full example record as raw YAML, including snippet.
 */
export function getExample(kb: KnowledgeBase, id: string): string {
  const record = kb.examples.get(id);
  if (!record) {
    return `No example record found for id "${id}".`;
  }
  return record.raw;
}
