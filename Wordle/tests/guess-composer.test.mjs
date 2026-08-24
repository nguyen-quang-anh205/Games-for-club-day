import assert from "node:assert/strict";
import test from "node:test";

import { composeGuess, remainingInputLength } from "../lib/guess-composer.mjs";

test("the first hint is locked into the sixth guess at its exact position", () => {
  const hints = [{ kind: "position", index: 0, value: "C" }];

  assert.deepEqual(composeGuess(5, "LASS", hints), ["C", "L", "A", "S", "S"]);
  assert.equal(remainingInputLength(5, hints), 4);
});

test("both hint positions remain locked in the eleventh guess", () => {
  const hints = [
    { kind: "position", index: 1, value: "I" },
    { kind: "position", index: 4, value: "E" },
  ];

  assert.deepEqual(composeGuess(6, "CPHR", hints), ["C", "I", "P", "H", "E", "R"]);
  assert.equal(remainingInputLength(6, hints), 4);
});
