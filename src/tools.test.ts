import { test } from "node:test";
import assert from "node:assert/strict";

import { loadKnowledge } from "./knowledgeLoader.js";
import {
  getComponent,
  getPattern,
  searchPatterns,
  getA11yRequirements,
  getExample,
} from "./tools.js";

test("getComponent returns full component record for known id", () => {
  const kb = loadKnowledge("test-fixtures");
  const result = getComponent(kb, "test-button");
  assert.ok(result.includes("id: test-button"));
  assert.ok(result.includes("TODO"));
  assert.ok(result.includes("inputs: []"));
});

test("getComponent returns not found for unknown id", () => {
  const kb = loadKnowledge("test-fixtures");
  const result = getComponent(kb, "unknown-component");
  assert.ok(result.includes("No component record found"));
  assert.ok(result.includes("Do not invent a component"));
});

test("getPattern returns full pattern record including notes", () => {
  const kb = loadKnowledge("test-fixtures");
  const result = getPattern(kb, "test-nav");
  assert.ok(result.includes("id: test-nav"));
  assert.ok(result.includes("notes:"));
});

test("getPattern returns not found for unknown id", () => {
  const kb = loadKnowledge("test-fixtures");
  const result = getPattern(kb, "unknown-pattern");
  assert.ok(result.includes("No pattern record found"));
});

test("searchPatterns returns matching results", () => {
  const kb = loadKnowledge("test-fixtures");
  const result = searchPatterns(kb, "navigation");
  assert.ok(result.includes("test-nav"));
  assert.ok(result.includes("Provides navigation"));
});

test("searchPatterns returns no results for non-matching query", () => {
  const kb = loadKnowledge("test-fixtures");
  const result = searchPatterns(kb, "nonexistent");
  assert.ok(result.includes("No patterns found"));
});

test("getA11yRequirements resolves a11y_refs from pattern", () => {
  const kb = loadKnowledge("test-fixtures");
  const result = getA11yRequirements(kb, [], "test-nav");
  assert.ok(result.includes("test-keyboard-nav"));
});

test("getA11yRequirements returns no results when none found", () => {
  const kb = loadKnowledge("test-fixtures");
  const result = getA11yRequirements(kb, ["unknown-component"]);
  assert.ok(result.includes("No accessibility requirements found"));
});

test("getExample returns full example record with snippet", () => {
  const kb = loadKnowledge("test-fixtures");
  const result = getExample(kb, "test-nav-example");
  assert.ok(result.includes("id: test-nav-example"));
  assert.ok(result.includes("snippet:"));
});

test("getExample returns not found for unknown id", () => {
  const kb = loadKnowledge("test-fixtures");
  const result = getExample(kb, "unknown-example");
  assert.ok(result.includes("No example record found"));
});
