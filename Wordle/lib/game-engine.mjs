const STARTING_SCORE = 200;
const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;
const HINT_TRIGGER_ATTEMPT = 3;

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
    status: "playing",
    message: "",
  };
}

export function submitGuess(state, guessInput, allowedWords) {
  if (state.status !== "playing") return state;

  const guess = normalizeWord(guessInput);
  if (!new RegExp(`^[A-Z]{${WORD_LENGTH}}$`).test(guess)) {
    return { ...state, message: `ENTER A ${WORD_LENGTH}-LETTER WORD` };
  }
  if (allowedWords && !allowedWords.has(guess)) {
    return { ...state, message: "WORD NOT IN LIST" };
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
  const unlockHint = !failed && nextAttempt === HINT_TRIGGER_ATTEMPT;
  const nextState = {
    ...state,
    score: failed ? 0 : Math.max(0, state.score - 5),
    attempt: nextAttempt,
    rows,
    status: failed ? "lost" : "playing",
    message: failed ? "ACCESS DENIED" : "SIGNATURE MISMATCH — TRY AGAIN",
  };
  if (!unlockHint) return nextState;

  const known = knownPositions(nextState);
  const answer = state.puzzle.answer;
  const index = [...answer].findIndex((_, position) => !known.has(position));
  if (index < 0) return nextState;

  const hint = {
    kind: "position",
    index,
    value: answer[index],
    text: `HINT: Character ${index + 1} is ${answer[index]}.`,
  };
  return {
    ...nextState,
    score: Math.max(0, nextState.score - 10),
    hints: [...state.hints, hint],
    message: `HINT APPLIED TO ATTEMPT ${nextAttempt + 1}`,
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

export const GAME_RULES = {
  startingScore: STARTING_SCORE,
  wordLength: WORD_LENGTH,
  maxAttempts: MAX_ATTEMPTS,
  wrongGuessCost: 5,
  hintCost: 10,
  hintAttempt: HINT_TRIGGER_ATTEMPT,
};
