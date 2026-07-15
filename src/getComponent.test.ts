import { test } from "node:test";
import assert from "node:assert/strict";

import { getComponent } from "./getComponent.js";

test("get_component returns ic-button guidance for \"button\"", () => {
  const result = getComponent("button");
  assert.ok(
    result.includes("ic-button"),
    `expected response to contain "ic-button", got: ${result}`
  );
});

test("get_component returns not-found for an unknown component", () => {
  const result = getComponent("nonsense");
  assert.ok(
    result.includes("No record found"),
    `expected response to contain "No record found", got: ${result}`
  );
});
