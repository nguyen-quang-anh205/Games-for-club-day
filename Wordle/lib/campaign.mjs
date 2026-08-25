import { composeGuess } from "./guess-composer.mjs";

export const ROUND_CATEGORIES = ["general-one", "general-two", "usth"];

const FLAG_PREFIX = "UCS";
const BOARD_ROWS = 6;
const WORD_LENGTH = 5;

export const FLAG_FRAGMENTS = ["toi", "yeu", "minhquang"];

export function composeFlag(fragments) {
  const completedRounds = Math.min(fragments.length, FLAG_FRAGMENTS.length);
  const slots = FLAG_FRAGMENTS.map((fragment, index) => {
    return index < completedRounds ? fragment : "?".repeat(fragment.length);
  });
  return `${FLAG_PREFIX}{${slots.join("_")}}`;
}

export function buildCampaignEntry(codename, roundScores, achievedAt) {
  const scores = roundScores.slice(0, ROUND_CATEGORIES.length);
  return {
    codename: codename.trim(),
    roundScores: scores,
    totalScore: scores.reduce((total, score) => total + score, 0),
    roundsCompleted: scores.length,
    achievedAt,
  };
}

export function buildBoardRows(round, typedInput) {
  return Array.from({ length: BOARD_ROWS }, (_, rowIndex) => {
    const submitted = round.rows[rowIndex];
    const active = rowIndex === round.rows.length;
    const letters = submitted
      ? [...submitted.guess]
      : active
        ? composeGuess(WORD_LENGTH, typedInput, round.hints)
        : Array(WORD_LENGTH).fill("");
    return {
      active,
      letters,
      evaluation: submitted?.evaluation ?? [],
    };
  });
}
