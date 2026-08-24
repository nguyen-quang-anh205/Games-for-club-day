import assert from "node:assert/strict";
import test from "node:test";

import {
  createRound,
  dismissHint,
  evaluateGuess,
  purchaseHint,
  submitGuess,
} from "../lib/game-engine.mjs";

const puzzle = {
  answer: "CIPHER",
  missionBrief: "Transforms readable data.",
  intel: "A cipher is an algorithm used to encrypt or decrypt data.",
};

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
  const state = submitGuess(createRound(puzzle), "HACKER");

  assert.equal(state.score, 195);
  assert.equal(state.attempt, 1);
  assert.equal(state.status, "playing");
});

test("a correct guess grants access without a wrong-guess penalty", () => {
  const state = submitGuess(createRound(puzzle), "CIPHER");

  assert.equal(state.score, 200);
  assert.equal(state.status, "won");
});

test("an invalid-length guess does not consume an attempt", () => {
  const state = submitGuess(createRound(puzzle), "CAT");

  assert.equal(state.attempt, 0);
  assert.equal(state.score, 200);
  assert.equal(state.message, "ENTER A 6-LETTER WORD");
});

test("paid hints unlock only after wrong guesses five and ten", () => {
  let state = createRound(puzzle);
  for (let index = 0; index < 4; index += 1) {
    state = submitGuess(state, "HACKER");
  }
  assert.equal(state.availableHints, 0);

  state = submitGuess(state, "HACKER");
  assert.equal(state.availableHints, 1);
  state = purchaseHint(state);
  assert.equal(state.availableHints, 0);
  assert.equal(state.score, 165);

  for (let index = 0; index < 5; index += 1) {
    state = submitGuess(state, "HACKER");
  }
  assert.equal(state.availableHints, 1);
});

test("declining a milestone hint consumes its credit without a score penalty", () => {
  let state = createRound(puzzle);
  for (let index = 0; index < 5; index += 1) {
    state = submitGuess(state, "HACKER");
  }

  state = dismissHint(state);

  assert.equal(state.availableHints, 0);
  assert.equal(state.score, 175);
});

test("a hint always reveals one exact position even when letters remain undiscovered", () => {
  let state = createRound({ ...puzzle, answer: "APPLE" });
  state = submitGuess(state, "PLANE");
  for (let index = 1; index < 5; index += 1) {
    state = submitGuess(state, "BRICK");
  }

  state = purchaseHint(state);

  assert.equal(state.hints[0].kind, "position");
  assert.equal(state.hints[0].index, 0);
  assert.equal(state.hints[0].value, "A");
  assert.equal(state.hints[0].text, "HINT: Character 1 is A.");
});

test("a position hint appears after every answer letter was discovered", () => {
  let state = createRound({ ...puzzle, answer: "TRACE" });
  state = submitGuess(state, "REACT");
  for (let index = 1; index < 5; index += 1) {
    state = submitGuess(state, "REACT");
  }

  state = purchaseHint(state);

  assert.equal(state.hints[0].kind, "position");
  assert.equal(state.hints[0].index, 0);
  assert.equal(state.hints[0].value, "T");
});

test("incorrect guess eleven fails the round and sets score to zero", () => {
  let state = createRound(puzzle);
  for (let index = 0; index < 11; index += 1) {
    state = submitGuess(state, "HACKER");
  }

  assert.equal(state.status, "lost");
  assert.equal(state.score, 0);
  assert.equal(state.attempt, 11);
});
