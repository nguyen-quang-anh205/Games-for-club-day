import assert from "node:assert/strict";
import test from "node:test";

import { createRound, evaluateGuess, submitGuess } from "../lib/game-engine.mjs";

const puzzle = {
  answer: "APPLE",
  intel: "A common five-letter English word.",
  category: "general-one",
};

test("a new round starts without a status message", () => {
  assert.equal(createRound(puzzle).message, "");
});

test("evaluateGuess handles duplicate letters without over-crediting", () => {
  assert.deepEqual(evaluateGuess("APPLE", "ALLEY"), [
    "correct",
    "present",
    "absent",
    "present",
    "absent",
  ]);
});

test("an incorrect guess costs five points", () => {
  const state = submitGuess(createRound(puzzle), "BRICK");

  assert.equal(state.score, 195);
  assert.equal(state.attempt, 1);
  assert.equal(state.status, "playing");
});

test("a correct guess grants access without a wrong-guess penalty", () => {
  const state = submitGuess(createRound(puzzle), "APPLE");

  assert.equal(state.score, 200);
  assert.equal(state.status, "won");
});

test("a guess that is not five letters does not consume an attempt", () => {
  const state = submitGuess(createRound(puzzle), "CAT");

  assert.equal(state.attempt, 0);
  assert.equal(state.score, 200);
  assert.equal(state.message, "ENTER A 5-LETTER WORD");
});

test("a word outside the allowed Wordle list does not consume an attempt", () => {
  const allowedWords = new Set(["APPLE", "BRICK"]);
  const state = submitGuess(createRound(puzzle), "ZZZZZ", allowedWords);

  assert.equal(state.attempt, 0);
  assert.equal(state.score, 200);
  assert.equal(state.message, "WORD NOT IN LIST");
});

test("the third wrong guess automatically adds one exact-position hint", () => {
  let state = createRound(puzzle);
  state = submitGuess(state, "BRICK");
  state = submitGuess(state, "BRICK");

  assert.deepEqual(state.hints, []);

  state = submitGuess(state, "BRICK");

  assert.equal(state.attempt, 3);
  assert.equal(state.score, 175);
  assert.deepEqual(state.hints, [{
    kind: "position",
    index: 0,
    value: "A",
    text: "HINT: Character 1 is A.",
  }]);
  assert.equal(state.message, "HINT APPLIED TO ATTEMPT 4");
});

test("the automatic hint chooses a position not already solved", () => {
  let state = createRound({ ...puzzle, answer: "TRACE" });
  state = submitGuess(state, "TRICK");
  state = submitGuess(state, "TRICK");
  state = submitGuess(state, "TRICK");

  assert.equal(state.hints[0].index, 2);
  assert.equal(state.hints[0].value, "A");
});

test("the sixth incorrect guess fails the round", () => {
  let state = createRound(puzzle);
  for (let index = 0; index < 6; index += 1) {
    state = submitGuess(state, "BRICK");
  }

  assert.equal(state.status, "lost");
  assert.equal(state.score, 0);
  assert.equal(state.attempt, 6);
});
