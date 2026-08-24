export function rankEntries(records) {
  return [...records].sort((left, right) => {
    if (right.totalScore !== left.totalScore) {
      return right.totalScore - left.totalScore;
    }
    return new Date(left.achievedAt).getTime() - new Date(right.achievedAt).getTime();
  });
}

export function upsertScore(records, entry) {
  const normalized = entry.codename.trim().toLocaleLowerCase("en-US");
  const current = records.find(
    ({ codename }) => codename.trim().toLocaleLowerCase("en-US") === normalized,
  );

  if (current && current.totalScore >= entry.totalScore) {
    return rankEntries(records);
  }

  return rankEntries([
    ...records.filter(
      ({ codename }) => codename.trim().toLocaleLowerCase("en-US") !== normalized,
    ),
    { ...entry, codename: entry.codename.trim() },
  ]);
}
