import assert from "node:assert/strict";
import test from "node:test";

import { rankEntries, upsertScore } from "../lib/leaderboard.mjs";

const entry = (codename, totalScore, achievedAt = "2026-08-24T10:00:00.000Z") => ({
  codename,
  schoolScore: totalScore,
  clubScore: 0,
  totalScore,
  roundsCompleted: 1,
  achievedAt,
});

test("upsertScore keeps only the highest score for a codename", () => {
  let records = upsertScore([], entry("ZeroDay", 180));
  records = upsertScore(records, entry("zeroday", 150));
  records = upsertScore(records, entry("ZERODAY", 190));

  assert.equal(records.length, 1);
  assert.equal(records[0].codename, "ZERODAY");
  assert.equal(records[0].totalScore, 190);
});

test("rankEntries sorts by score then earliest achievement", () => {
  const records = [
    entry("Cipher", 180, "2026-08-24T11:00:00.000Z"),
    entry("Packet", 190, "2026-08-24T12:00:00.000Z"),
    entry("Proxy", 180, "2026-08-24T09:00:00.000Z"),
  ];

  assert.deepEqual(
    rankEntries(records).map(({ codename }) => codename),
    ["Packet", "Proxy", "Cipher"],
  );
});
