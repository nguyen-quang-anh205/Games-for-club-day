import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { puzzles } from "../app/puzzles.ts";

test("every mission brief includes a Vietnamese translation", () => {
  for (const puzzle of [...puzzles.school, ...puzzles.club]) {
    assert.match(puzzle.missionBriefVi, /\S/);
    assert.ok(puzzle.answer.length >= 4 && puzzle.answer.length <= 8);
  }
});

test("game UI uses a milestone hint dialog without virtual keyboard or scan log", async () => {
  const source = await readFile(new URL("../app/CyberWordle.tsx", import.meta.url), "utf8");

  assert.doesNotMatch(source, /KEY_ROWS|Virtual keyboard|FREE INTEL|LETTER SCAN|hint-log/);
  assert.match(source, /hint-dialog/);
  assert.match(source, /missionBriefVi/);
});

test("accepted hints attach to the active game instead of opening a second dialog", async () => {
  const source = await readFile(new URL("../app/CyberWordle.tsx", import.meta.url), "utf8");

  assert.doesNotMatch(source, /hintDialogResult|HINT RECEIVED|NEW INTEL/);
  assert.doesNotMatch(source, /revealed-position/);
  assert.match(source, /composeGuess/);
  assert.match(source, /hinted/);
});

test("play screen removes board metadata and gives the enlarged grid center focus", async () => {
  const source = await readFile(new URL("../app/CyberWordle.tsx", import.meta.url), "utf8");
  const styles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(source, /className="protocol-label">\{roundMeta\.label\}/);
  assert.doesNotMatch(source, /WORD LENGTH|className="board-heading"/);

  const rowRule = styles.match(/\.word-row\s*\{[^}]*repeat\(var\(--word-length\),\s*(\d+)px\)[^}]*\}/s);
  const cellRule = styles.match(/\.letter-cell\s*\{[^}]*height:\s*(\d+)px[^}]*\}/s);
  assert.ok(rowRule, "word rows must define a desktop cell width");
  assert.ok(cellRule, "letter cells must define a desktop height");
  assert.ok(Number(rowRule[1]) >= 52, "desktop letter cells must be visibly wider");
  assert.ok(Number(cellRule[1]) >= 46, "desktop letter cells must be visibly taller");
  assert.match(styles, /\.board-panel\s*\{[^}]*justify-items:\s*center[^}]*\}/s);
  assert.match(styles, /\.game-layout\s*\{[^}]*grid-template-columns:\s*minmax\([^;]+\)\s+minmax\([^;]+\)\s+minmax\([^;]+\)[^}]*\}/s);
});
