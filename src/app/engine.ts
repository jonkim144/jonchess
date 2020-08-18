import { IMover } from './mover';
import { Board } from './board';
import { MoveGenerator } from './move_generator';
import { CheckChecker } from './check_checker';
import { Book } from './book';
import LRU from 'lru-cache';

const PIECE_VALUE = new Map<string, number>([
  ['K', 1600],
  ['k', -1600],
  ['P', 100],
  ['p', -100],
  ['N', 300],
  ['n', -300],
  ['B', 305],
  ['b', -305],
  ['R', 500],
  ['r', -500],
  ['Q', 900],
  ['q', -900],
  ['_', 0],
]);

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

enum NodeType {
  EXACT,
  ALPHA,
  BETA,
}

const MAX_CACHE_SIZE = 32 * 1024 * 1024;

class Transposition {
  constructor(readonly score: number, readonly depth: number, readonly nodeType: NodeType, readonly bestMove: IMover) {}
}

export class Engine {
  private board: Board;
  private history: IMover[] = [];
  private redoStack: IMover[] = [];
  private moveGenerator: MoveGenerator = new MoveGenerator();
  private depth_: number = 5;
  private positionCounts = new Map<bigint, number>();
  private transpositions = new LRU(MAX_CACHE_SIZE);
  private book = new Book();

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

  get depth(): number {
    return this.depth_;
  }

  set depth(value: number) {
    this.depth_ = value;
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

  tryMakeMove(from: number, to: number, promo: string | undefined = undefined): boolean {
    const moves = this.moveGenerator.generate(this.board, from, to);
    if (!moves.length) return false;

    const [mover] = moves.filter((m) => !promo || promo === m.promotion);
    this.makeMove(mover);
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
    if (this.book.hasMoves(this.board.hash)) {
      const [bookMover] = shuffle(this.book.getMoves(this.board.hash));
      return Promise.resolve(bookMover);
    }
    if (this.pieceCount <= 16) this.depth = 6;
    if (this.pieceCount <= 8) this.depth = 7;

    return new Promise((resolve) => {
      setTimeout(() => {
        const moves = shuffle(this.moveGenerator.generate(this.board));
        let [bestMove] = moves;
        for (let d = 1; d <= this.depth; d += 2) {
          const hashMove = this.transpositions.has(this.board.hash) ? this.transpositions.get(this.board.hash).bestMove : undefined;
          moves.sort((a, b) => {
            if (hashMove) {
              if (hashMove.from === a.from && hashMove.to === a.to) return -1;
              if (hashMove.from === b.from && hashMove.to === b.to) return 1;
            }
            const mvv = Math.abs(PIECE_VALUE.get(this.board.at(b.to))) - Math.abs(PIECE_VALUE.get(this.board.at(a.to)));
            if (mvv) return mvv;

            const lva = Math.abs(PIECE_VALUE.get(this.board.at(a.from))) - Math.abs(PIECE_VALUE.get(this.board.at(b.from)));
            if (lva) return lva;

            if (a.givesCheck && !b.givesCheck) return -1;
            if (!a.givesCheck && b.givesCheck) return 1;

            return 0;
          });
          let alpha = -Infinity;
          let beta = Infinity;
          for (const move of moves) {
            let score;
            move.move(this.board);
            score = -this.findBestMove(d, -beta, -alpha);
            move.undo(this.board);
            if (score > alpha) {
              bestMove = move;
              alpha = score;
            }
          }
          this.transpositions.set(this.board.hash, new Transposition(alpha, d + 1, NodeType.EXACT, bestMove));
        }
        resolve(bestMove);
      }, 50);
    });
  }

  private findBestMove(depth: number, alpha: number, beta: number): number {
    const t = this.transpositions.get(this.board.hash);
    if (t) {
      if (t.depth >= depth) {
        switch (t.nodeType) {
          case NodeType.EXACT:
            return t.score;
          case NodeType.ALPHA:
            if (t.score <= alpha) return alpha;
            break;
          case NodeType.BETA:
            if (t.score >= beta) return beta;
            break;
          default:
            break;
        }
      }
    }
    if (depth === 0) {
      return (this.board.isWhiteToMove ? 1 : -1) * this.evaluate();
    }

    const moves = this.moveGenerator.generate(this.board);
    if (moves.length === 0) {
      if (!CheckChecker.isInCheck(this.board, this.board.isWhiteToMove)) {
        return 0;
      }
      return alpha;
    }

    const hashMove = t ? t.bestMove : undefined;
    moves.sort((a, b) => {
      if (hashMove) {
        if (a.from === hashMove.from && a.to === hashMove.to) return -1;
        if (b.from === hashMove.from && b.to === hashMove.to) return 1;
      }
      const mvv = Math.abs(PIECE_VALUE.get(this.board.at(b.to))) - Math.abs(PIECE_VALUE.get(this.board.at(a.to)));
      if (mvv) return mvv;

      const lva = Math.abs(PIECE_VALUE.get(this.board.at(a.from))) - Math.abs(PIECE_VALUE.get(this.board.at(b.from)));
      if (lva) return lva;

      if (a.givesCheck && !b.givesCheck) return -1;
      if (!a.givesCheck && b.givesCheck) return 1;

      return 0;
    });

    let raisedAlpha = false;
    let bestMove;
    for (const move of moves) {
      move.move(this.board);
      let score;
      score = -this.findBestMove(depth - 1, -beta, -alpha);
      move.undo(this.board);
      if (score >= beta) {
        this.transpositions.set(this.board.hash, new Transposition(beta, depth, NodeType.BETA, move));
        return beta;
      }
      if (score > alpha) {
        bestMove = move;
        alpha = score;
        raisedAlpha = true;
      }
    }
    this.transpositions.set(this.board.hash, new Transposition(alpha, depth, raisedAlpha ? NodeType.EXACT : NodeType.ALPHA, bestMove));
    return alpha;
  }

  private evaluate(): number {
    let score = 0.0;
    for (let i = 0; i < 64; ++i) {
      score += PIECE_VALUE.get(this.board.at(i));
    }
    return score;
  }
}
