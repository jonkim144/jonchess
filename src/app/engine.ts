import { IMover } from './mover';
import { Board } from './board';
import { MoveGenerator } from './move_generator';

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
        const moves = this.moveGenerator.generate(this.board);
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
      switch (this.board.at(i)) {
        case 'P':
          score += 1.0;
          break;
        case 'N':
          score += 3.0;
          break;
        case 'B':
          score += 3.0;
          break;
        case 'R':
          score += 5.0;
          break;
        case 'Q':
          score += 9.0;
          break;
        case 'p':
          score -= 1.0;
          break;
        case 'n':
          score -= 3.0;
          break;
        case 'b':
          score -= 3.0;
          break;
        case 'r':
          score -= 5.0;
          break;
        case 'q':
          score -= 9.0;
          break;
      }
    }
    return score;
  }
}
