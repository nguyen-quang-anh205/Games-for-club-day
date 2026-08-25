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

function isLineComplete(cells: CellState[], solution: number[]) {
  return solution.every((value, index) => (value === 1) === (cells[index] === 1));
}

function markCompletedLines(board: CellState[][], solution: number[][]) {
  const next = board.map((line) => [...line]);
  const size = solution.length;

  solution.forEach((line, row) => {
    if (!isLineComplete(next[row], line)) return;
    line.forEach((value, col) => {
      if (value === 0 && next[row][col] === 0) next[row][col] = 2;
    });
  });

  for (let col = 0; col < size; col += 1) {
    const column = next.map((line) => line[col]);
    const columnSolution = solution.map((line) => line[col]);
    if (!isLineComplete(column, columnSolution)) continue;
    columnSolution.forEach((value, row) => {
      if (value === 0 && next[row][col] === 0) next[row][col] = 2;
    });
  }

  return next;
}

function createBoard(puzzle: Puzzle) {
  return markCompletedLines(emptyBoard(puzzle.size), puzzle.grid);
}

function formatTime(total: number) {
  const minutes = Math.floor(total / 60).toString().padStart(2, "0");
  const seconds = (total % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function Home() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const puzzle = PUZZLES[difficulty];
  const [board, setBoard] = useState<CellState[][]>(() => createBoard(puzzle));
  const [tool, setTool] = useState<Tool>("fill");
  const [seconds, setSeconds] = useState(0);
  const [started, setStarted] = useState(false);
  const [won, setWon] = useState(false);
  const [revealPhase, setRevealPhase] = useState<RevealPhase>("idle");
  const [feedback, setFeedback] = useState("SYSTEM READY — Bắt đầu khôi phục dữ liệu!");
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [hoverCell, setHoverCell] = useState<{ row: number; col: number } | null>(null);
  const dragging = useRef(false);
  const dragTool = useRef<Tool>("fill");
  const dragState = useRef<CellState>(1);
  const lastDragCell = useRef<{ row: number; col: number } | null>(null);
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
  const completedRows = useMemo(
    () => puzzle.grid.map((line, row) => isLineComplete(board[row], line)),
    [board, puzzle],
  );
  const completedCols = useMemo(
    () => Array.from({ length: puzzle.size }, (_, col) => isLineComplete(
      board.map((line) => line[col]),
      puzzle.grid.map((line) => line[col]),
    )),
    [board, puzzle],
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (started && !won) setSeconds((value) => value + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [started, won]);

  useEffect(() => {
    const stopDragging = () => {
      dragging.current = false;
      lastDragCell.current = null;
    };
    window.addEventListener("pointerup", stopDragging);
    window.addEventListener("pointercancel", stopDragging);
    return () => {
      window.removeEventListener("pointerup", stopDragging);
      window.removeEventListener("pointercancel", stopDragging);
    };
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
    if (!finish || won || !started) return;
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
  }, [board, difficulty, puzzle, seconds, started, won]);

  function clearReveal() {
    revealTimers.current.forEach((timer) => window.clearTimeout(timer));
    revealTimers.current = [];
    setRevealPhase("idle");
  }

  function changeDifficulty(next: Difficulty) {
    clearReveal();
    setDifficulty(next);
    setBoard(createBoard(PUZZLES[next]));
    setSeconds(0);
    setStarted(false);
    setWon(false);
    setHoverCell(null);
    setFeedback("SYSTEM READY — Bắt đầu khôi phục dữ liệu!");
  }

  function resetBoard() {
    clearReveal();
    setBoard(createBoard(puzzle));
    setSeconds(0);
    setStarted(false);
    setWon(false);
    setHoverCell(null);
    setFeedback("SESSION RESET — Bàn chơi đã được làm mới.");
  }

  function targetState(current: CellState, activeTool = tool): CellState {
    const selected: CellState = activeTool === "fill" ? 1 : 2;
    return current === selected ? 0 : selected;
  }

  function setCell(row: number, col: number, activeTool = tool, value?: CellState) {
    if (won) return;
    setStarted(true);
    const target = value ?? targetState(board[row][col], activeTool);
    setBoard((current) => {
      const next = current.map((line) => [...line]);
      next[row][col] = target;
      return target === 1 ? markCompletedLines(next, puzzle.grid) : next;
    });
    if (target === 1) setFeedback("ĐÃ GHI NHẬN — Tiếp tục đối chiếu gợi ý hàng và cột.");
  }

  function beginDrag(row: number, col: number, activeTool = tool) {
    if (won) return;
    dragging.current = true;
    dragTool.current = activeTool;
    dragState.current = targetState(board[row][col], activeTool);
    lastDragCell.current = { row, col };
    setCell(row, col, activeTool, dragState.current);
  }

  function continueDrag(row: number, col: number) {
    if (!dragging.current) return;
    const previous = lastDragCell.current;
    if (!previous || (previous.row === row && previous.col === col)) return;

    let x = previous.col;
    let y = previous.row;
    const dx = Math.abs(col - x);
    const dy = Math.abs(row - y);
    const stepX = x < col ? 1 : -1;
    const stepY = y < row ? 1 : -1;
    let error = dx - dy;

    while (x !== col || y !== row) {
      const doubled = error * 2;
      if (doubled > -dy) { error -= dy; x += stepX; }
      if (doubled < dx) { error += dx; y += stepY; }
      setCell(y, x, dragTool.current, dragState.current);
    }
    lastDragCell.current = { row, col };
  }

  return (
    <main
      className="app-shell"
      onPointerUp={() => {
        dragging.current = false;
        lastDragCell.current = null;
      }}
      onPointerLeave={() => {
        dragging.current = false;
        lastDragCell.current = null;
      }}
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

      <section className="intro intro-compact" aria-label="Mô tả thử thách">
        <div className="intro-copy">
          <span className="copy-tag">INCIDENT BRIEF</span>
          <p>Một tập tin hình ảnh đã bị phân mảnh. Phân tích chỉ dấu và khôi phục từng data block để mở khóa ảnh nguồn.</p>
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
              <div className="corner-cell" aria-hidden="true" />
              <div className="column-clues">
                {colClues.map((clues, col) => (
                  <div className={`col-clue ${completedCols[col] ? "complete" : ""} ${hoverCell?.col === col ? "active" : ""}`} key={col}>
                    {clues.map((clue, i) => <span key={i}>{clue}</span>)}
                  </div>
                ))}
              </div>
              <div className="row-clues">
                {rowClues.map((clues, row) => (
                  <div className={`row-clue ${completedRows[row] ? "complete" : ""} ${hoverCell?.row === row ? "active" : ""}`} key={row}>
                    {clues.map((clue, i) => <span key={i}>{clue}</span>)}
                  </div>
                ))}
              </div>
              <div
                className="grid"
                style={{ gridTemplateColumns: `repeat(${puzzle.size}, var(--cell))` }}
                onPointerMove={(event) => {
                  if (!dragging.current) return;
                  const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLButtonElement>(".cell");
                  if (!target) return;
                  const row = Number(target.dataset.row);
                  const col = Number(target.dataset.col);
                  if (Number.isNaN(row) || Number.isNaN(col)) return;
                  setHoverCell({ row, col });
                  continueDrag(row, col);
                }}
                onPointerLeave={() => setHoverCell(null)}
              >
                {board.map((row, r) => row.map((cell, c) => (
                  <button
                    key={`${r}-${c}`}
                    data-row={r}
                    data-col={c}
                    className={`cell ${cell === 1 ? "filled" : ""} ${cell === 2 ? "crossed" : ""} ${hoverCell && (hoverCell.row === r || hoverCell.col === c) ? "axis-active" : ""} ${(c + 1) % 5 === 0 && c < puzzle.size - 1 ? "group-right" : ""} ${(r + 1) % 5 === 0 && r < puzzle.size - 1 ? "group-bottom" : ""}`}
                    aria-label={`Hàng ${r + 1}, cột ${c + 1}${cell === 1 ? ", đã tô" : cell === 2 ? ", đã đánh dấu X" : ""}`}
                    onPointerDown={(event) => {
                      if (event.button !== 0 && event.button !== 2) return;
                      event.preventDefault();
                      event.currentTarget.setPointerCapture(event.pointerId);
                      beginDrag(r, c, event.button === 2 ? "cross" : tool);
                    }}
                    onPointerEnter={() => {
                      setHoverCell({ row: r, col: c });
                    }}
                    onContextMenu={(event) => event.preventDefault()}
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
            <span className="panel-number" aria-hidden="true">01</span>
            <h2>Cách chơi</h2>
          </div>
          <div className="tutorial-body">
            <p className="tutorial-intro">Điền các ô theo số lượng cần thiết:</p>
            <div className="tutorial-actions">
              <p>
                <span className="tutorial-action-icon fill" aria-hidden="true"><i /></span>
                <span><b>Chuột trái</b>Để tô màu.</span>
              </p>
              <p>
                <span className="tutorial-action-icon cross" aria-hidden="true">×</span>
                <span><b>Chuột phải</b>Để đánh dấu X.</span>
              </p>
            </div>
            <div className="tutorial-clues">
              <p className="single"><code>[3]</code><span>Là điền 3 ô màu liên tiếp.</span></p>
              <p><code>[3 · 1]</code><span>Có ít nhất một ô X ngăn cách giữa 3 ô màu và 1 ô màu.</span></p>
            </div>
          </div>
          <dl className="game-stats">
            <div><dt>Access level</dt><dd>{puzzle.codename}</dd></div>
            <div><dt>Data blocks</dt><dd>{totalFilled}</dd></div>
            <div><dt>Best session</dt><dd>{bestTime === null ? "—" : formatTime(bestTime)}</dd></div>
          </dl>
        </aside>
      </section>

      <footer>
        <span>NONOGRAM CYBER LAB · CLUB DAY EDITION</span>
        <a href="https://web.facebook.com/profile.php?id=61593161492676" target="_blank" rel="noreferrer">A CHALLENGE BY USTH CYBERSECURITY ↗</a>
      </footer>

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
