const STARTING_SCORE = 200;
const MAX_ATTEMPTS = 11;

const normalizeWord = (word) => word.trim().toUpperCase();

export function evaluateGuess(answerInput, guessInput) {
  const answer = normalizeWord(answerInput);
  const guess = normalizeWord(guessInput);
  const result = Array(answer.length).fill("absent");
  const remaining = new Map();

  for (let index = 0; index < answer.length; index += 1) {
    if (guess[index] === answer[index]) {
      result[index] = "correct";
    } else {
      remaining.set(answer[index], (remaining.get(answer[index]) ?? 0) + 1);
    }
  }

  for (let index = 0; index < answer.length; index += 1) {
    if (result[index] === "correct") continue;
    const count = remaining.get(guess[index]) ?? 0;
    if (count > 0) {
      result[index] = "present";
      remaining.set(guess[index], count - 1);
    }
  }

  return result;
}

export function createRound(puzzle) {
  return {
    puzzle: { ...puzzle, answer: normalizeWord(puzzle.answer) },
    score: STARTING_SCORE,
    attempt: 0,
    rows: [],
    hints: [],
    availableHints: 0,
    status: "playing",
    message: "SYSTEM READY — ENTER YOUR FIRST GUESS",
  };
}

export function submitGuess(state, guessInput) {
  if (state.status !== "playing") return state;

  const guess = normalizeWord(guessInput);
  const length = state.puzzle.answer.length;
  if (!new RegExp(`^[A-Z]{${length}}$`).test(guess)) {
    return { ...state, message: `ENTER A ${length}-LETTER WORD` };
  }

  const evaluation = evaluateGuess(state.puzzle.answer, guess);
  const nextAttempt = state.attempt + 1;
  const rows = [...state.rows, { guess, evaluation }];

  if (guess === state.puzzle.answer) {
    return {
      ...state,
      attempt: nextAttempt,
      rows,
      status: "won",
      message: "ACCESS GRANTED",
    };
  }

  const failed = nextAttempt >= MAX_ATTEMPTS;
  const unlocked = nextAttempt === 5 || nextAttempt === 10 ? 1 : 0;
  return {
    ...state,
    score: failed ? 0 : Math.max(0, state.score - 5),
    attempt: nextAttempt,
    rows,
    availableHints: state.availableHints + unlocked,
    status: failed ? "lost" : "playing",
    message: failed
      ? "ACCESS DENIED"
      : unlocked
        ? "NEW SCAN CREDIT AVAILABLE"
        : "SIGNATURE MISMATCH — TRY AGAIN",
  };
}

const knownPositions = (state) => {
  const known = new Set(
    state.hints.filter(({ kind }) => kind === "position").map(({ index }) => index),
  );
  for (const row of state.rows) {
    row.evaluation.forEach((result, index) => {
      if (result === "correct") known.add(index);
    });
  }
  return known;
};

export function purchaseHint(state) {
  if (state.status !== "playing" || state.availableHints < 1) return state;

  const answer = state.puzzle.answer;
  const known = knownPositions(state);
  const index = [...answer].findIndex((_, position) => !known.has(position));
  if (index < 0) {
    return { ...state, message: "ALL POSITIONS ALREADY TRACED" };
  }

  const hint = {
    kind: "position",
    index,
    value: answer[index],
    text: `HINT: Character ${index + 1} is ${answer[index]}.`,
  };
  return {
    ...state,
    score: Math.max(0, state.score - 10),
    availableHints: state.availableHints - 1,
    hints: [...state.hints, hint],
    message: `HINT APPLIED TO ATTEMPT ${state.attempt + 1}`,
  };
}

export function dismissHint(state) {
  if (state.availableHints < 1) return state;
  return {
    ...state,
    availableHints: state.availableHints - 1,
    message: "HINT SKIPPED — CONTINUE THE MISSION",
  };
}

export const GAME_RULES = {
  startingScore: STARTING_SCORE,
  maxAttempts: MAX_ATTEMPTS,
  wrongGuessCost: 5,
  hintCost: 10,
};
