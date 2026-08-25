"use client";

import { FormEvent, useEffect, useState } from "react";

import { createRound, submitGuess } from "../lib/game-engine.mjs";
import { remainingInputLength } from "../lib/guess-composer.mjs";
import {
  buildBoardRows,
  buildCampaignEntry,
  composeFlag,
  ROUND_CATEGORIES,
} from "../lib/campaign.mjs";
import { rankEntries, upsertScore } from "../lib/leaderboard.mjs";
import { pickPuzzle, type Puzzle } from "./puzzles";

type Evaluation = "correct" | "present" | "absent";
type Row = { guess: string; evaluation: Evaluation[] };
type Hint = { kind: "position"; value: string; index: number; text: string };
type RoundState = {
  puzzle: Puzzle;
  score: number;
  attempt: number;
  rows: Row[];
  hints: Hint[];
  status: "playing" | "won" | "lost";
  message: string;
};
type Entry = {
  codename: string;
  roundScores: number[];
  totalScore: number;
  roundsCompleted: number;
  achievedAt: string;
};
type RoundIndex = 0 | 1 | 2;
type Screen = "welcome" | "play" | "round-result" | "codename" | "failed" | "leaderboard";

const STORAGE_KEY = "cyber-wordle-demo-leaderboard-v2";
const SAMPLE_ENTRIES: Entry[] = [
  { codename: "NullByte", roundScores: [185, 180, 175], totalScore: 540, roundsCompleted: 3, achievedAt: "2026-08-24T08:00:00.000Z" },
  { codename: "PacketFox", roundScores: [175, 175, 180], totalScore: 530, roundsCompleted: 3, achievedAt: "2026-08-24T08:15:00.000Z" },
  { codename: "BlueTeam", roundScores: [190, 170, 165], totalScore: 525, roundsCompleted: 3, achievedAt: "2026-08-24T08:30:00.000Z" },
];

const ROUND_META = [
  { number: "01", title: "OPEN SIGNAL", label: "FREE THEME" },
  { number: "02", title: "SECOND VECTOR", label: "FREE THEME" },
  { number: "03", title: "USTH PROTOCOL", label: "UNIVERSITY THEME" },
] as const;

function loadLeaderboard(): Entry[] {
  if (typeof window === "undefined") return SAMPLE_ENTRIES;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : SAMPLE_ENTRIES;
  } catch {
    return SAMPLE_ENTRIES;
  }
}

