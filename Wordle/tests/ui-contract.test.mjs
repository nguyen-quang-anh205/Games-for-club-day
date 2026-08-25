import assert from "node:assert/strict";
import test from "node:test";

import { puzzles } from "../app/puzzles.ts";

test("the USTH round uses science and university themed answers", () => {
  const expected = new Set(["ROBOT", "SPACE", "SOLAR", "CELLS", "GENES", "OCEAN", "EARTH", "LASER"]);

  assert.ok(puzzles.usth.length >= 5);
  for (const puzzle of puzzles.usth) {
    assert.ok(expected.has(puzzle.answer), `${puzzle.answer} must fit the USTH round theme`);
  }
});
