const validHintSlots = (length, hints) => {
  const slots = new Map();
  for (const hint of hints) {
    if (Number.isInteger(hint.index) && hint.index >= 0 && hint.index < length) {
      slots.set(hint.index, String(hint.value).toUpperCase());
    }
  }
  return slots;
};

export function remainingInputLength(length, hints) {
  return length - validHintSlots(length, hints).size;
}

export function composeGuess(length, typedInput, hints) {
  const slots = validHintSlots(length, hints);
  const cells = Array(length).fill("");
  for (const [index, value] of slots) cells[index] = value;

  let nextIndex = 0;
  for (const letter of String(typedInput).toUpperCase()) {
    while (nextIndex < length && cells[nextIndex]) nextIndex += 1;
    if (nextIndex >= length) break;
    cells[nextIndex] = letter;
    nextIndex += 1;
  }
  return cells;
}
