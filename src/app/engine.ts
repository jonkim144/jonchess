import { IMover } from './mover';
import { Board } from './board';
import { MoveGenerator } from './move_generator';
import { CheckChecker } from './check_checker';

const PIECE_VALUE = {
  K: 0,
  k: 0,
  P: 1,
  p: -1,
  N: 3,
  n: -3,
  B: 3,
  b: -3,
  R: 5,
  r: -5,
  Q: 9,
  q: -9,
  _: 0,
};

const shuffle = (a) => {
  for (let i = a.length - 1; i > 0; --i) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i];
    a[i] = a[j];
    a[j] = t;
  }
  return a;
};

export enum GameState {
  WhiteWins,
  BlackWins,
  DrawByRepetition,
  Stalemate,
  WhiteToMove,
  BlackToMove,
}

export class Engine {
  private board: Board;
  private history: IMover[] = [];
  private redoStack: IMover[] = [];
  private moveGenerator: MoveGenerator = new MoveGenerator();
  private depth: number = 5;
  private positionCounts = new Map<bigint, number>();
  private transpositions: Map<bigint, Map<number, number>>;

  constructor(board: Board) {
    this.board = board;
  }

  undo() {
    if (!this.history.length) return;

    const toUndo = this.history.pop();
    const old = this.positionCounts.get(this.board.hash);
    this.positionCounts.set(this.board.hash, old - 1);
    toUndo.undo(this.board);
    this.redoStack.push(toUndo);
  }

  redo() {
    if (!this.redoStack.length) return;

    this.makeMove(this.redoStack.pop());
  }

  clearHistory(): void {
    this.positionCounts.clear();
    this.positionCounts.set(this.board.hash, 1);
    this.history.length = 0;
    this.redoStack.length = 0;
  }

  get lastMove(): IMover {
    return this.history[this.history.length - 1];
  }

  get gameState(): GameState {
    if (this.positionCounts.get(this.board.hash) >= 3) return GameState.DrawByRepetition;
    if (this.moveGenerator.generate(this.board).length) {
      return this.board.isWhiteToMove ? GameState.WhiteToMove : GameState.BlackToMove;
    }
    if (CheckChecker.isInCheck(this.board, this.board.isWhiteToMove)) {
      return this.board.isWhiteToMove ? GameState.BlackWins : GameState.WhiteWins;
    }
    return GameState.Stalemate;
  }

  getLegalMoves(from: number): IMover[] {
    return this.moveGenerator.generate(this.board, from);
  }

  tryMakeMove(from: number, to: number): boolean {
    const moves = this.moveGenerator.generate(this.board, from, to);
    if (!moves.length) return false;

    this.makeMove(moves[0]);
    this.redoStack.length = 0;
    return true;
  }

  private makeMove(mover: IMover): void {
    mover.move(this.board);
    this.history.push(mover);
    if (!this.positionCounts.has(this.board.hash)) this.positionCounts.set(this.board.hash, 0);
    const old = this.positionCounts.get(this.board.hash);
    this.positionCounts.set(this.board.hash, old + 1);
  }

  private get pieceCount(): number {
    let count = 0;
    for (let i = 0; i < 64; ++i) {
      if (this.board.at(i) !== '_') ++count;
    }
    return count;
  }

  getBestMove(): Promise<IMover | undefined> {
    if (this.positionCounts.get(this.board.hash) >= 3) return Promise.resolve(undefined);

    if (this.pieceCount < 8) this.depth = 7;
    else if (this.pieceCount < 16) this.depth = 6;

    return new Promise((resolve) => {
      setTimeout(() => {
        const moves = shuffle(this.moveGenerator.generate(this.board));
        moves.sort((a, b) => Math.abs(PIECE_VALUE[this.board.at(b.to)]) - Math.abs(PIECE_VALUE[this.board.at(a.to)]));
        let [bestMove] = moves;
        let bestScore = -Infinity;
        let alpha = -Infinity;
        let beta = Infinity;
        this.transpositions = new Map<bigint, Map<number, number>>();
        for (let i = 0; i < moves.length; ++i) {
          const move = moves[i];
          move.move(this.board);
          const score = -this.findBestMove(this.depth, -beta, -alpha);
          move.undo(this.board);
          if (score > bestScore) {
            bestScore = score;
            bestMove = move;
          }
          if (score > alpha) {
            alpha = score;
            if (alpha >= beta) break;
          }
        }
        resolve(bestMove);
      }, 50);
    });
  }

  private findBestMove(depth: number, alpha: number, beta: number): number {
    if (depth === 0) {
      return (this.board.isWhiteToMove ? 1 : -1) * this.evaluate();
    }

    if (this.transpositions.has(this.board.hash)) {
      const t = this.transpositions.get(this.board.hash);
      if (t.has(depth)) return t.get(depth);
    }

    const moves = this.moveGenerator.generate(this.board);
    if (moves.length === 0 && !CheckChecker.isInCheck(this.board, this.board.isWhiteToMove)) return 0;

    moves.sort((a, b) => Math.abs(PIECE_VALUE[this.board.at(b.to)]) - Math.abs(PIECE_VALUE[this.board.at(a.to)]));
    let bestScore = -Infinity;
    for (let i = 0; i < moves.length; ++i) {
      const move = moves[i];
      move.move(this.board);
      const score = -this.findBestMove(depth - 1, -beta, -alpha);
      move.undo(this.board);
      if (score > bestScore) {
        bestScore = score;
      }
      if (score > alpha) {
        alpha = score;
        if (alpha >= beta) break;
      }
    }
    if (!this.transpositions.has(this.board.hash)) {
      this.transpositions.set(this.board.hash, new Map<number, number>());
    }
    this.transpositions.get(this.board.hash).set(depth, bestScore);
    return bestScore;
  }

  private evaluate(): number {
    let score = 0.0;
    for (let i = 0; i < 64; ++i) {
      score += PIECE_VALUE[this.board.at(i)];
    }
    return score;
  }
}
