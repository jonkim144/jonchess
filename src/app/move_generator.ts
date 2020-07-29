import { Board } from './board';
import { CastlingMover, DoublePushMover, EnPassantMover, IMover, KingMover, Mover, PromotionMover, RookMover } from './mover';
import { KingAttackMap, RookAttackMap, KnightAttackMap, BishopAttackMap, WhitePawnAttackMap, BlackPawnAttackMap } from './attack_maps';
import { CheckChecker } from './check_checker';

const CASTLING_TO_CLEAR_MAP = new Map<number, string>([
  [0, 'Q'],
  [7, 'K'],
  [56, 'q'],
  [63, 'k'],
]);

export class MoveGenerator {
  generate(board: Board, from: number = -1, to: number = -1): IMover[] {
    let moves: IMover[] = [];
    for (let location = 0; location < 64; ++location) {
      if (board.isWhiteToMove) {
        switch (board.at(location)) {
          case 'P':
            this.generateWhitePawnMoves(board, location, moves);
            break;
          case 'N':
            this.generateWhiteKnightMoves(board, location, moves);
            break;
          case 'B':
            this.generateWhiteBishopMoves(board, location, moves);
            break;
          case 'R':
            this.generateWhiteRookMoves(board, location, moves);
            break;
          case 'Q':
            this.generateWhiteQueenMoves(board, location, moves);
            break;
          case 'K':
            this.generateWhiteKingMoves(board, location, moves);
            break;
          default:
            break;
        }
      } else {
        switch (board.at(location)) {
          case 'p':
            this.generateBlackPawnMoves(board, location, moves);
            break;
          case 'n':
            this.generateBlackKnightMoves(board, location, moves);
            break;
          case 'b':
            this.generateBlackBishopMoves(board, location, moves);
            break;
          case 'r':
            this.generateBlackRookMoves(board, location, moves);
            break;
          case 'q':
            this.generateBlackQueenMoves(board, location, moves);
            break;
          case 'k':
            this.generateBlackKingMoves(board, location, moves);
            break;
          default:
            break;
        }
      }
    }
    if (~from) moves = moves.filter((m) => m.from === from);
    if (~to) moves = moves.filter((m) => m.to === to);

    return moves;
  }

  private isWhitePiece(piece: string): boolean {
    return piece.charCodeAt(0) < 95;
  }
  private isBlackPiece(piece: string): boolean {
    return piece.charCodeAt(0) > 95;
  }

  private generateWhiteKingMoves(board: Board, location: number, moves: IMover[]): void {
    KingAttackMap.get(location).forEach((to) => {
      if (!this.isWhitePiece(board.at(to))) this.addMove(board, moves, new KingMover(new Mover(location, to), 'KQ'));
    });
    if (~board.castling.indexOf('K')) {
      if (board.at(5) === '_' && board.at(6) === '_' && !this.isInCheck(board, true)) {
        const intermediary = new KingMover(new Mover(location, 5), 'KQ');
        intermediary.move(board);
        const isCastlingThroughCheck = this.isInCheck(board, true);
        intermediary.undo(board);
        if (!isCastlingThroughCheck) {
          this.addMove(board, moves, new CastlingMover(new KingMover(new Mover(location, 6), 'KQ'), new Mover(7, 5)));
        }
      }
    }
    if (~board.castling.indexOf('Q')) {
      if (board.at(3) === '_' && board.at(2) === '_' && board.at(1) === '_' && !this.isInCheck(board, true)) {
        const intermediary = new KingMover(new Mover(location, 3), 'KQ');
        intermediary.move(board);
        const isCastlingThroughCheck = this.isInCheck(board, true);
        intermediary.undo(board);
        if (!isCastlingThroughCheck) {
          this.addMove(board, moves, new CastlingMover(new KingMover(new Mover(location, 2), 'KQ'), new Mover(0, 3)));
        }
      }
    }
  }

