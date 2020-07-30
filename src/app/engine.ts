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
  Draw,
  WhiteToMove,
  BlackToMove,
}

export class Engine {
  private board: Board;
  private history: IMover[] = [];
  private redoStack: IMover[] = [];
  private moveGenerator: MoveGenerator = new MoveGenerator();
  private depth: number = 5;

  constructor(board: Board) {
    this.board = board;
  }

  undo() {
    if (!this.history.length) return;

    const toUndo = this.history.pop();
    toUndo.undo(this.board);
    this.redoStack.push(toUndo);
  }

  redo() {
    if (!this.redoStack.length) return;

    const toRedo = this.redoStack.pop();
    toRedo.move(this.board);
    this.history.push(toRedo);
  }

  clearHistory(): void {
    this.history.length = 0;
    this.redoStack.length = 0;
  }

  get lastMove(): IMover {
    return this.history[this.history.length - 1];
  }

  get gameState(): GameState {
    if (this.moveGenerator.generate(this.board).length) {
      return this.board.isWhiteToMove ? GameState.WhiteToMove : GameState.BlackToMove;
    }
    if (CheckChecker.isInCheck(this.board, this.board.isWhiteToMove)) {
      return this.board.isWhiteToMove ? GameState.BlackWins : GameState.WhiteWins;
    }
    return GameState.Draw;
  }

  getLegalMoves(from: number): IMover[] {
    return this.moveGenerator.generate(this.board, from);
  }

  tryMakeMove(from: number, to: number): boolean {
    const moves = this.moveGenerator.generate(this.board, from, to);
    if (!moves.length) return false;

    moves[0].move(this.board);
    this.history.push(moves[0]);
    this.redoStack.length = 0;
    return true;
  }

  getBestMove(): Promise<IMover | undefined> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const moves = shuffle(this.moveGenerator.generate(this.board));
        moves.sort((a, b) => Math.abs(PIECE_VALUE[this.board.at(b.to)]) - Math.abs(PIECE_VALUE[this.board.at(a.to)]));
        let [bestMove] = moves;
        let bestScore = -Infinity;
        let alpha = -Infinity;
        let beta = Infinity;
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
