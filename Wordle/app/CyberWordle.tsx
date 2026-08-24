"use client";

import { FormEvent, useEffect, useState } from "react";

import { createRound, dismissHint, purchaseHint, submitGuess } from "../lib/game-engine.mjs";
import { composeGuess, remainingInputLength } from "../lib/guess-composer.mjs";
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
  availableHints: number;
  status: "playing" | "won" | "lost";
  message: string;
};
type Entry = {
  codename: string;
  schoolScore: number;
  clubScore: number;
  totalScore: number;
  roundsCompleted: number;
  achievedAt: string;
};
type Screen = "welcome" | "play" | "round-result" | "codename" | "failed" | "leaderboard";

const STORAGE_KEY = "cyber-wordle-demo-leaderboard-v1";
const SAMPLE_ENTRIES: Entry[] = [
  { codename: "NullByte", schoolScore: 185, clubScore: 180, totalScore: 365, roundsCompleted: 2, achievedAt: "2026-08-24T08:00:00.000Z" },
  { codename: "PacketFox", schoolScore: 175, clubScore: 175, totalScore: 350, roundsCompleted: 2, achievedAt: "2026-08-24T08:15:00.000Z" },
  { codename: "BlueTeam", schoolScore: 190, clubScore: 0, totalScore: 190, roundsCompleted: 1, achievedAt: "2026-08-24T08:30:00.000Z" },
];

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
  const [roundIndex, setRoundIndex] = useState<0 | 1>(0);
  const [round, setRound] = useState<RoundState>(() => createRound(pickPuzzle("school")));
  const [guess, setGuess] = useState("");
  const [schoolScore, setSchoolScore] = useState(0);
  const [clubScore, setClubScore] = useState(0);
  const [codename, setCodename] = useState("");
  const [codenameError, setCodenameError] = useState("");
  const [leaderboard, setLeaderboard] = useState<Entry[]>(loadLeaderboard);
  const [hintDialogOpen, setHintDialogOpen] = useState(false);

  const roundMeta = roundIndex === 0
    ? { number: "01", title: "CAMPUS RECON", label: "SCHOOL PROTOCOL" }
    : { number: "02", title: "CYBER OPERATION", label: "CLUB PROTOCOL" };

  const startMission = () => {
    setRoundIndex(0);
    setRound(createRound(pickPuzzle("school")));
    setGuess("");
    setSchoolScore(0);
    setClubScore(0);
    setCodename("");
    setCodenameError("");
    setHintDialogOpen(false);
    setScreen("play");
  };

  const finishGuess = (next: RoundState) => {
    setRound(next);
    setGuess("");
    if (next.status === "playing" && next.availableHints > round.availableHints) {
      setHintDialogOpen(true);
    }
    if (next.status === "won") {
      if (roundIndex === 0) setSchoolScore(next.score);
      else setClubScore(next.score);
      setScreen("round-result");
    } else if (next.status === "lost") {
      if (roundIndex === 0) setScreen("failed");
      else {
        setClubScore(0);
        setScreen("round-result");
      }
    }
  };

  const sendGuess = () => {
    if (guess) {
      const completedGuess = composeGuess(round.puzzle.answer.length, guess, round.hints).join("");
      finishGuess(submitGuess(round, completedGuess));
    }
  };

  const pressKey = (key: string) => {
    if (screen !== "play" || round.status !== "playing" || hintDialogOpen) return;
    if (key === "ENTER") return sendGuess();
    if (key === "BACKSPACE") return setGuess((value) => value.slice(0, -1));
    if (/^[A-Z]$/.test(key) && guess.length < remainingInputLength(round.puzzle.answer.length, round.hints)) {
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

  const continueToClub = () => {
    setRoundIndex(1);
    setRound(createRound(pickPuzzle("club")));
    setGuess("");
    setHintDialogOpen(false);
    setScreen("play");
  };

  const acceptHint = () => {
    setRound(purchaseHint(round));
    setHintDialogOpen(false);
  };

  const skipHint = () => {
    setRound(dismissHint(round));
    setHintDialogOpen(false);
  };

  const saveScore = (event: FormEvent) => {
    event.preventDefault();
    const clean = codename.trim();
    if (!/^[A-Za-z0-9_-]{2,16}$/.test(clean)) {
      setCodenameError("Use 2–16 letters, numbers, _ or -.");
      return;
    }
    const completedClub = roundIndex === 1;
    const entry: Entry = {
      codename: clean,
      schoolScore,
      clubScore: completedClub ? clubScore : 0,
      totalScore: schoolScore + (completedClub ? clubScore : 0),
      roundsCompleted: completedClub ? 2 : 1,
      achievedAt: new Date().toISOString(),
    };
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
          <span><b>CYBER WORDLE</b><small>DECODE THE THREAT</small></span>
        </button>
        <div className="system-status"><span /> SYSTEM ONLINE</div>
      </header>

      {screen === "welcome" && (
        <section className="welcome-screen screen-enter">
          <div className="eyebrow"><span>CLUB DAY PROTOCOL</span><i>v1.0</i></div>
          <h1>THINK LIKE AN<br /><em>ANALYST.</em></h1>
          <p className="welcome-copy">Decode two English words. Protect your Security Score. Earn your place among the top agents.</p>
          <button className="primary-button" onClick={startMission}>BEGIN MISSION <span>→</span></button>
          <div className="mission-map">
            <article><span>01</span><div><b>CAMPUS RECON</b><small>School protocol</small></div></article>
            <div className="map-line" />
            <article><span>02</span><div><b>CYBER OPERATION</b><small>Club protocol</small></div></article>
          </div>
          <div className="rule-strip">
            <span><b>200</b> START SCORE</span><span><b>11</b> MAX GUESSES</span><span><b>−5</b> WRONG GUESS</span><span><b>−10</b> PAID HINT</span>
          </div>
        </section>
      )}

      {screen === "play" && (
        <section className="game-layout screen-enter">
          <aside className="mission-panel">
            <div className="round-tag">ROUND {roundMeta.number} / 02</div>
            <p className="protocol-label">{roundMeta.label}</p>
            <h2>{roundMeta.title}</h2>
            <div className="mission-brief">
              <span>▣ MISSION BRIEF</span>
              <p>{round.puzzle.missionBrief}</p>
              <p className="mission-brief-vi">{round.puzzle.missionBriefVi}</p>
            </div>
            <dl className="stat-grid">
              <div><dt>SECURITY SCORE</dt><dd>{round.score}<small>/200</small></dd></div>
              <div><dt>ATTEMPTS</dt><dd>{round.attempt}<small>/11</small></dd></div>
            </dl>
            <div className="score-meter"><i style={{ width: `${round.score / 2}%` }} /></div>
          </aside>

          <div className="board-panel">
            <div className="word-grid" style={{ "--word-length": round.puzzle.answer.length } as React.CSSProperties}>
              {Array.from({ length: 11 }, (_, rowIndex) => {
                const row = round.rows[rowIndex];
                const active = rowIndex === round.rows.length;
                const letters = row ? [...row.guess] : active ? composeGuess(round.puzzle.answer.length, guess, round.hints) : Array(round.puzzle.answer.length).fill("");
                return (
                  <div className={`word-row ${active ? "active" : ""}`} key={rowIndex}>
                    <span className="row-number">{String(rowIndex + 1).padStart(2, "0")}</span>
                    {letters.map((letter, index) => (
                      <div className={`letter-cell ${row?.evaluation[index] ?? ""} ${letter ? "filled" : ""} ${active && round.hints.some((hint) => hint.index === index) ? "hinted" : ""}`} key={index}>{letter.trim()}</div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {hintDialogOpen && (
        <div className="hint-dialog-backdrop" role="dialog" aria-modal="true" aria-labelledby="hint-dialog-title">
          <section className="hint-dialog">
            <div className="round-tag">MILESTONE INTEL</div>
            <p className="protocol-label">ATTEMPT {round.attempt} REACHED</p>
            <h2 id="hint-dialog-title">USE A HINT?</h2>
            <p>You can reveal one piece of information now. Using it will deduct 10 points from your Security Score.</p>
            <div className="hint-dialog-actions">
              <button className="primary-button" onClick={acceptHint}>USE HINT <span>−10</span></button>
              <button className="secondary-button" onClick={skipHint}>SKIP HINT</button>
            </div>
          </section>
        </div>
      )}

      {screen === "round-result" && (
        <section className="result-screen screen-enter">
          <div className={`access-badge ${round.status === "lost" ? "denied" : ""}`}>{round.status === "won" ? "ACCESS GRANTED" : "ACCESS DENIED"}</div>
          <p className="protocol-label">{roundMeta.title} COMPLETE</p>
          <h2>{round.puzzle.answer}</h2>
          <div className="intel-card"><span>SECURITY INTEL CARD</span><p>{round.puzzle.intel}</p></div>
          <div className="result-score"><small>SECURITY SCORE</small><b>{round.score}</b><span>POINTS</span></div>
          {roundIndex === 0 ? (
            <div className="result-actions">
              <button className="primary-button" onClick={continueToClub}>CONTINUE MISSION <span>→</span></button>
              <button className="secondary-button" onClick={() => setScreen("codename")}>BANK SCORE &amp; STOP</button>
            </div>
          ) : <button className="primary-button" onClick={() => setScreen("codename")}>REGISTER SCORE <span>→</span></button>}
        </section>
      )}

      {screen === "failed" && (
        <section className="result-screen screen-enter">
          <div className="access-badge denied">ACCESS DENIED</div>
          <p className="protocol-label">CAMPUS RECON FAILED</p>
          <h2>{round.puzzle.answer}</h2>
          <div className="intel-card"><span>MISSION REPORT</span><p>{round.puzzle.intel}</p></div>
          <p className="failure-note">Round one failures are not registered on the Agent Leaderboard.</p>
          <button className="primary-button" onClick={startMission}>NEW MISSION <span>↻</span></button>
        </section>
      )}

      {screen === "codename" && (
        <section className="codename-screen screen-enter">
          <div className="round-tag">IDENTITY PROTOCOL</div>
          <h2>CLAIM YOUR<br /><em>RANK.</em></h2>
          <p>Register a temporary Agent Codename. Only your best score will remain.</p>
          <form onSubmit={saveScore}>
            <label htmlFor="codename">AGENT CODENAME</label>
            <input id="codename" autoFocus maxLength={16} value={codename} onChange={(event) => setCodename(event.target.value)} placeholder="e.g. ZeroDay" />
            {codenameError && <small className="form-error">{codenameError}</small>}
            <div className="banked-score"><span>BANKED SECURITY SCORE</span><b>{schoolScore + clubScore}</b></div>
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
              <div className={`table-row ${index < 3 ? "podium" : ""}`} key={entry.codename.toLowerCase()}>
                <span>#{String(index + 1).padStart(2, "0")}</span><b>{entry.codename}</b><span>{entry.roundsCompleted}/2</span><strong>{entry.totalScore}</strong>
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
