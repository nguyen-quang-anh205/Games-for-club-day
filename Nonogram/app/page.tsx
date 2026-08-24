"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type CellState = 0 | 1 | 2;
type Tool = "fill" | "cross";
type Difficulty = "easy" | "medium" | "hard";
type RevealPhase = "idle" | "pixels" | "mono" | "color" | "result";
type Puzzle = {
  label: string;
  codename: string;
  size: number;
  time: string;
  image: string;
  revealTitle: string;
  revealCaption: string;
  grid: number[][];
};

const PUZZLES: Record<Difficulty, Puzzle> = {
  easy: {
    label: "Dễ", codename: "RECON", size: 8, time: "~ 3 phút",
    image: "/usth-cybersecurity.webp",
    revealTitle: "UCS Guardian",
    revealCaption: "Biểu trưng của USTH Cybersecurity — đại diện cho tinh thần khám phá, phòng thủ và sáng tạo trong không gian số.",
    grid: [
      [0,0,0,1,1,0,0,0],
      [0,0,1,1,1,1,0,0],
      [0,0,1,1,1,1,0,0],
      [0,1,1,1,1,1,0,0],
      [1,1,1,0,0,1,1,1],
      [0,1,1,1,1,1,1,0],
      [0,1,1,1,1,1,0,0],
      [0,0,0,1,1,0,0,0],
    ],
  },
  medium: {
    label: "Trung bình", codename: "ANALYST", size: 12, time: "~ 7 phút",
    image: "/usth-cybersecurity.webp",
    revealTitle: "UCS Guardian",
    revealCaption: "Biểu trưng của USTH Cybersecurity — đại diện cho tinh thần khám phá, phòng thủ và sáng tạo trong không gian số.",
    grid: [
      [0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,1,1,1,1,0,0,0,0],
      [0,0,0,0,1,1,0,1,0,0,0,0],
      [0,0,0,0,1,1,1,1,1,0,0,0],
      [0,0,0,1,1,1,0,1,1,0,0,0],
      [0,0,1,1,1,1,1,1,1,1,0,0],
      [0,1,1,1,0,0,0,0,1,1,1,0],
      [0,1,1,1,1,1,1,1,1,1,1,0],
      [0,1,1,0,1,1,1,1,1,1,0,0],
      [0,1,1,1,1,1,1,1,1,1,0,0],
      [0,0,0,1,1,1,1,1,1,0,0,0],
      [0,0,0,0,0,1,0,0,0,0,0,0],
    ],
  },
  hard: {
    label: "Khó", codename: "ROOT", size: 20, time: "~ 15 phút",
    image: "/usth-cybersecurity.webp",
    revealTitle: "UCS Guardian",
    revealCaption: "Biểu trưng của USTH Cybersecurity — đại diện cho tinh thần khám phá, phòng thủ và sáng tạo trong không gian số.",
    grid: [
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,1,1,1,1,0,1,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0],
      [0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
      [0,0,0,0,0,1,1,1,0,1,1,0,1,1,1,0,0,0,0,0],
      [0,0,0,0,1,1,1,0,1,0,0,1,0,1,1,1,0,0,0,0],
      [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
      [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
      [0,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,0],
      [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
      [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
      [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
      [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
      [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
      [0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
      [0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0],
    ],
  },
};

const DIFFICULTIES = Object.keys(PUZZLES) as Difficulty[];
const MAX_LIVES = 3;

function getClues(line: number[]) {
  const clues: number[] = [];
  let run = 0;
  line.forEach((cell) => {
    if (cell) run += 1;
    else if (run) { clues.push(run); run = 0; }
  });
  if (run) clues.push(run);
  return clues.length ? clues : [0];
}

function emptyBoard(size: number): CellState[][] {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => 0 as CellState),
  );
}

function formatTime(total: number) {
  const minutes = Math.floor(total / 60).toString().padStart(2, "0");
  const seconds = (total % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function Home() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const puzzle = PUZZLES[difficulty];
  const [board, setBoard] = useState<CellState[][]>(() => emptyBoard(puzzle.size));
  const [tool, setTool] = useState<Tool>("fill");
  const [seconds, setSeconds] = useState(0);
  const [started, setStarted] = useState(false);
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);
  const [revealPhase, setRevealPhase] = useState<RevealPhase>("idle");
  const [lives, setLives] = useState(MAX_LIVES);
  const [mistakeCell, setMistakeCell] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("SYSTEM READY — 3 Integrity. Bắt đầu khôi phục dữ liệu!");
  const [bestTime, setBestTime] = useState<number | null>(null);
  const dragging = useRef(false);
  const dragState = useRef<CellState>(1);
  const livesRef = useRef(MAX_LIVES);
  const mistakeLock = useRef(false);
  const revealTimers = useRef<number[]>([]);

  const rowClues = useMemo(() => puzzle.grid.map(getClues), [puzzle]);
  const colClues = useMemo(
    () => Array.from({ length: puzzle.size }, (_, col) =>
      getClues(puzzle.grid.map((row) => row[col])),
    ),
    [puzzle],
  );
  const totalFilled = useMemo(() => puzzle.grid.flat().filter(Boolean).length, [puzzle]);
  const correctFilled = useMemo(
    () => board.reduce(
      (sum, row, r) => sum + row.filter((cell, c) => cell === 1 && puzzle.grid[r][c] === 1).length,
      0,
    ),
    [board, puzzle],
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (started && !won && !lost) setSeconds((value) => value + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [lost, started, won]);

  useEffect(() => {
    const stopDragging = () => { dragging.current = false; };
    window.addEventListener("pointerup", stopDragging);
    return () => window.removeEventListener("pointerup", stopDragging);
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, []);

  useEffect(() => () => {
    revealTimers.current.forEach((timer) => window.clearTimeout(timer));
  }, []);

  useEffect(() => {
    const savedBest = window.localStorage.getItem(`nonogram-best-${difficulty}-${puzzle.size}`);
    setBestTime(savedBest ? Number(savedBest) : null);
  }, [difficulty, puzzle.size]);

  useEffect(() => {
    const finish = puzzle.grid.every((row, r) =>
      row.every((solution, c) => (solution === 1) === (board[r][c] === 1)),
    );
    if (!finish || won || lost || !started) return;
    setWon(true);
    setRevealPhase("pixels");
    setFeedback("MATRIX COMPLETE — Đang đối chiếu lưới với ảnh nguồn...");
    revealTimers.current = [
      window.setTimeout(() => {
        setRevealPhase("mono");
        setFeedback("RECONSTRUCTING — Đang nội suy ảnh đen trắng...");
      }, 850),
      window.setTimeout(() => {
        setRevealPhase("color");
        setFeedback("COLOR DATA RESTORED — Kênh màu đã được phục hồi.");
      }, 1900),
      window.setTimeout(() => {
        setRevealPhase("result");
        setFeedback("FILE RECOVERED — Dữ liệu hình ảnh đã được khôi phục.");
      }, 3250),
    ];
    const bestKey = `nonogram-best-${difficulty}-${puzzle.size}`;
    const savedBest = window.localStorage.getItem(bestKey);
    if (!savedBest || seconds < Number(savedBest)) {
      window.localStorage.setItem(bestKey, String(seconds));
      setBestTime(seconds);
    }
  }, [board, difficulty, lost, puzzle, seconds, started, won]);

  function clearReveal() {
    revealTimers.current.forEach((timer) => window.clearTimeout(timer));
    revealTimers.current = [];
    setRevealPhase("idle");
  }

  function changeDifficulty(next: Difficulty) {
    clearReveal();
    setDifficulty(next);
    setBoard(emptyBoard(PUZZLES[next].size));
    setSeconds(0);
    setStarted(false);
    setWon(false);
    setLost(false);
    setLives(MAX_LIVES);
    livesRef.current = MAX_LIVES;
    setMistakeCell(null);
    mistakeLock.current = false;
    setFeedback("SYSTEM READY — 3 Integrity. Bắt đầu khôi phục dữ liệu!");
  }

  function resetBoard() {
    clearReveal();
    setBoard(emptyBoard(puzzle.size));
    setSeconds(0);
    setStarted(false);
    setWon(false);
    setLost(false);
    setLives(MAX_LIVES);
    livesRef.current = MAX_LIVES;
    setMistakeCell(null);
    mistakeLock.current = false;
    setFeedback("SESSION RESET — System Integrity đã được nạp lại.");
  }

  function targetState(current: CellState, activeTool = tool): CellState {
    const selected: CellState = activeTool === "fill" ? 1 : 2;
    return current === selected ? 0 : selected;
  }

  function loseLife(row: number, col: number) {
    if (mistakeLock.current) return;
    mistakeLock.current = true;
    dragging.current = false;
    const nextLives = Math.max(0, livesRef.current - 1);
    livesRef.current = nextLives;
    setLives(nextLives);
    setMistakeCell(`${row}-${col}`);
    setFeedback(nextLives > 0
      ? `INTEGRITY ALERT — Data block sai. Còn ${nextLives} mạng.`
      : "SYSTEM COMPROMISED — System Integrity đã về 0!"
    );
    if (nextLives === 0) setLost(true);
    window.setTimeout(() => {
      setMistakeCell(null);
      mistakeLock.current = false;
    }, 520);
  }

  function setCell(row: number, col: number, activeTool = tool, value?: CellState) {
    if (won || lost) return;
    setStarted(true);
    const target = value ?? targetState(board[row][col], activeTool);
    if (target === 1 && puzzle.grid[row][col] === 0) {
      loseLife(row, col);
      return;
    }
    setBoard((current) => {
      const next = current.map((line) => [...line]);
      next[row][col] = target;
      return next;
    });
    if (target === 1) setFeedback("DATA BLOCK VALID — Tiếp tục khôi phục tập tin.");
  }

  function beginDrag(row: number, col: number) {
    if (won || lost) return;
    dragging.current = true;
    dragState.current = targetState(board[row][col]);
    setCell(row, col, tool, dragState.current);
  }

  return (
    <main
      className="app-shell"
      onPointerUp={() => (dragging.current = false)}
      onPointerLeave={() => (dragging.current = false)}
    >
      <header className="site-header">
        <a className="brand" href="#game" aria-label="USTH Cybersecurity Nonogram - về bàn chơi">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /><i /></span>
          <span>NONOGRAM <b>CYBER LAB</b></span>
        </a>
        <div className="header-right">
          <a className="club-chip" href="https://web.facebook.com/profile.php?id=61593161492676" target="_blank" rel="noreferrer">
            <img src="/usth-cybersecurity.webp" alt="" />
            <span><small>POWERED BY</small>USTH Cybersecurity</span>
          </a>
          <div className="header-note"><span className="status-dot" /> CYBER LAB ONLINE</div>
        </div>
      </header>

      <section className="intro" aria-labelledby="page-title">
        <div>
          <p className="eyebrow">USTH CYBERSECURITY · DIGITAL FORENSICS LAB</p>
          <h1 id="page-title">Khôi phục bức tranh<br /><em>đang bị khóa.</em></h1>
        </div>
        <div className="intro-copy">
          <span className="copy-tag">INCIDENT BRIEF</span>
          <p>Một tập tin hình ảnh đã bị phân mảnh. Phân tích chỉ dấu, bảo toàn System Integrity và khôi phục từng data block.</p>
        </div>
      </section>

      <section className="game-layout" id="game">
        <div className="game-card">
          <div className="game-topbar">
            <div className="difficulty-tabs" aria-label="Chọn độ khó">
              {DIFFICULTIES.map((key) => (
                <button key={key} className={difficulty === key ? "active" : ""} onClick={() => changeDifficulty(key)}>
                  {PUZZLES[key].label}
                </button>
              ))}
            </div>
            <div className="mission-meters">
              <div className={`life-meter ${mistakeCell ? "hit" : ""}`} aria-label={`Còn ${lives} mạng`}>
                <small>SYSTEM INTEGRITY</small>
                <div aria-hidden="true">
                  {Array.from({ length: MAX_LIVES }, (_, index) => (
                    <span key={index} className={index < lives ? "alive" : "lost"}>♥</span>
                  ))}
                </div>
              </div>
              <div className="timer" aria-label={`Thời gian ${formatTime(seconds)}`}>
                <span aria-hidden="true">◷</span>
                <strong>{formatTime(seconds)}</strong>
              </div>
            </div>
          </div>

          <div className="board-scroll">
            <span className="board-sticker sticker-a" aria-hidden="true">DIGITAL<br />FORENSICS</span>
            <span className="board-sticker sticker-b" aria-hidden="true">CASE 0x{puzzle.size}</span>
            <div className={`nonogram size-${puzzle.size}`} style={{ "--size": puzzle.size } as React.CSSProperties}>
              <div className="corner-cell"><span>{puzzle.size}×{puzzle.size}</span></div>
              <div className="column-clues">
                {colClues.map((clues, col) => (
                  <div className="col-clue" key={col}>{clues.map((clue, i) => <span key={i}>{clue}</span>)}</div>
                ))}
              </div>
              <div className="row-clues">
                {rowClues.map((clues, row) => (
                  <div className="row-clue" key={row}>{clues.map((clue, i) => <span key={i}>{clue}</span>)}</div>
                ))}
              </div>
              <div className="grid" style={{ gridTemplateColumns: `repeat(${puzzle.size}, var(--cell))` }}>
                {board.map((row, r) => row.map((cell, c) => (
                  <button
                    key={`${r}-${c}`}
                    className={`cell ${cell === 1 ? "filled" : ""} ${cell === 2 ? "crossed" : ""} ${mistakeCell === `${r}-${c}` ? "mistake" : ""} ${(c + 1) % 5 === 0 && c < puzzle.size - 1 ? "group-right" : ""} ${(r + 1) % 5 === 0 && r < puzzle.size - 1 ? "group-bottom" : ""}`}
                    aria-label={`Hàng ${r + 1}, cột ${c + 1}${cell === 1 ? ", đã tô" : cell === 2 ? ", đã đánh dấu X" : ""}`}
                    onPointerDown={(event) => {
                      if (event.button !== 0) return;
                      event.preventDefault();
                      beginDrag(r, c);
                    }}
                    onPointerEnter={() => { if (dragging.current) setCell(r, c, tool, dragState.current); }}
                    onContextMenu={(event) => { event.preventDefault(); setCell(r, c, "cross"); }}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter" && event.key !== " ") return;
                      event.preventDefault();
                      setCell(r, c);
                    }}
                  >
                    {cell === 2 && <span aria-hidden="true">×</span>}
                  </button>
                )))}
              </div>
            </div>
          </div>

          <div className="game-toolbar">
            <div className="tool-switch" aria-label="Công cụ">
              <button className={tool === "fill" ? "selected" : ""} onClick={() => setTool("fill")}><span className="fill-icon" /> Data block</button>
              <button className={tool === "cross" ? "selected" : ""} onClick={() => setTool("cross")}><span className="cross-icon">×</span> Mark safe</button>
            </div>
            <div className="action-buttons">
              <button className="button-secondary" onClick={resetBoard}>↻ Chơi lại</button>
            </div>
          </div>

          <div className="progress-row">
            <div className="progress-track"><span style={{ width: `${Math.min(100, (correctFilled / totalFilled) * 100)}%` }} /></div>
            <p aria-live="polite">{feedback}</p>
            <strong>{correctFilled}/{totalFilled} PIXEL</strong>
          </div>
        </div>

        <aside className="side-panel">
          <div className="panel-heading">
            <span className="panel-number">01</span>
            <div><p>INCIDENT BRIEF</p><h2>Khôi phục tập tin</h2></div>
          </div>
          <p>Lưới đang chơi là bản nhị phân hóa của chính file ảnh nguồn. Hoàn thành ma trận để phục hồi ảnh từ đen trắng sang màu.</p>
          <div className="rule-stack">
            <div className="rule-card danger">
              <span className="rule-symbol">■</span>
              <p><b>Invalid data block</b>System Integrity −1</p>
            </div>
            <div className="rule-card safe">
              <span className="rule-symbol">×</span>
              <p><b>Mark safe bằng X</b>Không giảm Integrity</p>
            </div>
          </div>
          <div className="clue-guide" aria-label="Cách đọc gợi ý Nonogram">
            <div className="clue-note single-clue">
              <span>1</span>
              <p><b>Một ô duy nhất</b>Mỗi số 1 là một nhóm có đúng 1 ô tô đen. Nếu có nhiều số 1, các nhóm phải cách nhau ít nhất 1 ô.</p>
            </div>
            <div className="clue-note">
              <span>3 · 1</span>
              <p><b>Nhiều nhóm</b>3 ô liền nhau, cách ra ít nhất 1 ô, rồi thêm 1 ô.</p>
            </div>
          </div>
          <dl className="game-stats">
            <div><dt>Access level</dt><dd>{puzzle.codename}</dd></div>
            <div><dt>System Integrity</dt><dd>{lives}/{MAX_LIVES}</dd></div>
            <div><dt>Data blocks</dt><dd>{totalFilled}</dd></div>
            <div><dt>Best session</dt><dd>{bestTime === null ? "—" : formatTime(bestTime)}</dd></div>
          </dl>
        </aside>
      </section>

      <footer>
        <span>NONOGRAM CYBER LAB · CLUB DAY EDITION</span>
        <a href="https://web.facebook.com/profile.php?id=61593161492676" target="_blank" rel="noreferrer">A CHALLENGE BY USTH CYBERSECURITY ↗</a>
      </footer>

      {lost && (
        <div className="victory-backdrop" role="dialog" aria-modal="true" aria-labelledby="result-title">
          <div className="victory-card defeat">
            <div className="victory-art" aria-hidden="true">×</div>
            <p className="eyebrow">SYSTEM COMPROMISED</p>
            <h2 id="result-title">Bạn quá gà</h2>
            <button className="button-primary" onClick={resetBoard}>Chơi lại <span>↻</span></button>
          </div>
        </div>
      )}

      {won && (
        <div className="victory-backdrop reveal-backdrop" role="dialog" aria-modal="true" aria-labelledby="reveal-title">
          <div className={`reveal-card phase-${revealPhase}`}>
            <div className="reveal-visual">
              <div className="reveal-frame">
                <img src={puzzle.image} alt={puzzle.revealTitle} />
                <span
                  className="solution-pixels"
                  style={{ "--mask-size": puzzle.size } as React.CSSProperties}
                  aria-hidden="true"
                >
                  {puzzle.grid.flatMap((row, rowIndex) =>
                    row.map((value, colIndex) => (
                      <i key={`${rowIndex}-${colIndex}`} className={value ? "active" : ""} />
                    )),
                  )}
                </span>
                <span className="reveal-noise" aria-hidden="true" />
                <span className="scan-beam" aria-hidden="true" />
              </div>
              <div className="reveal-status" aria-live="polite">
                <span className="status-bars" aria-hidden="true"><i /><i /><i /></span>
                <strong>
                  {revealPhase === "pixels" && "MATRIX COMPLETE · BINARY SOURCE"}
                  {revealPhase === "mono" && "RECONSTRUCTING IMAGE..."}
                  {revealPhase === "color" && "COLOR DATA RESTORED"}
                  {revealPhase === "result" && "FILE RECOVERED · 100%"}
                </strong>
              </div>
            </div>

            <div className="reveal-details">
              <p className="eyebrow">DIGITAL EVIDENCE RECOVERED</p>
              <h2 id="reveal-title">{puzzle.revealTitle}</h2>
              <p className="reveal-caption">{puzzle.revealCaption}</p>
              <dl className="result-stats">
                <div><dt>Session time</dt><dd>{formatTime(seconds)}</dd></div>
                <div><dt>Integrity</dt><dd>{lives}/{MAX_LIVES}</dd></div>
                <div><dt>Access level</dt><dd>{puzzle.codename}</dd></div>
              </dl>
              <code className="ctf-flag">USTHCS&#123;pixel_grid_recovered&#125;</code>
              <button className="button-primary" onClick={resetBoard}>Chơi lại <span>↻</span></button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