  private generateBlackKingMoves(board: Board, location: number, moves: IMover[]): void {
    KingAttackMap.get(location).forEach((to) => {
      if (!this.isBlackPiece(board.at(to))) this.addMove(board, moves, new KingMover(new Mover(location, to), 'kq'));
    });
    if (~board.castling.indexOf('k')) {
      if (board.at(61) === '_' && board.at(62) === '_' && !this.isInCheck(board, false)) {
        const intermediary = new KingMover(new Mover(location, 61), 'kq');
        intermediary.move(board);
        const isCastlingThroughCheck = this.isInCheck(board, false);
        intermediary.undo(board);
        if (!isCastlingThroughCheck) {
          this.addMove(board, moves, new CastlingMover(new KingMover(new Mover(location, 62), 'kq'), new Mover(63, 61)));
        }
      }
    }
    if (~board.castling.indexOf('q')) {
      if (board.at(59) === '_' && board.at(58) === '_' && board.at(57) === '_' && !this.isInCheck(board, false)) {
        const intermediary = new KingMover(new Mover(location, 59), 'kq');
        intermediary.move(board);
        const isCastlingThroughCheck = this.isInCheck(board, false);
        intermediary.undo(board);
        if (!isCastlingThroughCheck) {
          this.addMove(board, moves, new CastlingMover(new KingMover(new Mover(location, 58), 'kq'), new Mover(56, 59)));
        }
      }
    }
  }

  private generateWhiteQueenMoves(board: Board, location: number, moves: IMover[]): void {
    this.generateWhiteBishopMoves(board, location, moves);
    this.generateWhiteRookMoves(board, location, moves);
  }

  private generateBlackQueenMoves(board: Board, location: number, moves: IMover[]): void {
    this.generateBlackBishopMoves(board, location, moves);
    this.generateBlackRookMoves(board, location, moves);
  }

  private generateWhiteRookMoves(board: Board, location: number, moves: IMover[]): void {
    const castlingToClear = CASTLING_TO_CLEAR_MAP.get(location) || '';
    RookAttackMap.get(location).forEach((ray) => {
      for (let i = 0; i < ray.length; ++i) {
        const to = ray[i];
        const pieceAtTo = board.at(to);
        if (pieceAtTo === '_') {
          this.addMove(board, moves, new RookMover(new Mover(location, to), castlingToClear));
        } else {
          if (this.isBlackPiece(pieceAtTo)) this.addMove(board, moves, new RookMover(new Mover(location, to), castlingToClear));
          return;
        }
      }
    });
  }

  private generateBlackRookMoves(board: Board, location: number, moves: IMover[]): void {
    const castlingToClear = CASTLING_TO_CLEAR_MAP.get(location) || '';
    RookAttackMap.get(location).forEach((ray) => {
      for (let i = 0; i < ray.length; ++i) {
        const to = ray[i];
        const pieceAtTo = board.at(to);
        if (pieceAtTo === '_') {
          this.addMove(board, moves, new RookMover(new Mover(location, to), castlingToClear));
        } else {
          if (this.isWhitePiece(pieceAtTo)) this.addMove(board, moves, new RookMover(new Mover(location, to), castlingToClear));
          return;
        }
      }
    });
  }

  private generateWhiteBishopMoves(board: Board, location: number, moves: IMover[]): void {
    BishopAttackMap.get(location).forEach((ray) => {
      for (let i = 0; i < ray.length; ++i) {
        const to = ray[i];
        const pieceAtTo = board.at(to);
        if (pieceAtTo === '_') {
          this.addMove(board, moves, new Mover(location, to));
        } else {
          if (this.isBlackPiece(pieceAtTo)) this.addMove(board, moves, new Mover(location, to));
          return;
        }
      }
    });
  }

  private generateBlackBishopMoves(board: Board, location: number, moves: IMover[]): void {
    BishopAttackMap.get(location).forEach((ray) => {
      for (let i = 0; i < ray.length; ++i) {
        const to = ray[i];
        const pieceAtTo = board.at(to);
        if (pieceAtTo === '_') {
          this.addMove(board, moves, new Mover(location, to));
        } else {
          if (this.isWhitePiece(pieceAtTo)) this.addMove(board, moves, new Mover(location, to));
          return;
        }
      }
    });
  }

