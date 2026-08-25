import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { pickPuzzle, puzzles } from "../app/puzzles.ts";

const loadCampaign = () => import("../lib/campaign.mjs").catch(() => ({}));

test("the campaign exposes two general rounds followed by one USTH round", async () => {
  const campaign = await loadCampaign();

  assert.deepEqual(campaign.ROUND_CATEGORIES, ["general-one", "general-two", "usth"]);
  assert.ok(puzzles["general-one"].length > 0);
  assert.ok(puzzles["general-two"].length > 0);
  assert.ok(puzzles.usth.length > 0);
});

test("every campaign answer is an uppercase five-letter Wordle word", async () => {
  const wordlist = new Set(
    (await readFile(new URL("../public/wordlist.txt", import.meta.url), "utf8"))
      .split(/\s+/)
      .filter(Boolean),
  );

  for (const group of Object.values(puzzles)) {
    for (const puzzle of group) {
      assert.match(puzzle.answer, /^[A-Z]{5}$/);
      assert.ok(wordlist.has(puzzle.answer.toLowerCase()), `${puzzle.answer} must exist in wordlist.txt`);
    }
  }
});

test("composeFlag reveals fixed fragments independently of random answers", async () => {
  const campaign = await loadCampaign();

  assert.deepEqual(campaign.FLAG_FRAGMENTS, ["toi", "yeu", "minhquang"]);
  assert.equal(campaign.composeFlag([]), "UCS{???_???_?????????}");
  assert.equal(campaign.composeFlag(["APPLE"]), "UCS{toi_???_?????????}");
  assert.equal(campaign.composeFlag(["APPLE", "BRICK", "ROBOT"]), "UCS{toi_yeu_minhquang}");
});

test("pickPuzzle uses a supplied random source for deterministic selection", () => {
  assert.equal(puzzles["general-one"].length, 5);
  assert.equal(pickPuzzle("general-one", () => 0).answer, "APPLE");
  assert.equal(pickPuzzle("general-one", () => 0.999999).answer, "LIGHT");
});

test("buildCampaignEntry totals all three round scores", async () => {
  const campaign = await loadCampaign();
  const entry = campaign.buildCampaignEntry(
    "ZeroDay",
    [185, 180, 175],
    "2026-08-25T10:00:00.000Z",
  );

  assert.deepEqual(entry, {
    codename: "ZeroDay",
    roundScores: [185, 180, 175],
    totalScore: 540,
    roundsCompleted: 3,
    achievedAt: "2026-08-25T10:00:00.000Z",
  });
});

test("buildBoardRows always creates six five-cell rows and locks the active hint", async () => {
  const campaign = await loadCampaign();
  const board = campaign.buildBoardRows({
    puzzle: { answer: "APPLE" },
    rows: [
      { guess: "BRICK", evaluation: ["absent", "absent", "absent", "absent", "absent"] },
      { guess: "BRICK", evaluation: ["absent", "absent", "absent", "absent", "absent"] },
      { guess: "BRICK", evaluation: ["absent", "absent", "absent", "absent", "absent"] },
    ],
    hints: [{ kind: "position", index: 0, value: "A" }],
  }, "PPLE");

  assert.equal(board.length, 6);
  assert.ok(board.every((row) => row.letters.length === 5));
  assert.equal(board[3].active, true);
  assert.deepEqual(board[3].letters, ["A", "P", "P", "L", "E"]);
});