export default function CyberWordle() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [roundIndex, setRoundIndex] = useState<RoundIndex>(0);
  const [round, setRound] = useState<RoundState>(() => createRound(pickPuzzle("general-one")));
  const [guess, setGuess] = useState("");
  const [roundScores, setRoundScores] = useState<number[]>([]);
  const [fragments, setFragments] = useState<string[]>([]);
  const [allowedWords, setAllowedWords] = useState<Set<string> | null>(null);
  const [codename, setCodename] = useState("");
  const [codenameError, setCodenameError] = useState("");
  const [leaderboard, setLeaderboard] = useState<Entry[]>(loadLeaderboard);

  const roundMeta = ROUND_META[roundIndex];
  const currentFlag = composeFlag(fragments);
  const boardRows = buildBoardRows(round, guess);

  useEffect(() => {
    let active = true;
    fetch("/wordlist.txt")
      .then((response) => {
        if (!response.ok) throw new Error("Wordlist unavailable");
        return response.text();
      })
      .then((text) => {
        if (active) {
          setAllowedWords(new Set(text.split(/\s+/).filter(Boolean).map((word) => word.toUpperCase())));
        }
      })
      .catch(() => {
        if (active) setAllowedWords(null);
      });
    return () => {
      active = false;
    };
  }, []);

  const startMission = () => {
    setRoundIndex(0);
    setRound(createRound(pickPuzzle("general-one")));
    setGuess("");
    setRoundScores([]);
    setFragments([]);
    setCodename("");
    setCodenameError("");
    setScreen("play");
  };

  const finishGuess = (next: RoundState) => {
    setRound(next);
    setGuess("");
    if (next.status === "won") {
      setRoundScores((scores) => [...scores.slice(0, roundIndex), next.score]);
      setFragments((values) => [...values.slice(0, roundIndex), next.puzzle.answer]);
      setScreen("round-result");
    } else if (next.status === "lost") {
      setScreen("failed");
    }
  };

  const sendGuess = () => {
    if (!guess) return;
    const completedGuess = buildBoardRows(round, guess)[round.rows.length]?.letters.join("") ?? "";
    const next = submitGuess(round, completedGuess, allowedWords ?? undefined);
    if (next.attempt === round.attempt && next.status === round.status) {
      setRound(next);
      return;
    }
    finishGuess(next);
  };

  const pressKey = (key: string) => {
    if (screen !== "play" || round.status !== "playing") return;
    if (key === "ENTER") return sendGuess();
    if (key === "BACKSPACE") return setGuess((value) => value.slice(0, -1));
    if (/^[A-Z]$/.test(key) && guess.length < remainingInputLength(5, round.hints)) {
      setGuess((value) => value + key);
    }
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") pressKey("ENTER");
      else if (event.key === "Backspace") pressKey("BACKSPACE");
      else if (/^[a-zA-Z]$/.test(event.key)) pressKey(event.key.toUpperCase());
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const continueCampaign = () => {
    const nextIndex = (roundIndex + 1) as RoundIndex;
    setRoundIndex(nextIndex);
    setRound(createRound(pickPuzzle(ROUND_CATEGORIES[nextIndex])));
    setGuess("");
    setScreen("play");
  };

  const retryRound = () => {
    setRound(createRound(round.puzzle));
    setGuess("");
    setScreen("play");
  };

  const saveScore = (event: FormEvent) => {
    event.preventDefault();
    const clean = codename.trim();
    if (!/^[A-Za-z0-9_-]{2,16}$/.test(clean)) {
      setCodenameError("Use 2–16 letters, numbers, _ or -.");
      return;
    }
    const entry = buildCampaignEntry(clean, roundScores, new Date().toISOString()) as Entry;
    const updated = upsertScore(leaderboard, entry);
    setLeaderboard(updated);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setScreen("leaderboard");
  };

  const resetDemoScores = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setLeaderboard(SAMPLE_ENTRIES);
  };

  return (
    <main className="app-shell">
      <div className="ambient-grid" aria-hidden="true" />
      <header className="topbar">
        <button className="brand" onClick={() => setScreen("welcome")} aria-label="Return to home">
          <span className="brand-mark">CW</span>
          <span><b>CYBER WORDLE</b><small>ASSEMBLE THE FLAG</small></span>
        </button>
        <div className="system-status"><span /> SYSTEM ONLINE</div>
      </header>

      {screen === "welcome" && (
        <section className="welcome-screen screen-enter">
          <div className="eyebrow"><span>CLUB DAY PROTOCOL</span><i>v1.2</i></div>
          <h1>THINK LIKE AN<br /><em>ANALYST.</em></h1>
          <p className="welcome-copy">Decode three five-letter English words. Each completed round reveals one fragment of the final UCS flag.</p>
          <button className="primary-button" onClick={startMission}>BEGIN MISSION <span>→</span></button>
          <div className="mission-map">
            {ROUND_META.map((meta, index) => (
              <div className="map-segment" key={meta.number}>
                {index > 0 && <div className="map-line" />}
                <article><span>{meta.number}</span><div><b>{meta.title}</b><small>{meta.label}</small></div></article>
              </div>
            ))}
          </div>
          <div className="rule-strip">
            <span><b>5</b> LETTERS</span><span><b>6</b> MAX GUESSES</span><span><b>3</b> AUTO HINT</span><span><b>3</b> FLAG FRAGMENTS</span>
          </div>
        </section>
      )}

      {screen === "play" && (
        <section className="game-layout screen-enter" aria-label={"Round " + (roundIndex + 1) + " of 3"}>
          <div className="board-panel">
            <div className="word-grid">
              {boardRows.map((boardRow, rowIndex) => (
                <div className={"word-row " + (boardRow.active ? "active" : "")} key={rowIndex}>
                  <span className="row-number">{String(rowIndex + 1).padStart(2, "0")}</span>
                  {boardRow.letters.map((letter: string, index: number) => (
                    <div
                      className={"letter-cell " + (boardRow.evaluation[index] ?? "") + " " + (letter ? "filled" : "") + " " + (boardRow.active && round.hints.some((hint) => hint.index === index) ? "hinted" : "")}
                      key={index}
                    >
                      {letter.trim()}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <p className={"board-message " + (round.message === "WORD NOT IN LIST" ? "warning" : "")}>{round.message}</p>
          </div>
        </section>
      )}

      {screen === "round-result" && (
        <section className="result-screen screen-enter">
          <div className="access-badge">FRAGMENT ACQUIRED</div>
          <p className="protocol-label">ROUND {roundMeta.number} / 03 COMPLETE</p>
          <h2>{round.puzzle.answer}</h2>
          <div className="intel-card"><span>ROUND INTEL</span><p>{round.puzzle.intel}</p></div>
          <div className="flag-card">
            <small>{roundIndex === 2 ? "FINAL FLAG" : "FLAG PROGRESS // " + (roundIndex + 1) + " OF 3"}</small>
            <code>{currentFlag}</code>
          </div>
          <div className="result-score"><small>ROUND SCORE</small><b>{round.score}</b><span>POINTS</span></div>
          {roundIndex < 2 ? (
            <button className="primary-button" onClick={continueCampaign}>CONTINUE TO ROUND {roundIndex + 2} <span>→</span></button>
          ) : (
            <button className="primary-button" onClick={() => setScreen("codename")}>REGISTER SCORE <span>→</span></button>
          )}
        </section>
      )}

      {screen === "failed" && (
        <section className="result-screen screen-enter">
          <div className="access-badge denied">ROUND FAILED</div>
          <p className="protocol-label">ROUND {roundMeta.number} / 03</p>
          <h2>{round.puzzle.answer}</h2>
          <div className="intel-card"><span>ROUND REPORT</span><p>{round.puzzle.intel}</p></div>
          <p className="failure-note">No flag fragment was awarded. Retry this round to continue the campaign.</p>
          <button className="primary-button" onClick={retryRound}>RETRY ROUND <span>↻</span></button>
        </section>
      )}

      {screen === "codename" && (
        <section className="codename-screen screen-enter">
          <div className="round-tag">IDENTITY PROTOCOL</div>
          <h2>CLAIM YOUR<br /><em>RANK.</em></h2>
          <div className="flag-card final"><small>CAPTURED FLAG</small><code>{currentFlag}</code></div>
          <p>Register a temporary Agent Codename. Only your best score will remain.</p>
          <form onSubmit={saveScore}>
            <label htmlFor="codename">AGENT CODENAME</label>
            <input id="codename" autoFocus maxLength={16} value={codename} onChange={(event) => setCodename(event.target.value)} placeholder="e.g. ZeroDay" />
            {codenameError && <small className="form-error">{codenameError}</small>}
            <div className="banked-score"><span>BANKED SECURITY SCORE</span><b>{roundScores.reduce((total, score) => total + score, 0)}</b></div>
            <button className="primary-button" type="submit">JOIN LEADERBOARD <span>→</span></button>
          </form>
        </section>
      )}

      {screen === "leaderboard" && (
        <section className="leaderboard-screen screen-enter">
          <div className="leaderboard-header">
            <div><p className="protocol-label">CLUB DAY // LIVE RANKING</p><h2>AGENT LEADERBOARD</h2></div>
            <span>TOP {Math.min(10, leaderboard.length)} AGENTS</span>
          </div>
          <div className="leaderboard-table">
            <div className="table-row table-head"><span>RANK</span><span>AGENT</span><span>ROUNDS</span><span>SECURITY SCORE</span></div>
            {rankEntries(leaderboard).slice(0, 10).map((entry: Entry, index: number) => (
              <div className={"table-row " + (index < 3 ? "podium" : "")} key={entry.codename.toLowerCase()}>
                <span>#{String(index + 1).padStart(2, "0")}</span><b>{entry.codename}</b><span>{entry.roundsCompleted}/3</span><strong>{entry.totalScore}</strong>
              </div>
            ))}
          </div>
          <div className="leaderboard-actions">
            <button className="primary-button" onClick={startMission}>NEXT AGENT <span>→</span></button>
            <button className="text-button" onClick={resetDemoScores}>RESET DEMO SCORES</button>
          </div>
        </section>
      )}

      <footer><span>CYBER SECURITY CLUB</span><small>AUTHORIZED TRAINING ENVIRONMENT</small></footer>
    </main>
  );
}
