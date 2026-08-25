import assert from "node:assert/strict";
import test from "node:test";

import { composeGuess, remainingInputLength } from "../lib/guess-composer.mjs";

test("the automatic hint is locked into the fourth guess at its exact position", () => {
  const hints = [{ kind: "position", index: 0, value: "A" }];

  assert.deepEqual(composeGuess(5, "PPLE", hints), ["A", "P", "P", "L", "E"]);
  assert.equal(remainingInputLength(5, hints), 4);
});

test("the locked hint leaves every other position editable", () => {
  const hints = [{ kind: "position", index: 2, value: "A" }];

  assert.deepEqual(composeGuess(5, "TRCE", hints), ["T", "R", "A", "C", "E"]);
  assert.equal(remainingInputLength(5, hints), 4);
});
