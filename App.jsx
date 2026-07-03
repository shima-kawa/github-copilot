import React, { useMemo, useState } from "react";

const SIZE = 8;
const EMPTY = 0;
const BLACK = 1;
const WHITE = 2;

const DIRS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1],
];

function createInitialBoard() {
  const b = Array.from({ length: SIZE }, () => Array(SIZE).fill(EMPTY));
  b[3][3] = WHITE;
  b[3][4] = BLACK;
  b[4][3] = BLACK;
  b[4][4] = WHITE;
  return b;
}

function inBounds(r, c) {
  return r >= 0 && r < SIZE && c >= 0 && c < SIZE;
}

function opponent(p) {
  return p === BLACK ? WHITE : BLACK;
}

function getFlips(board, r, c, player) {
  if (!inBounds(r, c) || board[r][c] !== EMPTY) return [];
  const opp = opponent(player);
  const flips = [];

  for (const [dr, dc] of DIRS) {
    let rr = r + dr;
    let cc = c + dc;
    const line = [];

    while (inBounds(rr, cc) && board[rr][cc] === opp) {
      line.push([rr, cc]);
      rr += dr;
      cc += dc;
    }

    if (line.length > 0 && inBounds(rr, cc) && board[rr][cc] === player) {
      flips.push(...line);
    }
  }

  return flips;
}

function hasAnyMove(board, player) {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (getFlips(board, r, c, player).length > 0) return true;
    }
  }
  return false;
}

function countStones(board) {
  let black = 0, white = 0;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === BLACK) black++;
      if (board[r][c] === WHITE) white++;
    }
  }
  return { black, white };
}

export default function App() {
  const [board, setBoard] = useState(createInitialBoard);
  const [turn, setTurn] = useState(BLACK);
  const [message, setMessage] = useState("");

  const validMap = useMemo(() => {
    const m = Array.from({ length: SIZE }, () => Array(SIZE).fill(false));
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        m[r][c] = getFlips(board, r, c, turn).length > 0;
      }
    }
    return m;
  }, [board, turn]);

  const { black, white } = useMemo(() => countStones(board), [board]);

  const isGameOver = useMemo(() => {
    return !hasAnyMove(board, BLACK) && !hasAnyMove(board, WHITE);
  }, [board]);

  function place(r, c) {
    if (isGameOver) return;
    const flips = getFlips(board, r, c, turn);
    if (flips.length === 0) return;

    const next = board.map(row => [...row]);
    next[r][c] = turn;
    flips.forEach(([fr, fc]) => {
      next[fr][fc] = turn;
    });

    const nextTurn = opponent(turn);
    const nextHasMove = hasAnyMove(next, nextTurn);
    const currentHasMove = hasAnyMove(next, turn);

    setBoard(next);

    if (nextHasMove) {
      setTurn(nextTurn);
      setMessage("");
    } else if (currentHasMove) {
      setTurn(turn);
      setMessage(`${nextTurn === BLACK ? "黒" : "白"}は置けないのでパス`);
    } else {
      setMessage("両者置けないためゲーム終了");
    }
  }

  function reset() {
    setBoard(createInitialBoard());
    setTurn(BLACK);
    setMessage("");
  }

  const winnerText = useMemo(() => {
    if (!isGameOver) return "";
    if (black > white) return "黒の勝ち！";
    if (white > black) return "白の勝ち！";
    return "引き分け！";
  }, [isGameOver, black, white]);

  return (
    <div style={styles.container}>
      <h1>オセロ（React）</h1>

      <div style={styles.info}>
        <div>手番: {turn === BLACK ? "黒" : "白"}</div>
        <div>黒: {black} / 白: {white}</div>
        {message && <div>{message}</div>}
        {isGameOver && <div style={{ fontWeight: "bold" }}>{winnerText}</div>}
      </div>

      <div style={styles.board}>
        {board.map((row, r) =>
          row.map((cell, c) => {
            const isValid = validMap[r][c];
            return (
              <button
                key={`${r}-${c}`}
                onClick={() => place(r, c)}
                style={{
                  ...styles.cell,
                  ...(isValid ? styles.validCell : {}),
                }}
              >
                {cell === BLACK && <div style={styles.black} />}
                {cell === WHITE && <div style={styles.white} />}
              </button>
            );
          })
        )}
      </div>

      <button onClick={reset} style={styles.resetBtn}>リセット</button>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "sans-serif",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
  },
  info: {
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  board: {
    display: "grid",
    gridTemplateColumns: `repeat(${SIZE}, 44px)`,
    gridTemplateRows: `repeat(${SIZE}, 44px)`,
    border: "2px solid #1f4d1f",
  },
  cell: {
    width: 44,
    height: 44,
    background: "#2e8b57",
    border: "1px solid #1f4d1f",
    cursor: "pointer",
    padding: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  validCell: {
    boxShadow: "inset 0 0 0 2px rgba(255,255,0,0.35)",
  },
  black: {
    width: 30,
    height: 30,
    borderRadius: "50%",
    background: "#111",
  },
  white: {
    width: 30,
    height: 30,
    borderRadius: "50%",
    background: "#f4f4f4",
    border: "1px solid #ccc",
  },
  resetBtn: {
    padding: "8px 14px",
    cursor: "pointer",
  },
};