  private generateWhiteKnightMoves(board: Board, location: number, moves: IMover[]): void {
    KnightAttackMap.get(location).forEach((to) => {
      if (!this.isWhitePiece(board.at(to))) this.addMove(board, moves, new Mover(location, to));
    });
  }

  private generateBlackKnightMoves(board: Board, location: number, moves: IMover[]): void {
    KnightAttackMap.get(location).forEach((to) => {
      if (!this.isBlackPiece(board.at(to))) this.addMove(board, moves, new Mover(location, to));
    });
  }

  private isInCheck(board: Board, forWhite: boolean): boolean {
    return CheckChecker.isInCheck(board, forWhite);
  }

  private addMove(board: Board, moves: IMover[], mover: IMover): void {
    const forWhite = board.isWhiteToMove;
    mover.move(board);
    const isInCheck = this.isInCheck(board, forWhite);
    mover.undo(board);
    if (!isInCheck) {
      moves.push(mover);
    }
  }

  private generateWhitePawnMoves(board: Board, location: number, moves: IMover[]): void {
    const rank = Math.floor(location / 8);
    let singlePush = location + 8;
    if (board.at(singlePush) === '_') {
      if (rank !== 6) {
        if (rank === 1 && board.at(location + 16) === '_') {
          this.addMove(board, moves, new DoublePushMover(new Mover(location, location + 16)));
        }
        this.addMove(board, moves, new Mover(location, singlePush));
      } else {
        this.addMove(board, moves, new PromotionMover(location, singlePush, 'Q'));
        this.addMove(board, moves, new PromotionMover(location, singlePush, 'R'));
        this.addMove(board, moves, new PromotionMover(location, singlePush, 'B'));
        this.addMove(board, moves, new PromotionMover(location, singlePush, 'N'));
      }
    }
    // pawns can attack where enemy pawns can attack from
    BlackPawnAttackMap.get(location).forEach((captureTarget) => {
      if (this.isBlackPiece(board.at(captureTarget))) {
        if (rank !== 6) {
          this.addMove(board, moves, new Mover(location, captureTarget));
        } else {
          this.addMove(board, moves, new PromotionMover(location, captureTarget, 'Q'));
          this.addMove(board, moves, new PromotionMover(location, captureTarget, 'R'));
          this.addMove(board, moves, new PromotionMover(location, captureTarget, 'B'));
          this.addMove(board, moves, new PromotionMover(location, captureTarget, 'N'));
        }
      }
      if (captureTarget === board.enPassantTarget) {
        this.addMove(board, moves, new EnPassantMover(location, board.enPassantTarget));
      }
    });
  }

  private generateBlackPawnMoves(board: Board, location: number, moves: IMover[]): void {
    const rank = Math.floor(location / 8);
    const singlePush = location - 8;
    if (board.at(singlePush) === '_') {
      if (rank !== 1) {
        this.addMove(board, moves, new Mover(location, singlePush));
        if (rank === 6 && board.at(location - 16) === '_') {
          this.addMove(board, moves, new DoublePushMover(new Mover(location, location - 16)));
        }
      } else {
        this.addMove(board, moves, new PromotionMover(location, singlePush, 'q'));
        this.addMove(board, moves, new PromotionMover(location, singlePush, 'r'));
        this.addMove(board, moves, new PromotionMover(location, singlePush, 'b'));
        this.addMove(board, moves, new PromotionMover(location, singlePush, 'n'));
      }
    }
    // pawns can attack where enemy pawns can attack from
    WhitePawnAttackMap.get(location).forEach((captureTarget) => {
      if (this.isWhitePiece(board.at(captureTarget))) {
        if (rank !== 1) {
          this.addMove(board, moves, new Mover(location, captureTarget));
        } else {
          this.addMove(board, moves, new PromotionMover(location, captureTarget, 'q'));
          this.addMove(board, moves, new PromotionMover(location, captureTarget, 'r'));
          this.addMove(board, moves, new PromotionMover(location, captureTarget, 'b'));
          this.addMove(board, moves, new PromotionMover(location, captureTarget, 'n'));
        }
      }
      if (captureTarget === board.enPassantTarget) {
        this.addMove(board, moves, new EnPassantMover(location, board.enPassantTarget));
      }
    });
  }
}
