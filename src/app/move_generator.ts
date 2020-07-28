import { Board } from './board';
import { CastlingMover, DoublePushMover, EnPassantMover, IMover, KingMover, Mover, PromotionMover, RookMover } from './mover';

const isValidCoordinate = (coordinate: number) => coordinate > -1 && coordinate < 8;

const CASTLING_TO_CLEAR_MAP = new Map<number, string>([
  [0, 'Q'],
  [7, 'K'],
  [56, 'q'],
  [63, 'k'],
]);

class KingMovesMap {
  private static map = new Map<number, number[]>();
  private static initialized: boolean = false;

  constructor() {
    if (KingMovesMap.initialized) return;

    KingMovesMap.initialized = true;
    [...Array(64).keys()].forEach((from) => {
      const x = from % 8;
      const y = Math.floor(from / 8);
      [
        [0, 1],
        [1, 1],
        [1, -1],
        [1, 0],
      ].forEach(([dx, dy]) => {
        [-1, 1].forEach((sign) => {
          const newX = x + dx * sign;
          const newY = y + dy * sign;
          if (!isValidCoordinate(newX)) return;
          if (!isValidCoordinate(newY)) return;

          if (!KingMovesMap.map.has(from)) KingMovesMap.map.set(from, []);
          KingMovesMap.map.get(from).push(newX + 8 * newY);
        });
      });
    });
  }

  get(location: number): number[] {
    return KingMovesMap.map.get(location);
  }
}
const VALID_KING_MOVES_MAP = new KingMovesMap();

class RookRaysMap {
  private static map = new Map<number, number[][]>();
  private static initialized: boolean = false;

  constructor() {
    if (RookRaysMap.initialized) return;

    RookRaysMap.initialized = true;
    [...Array(64).keys()].forEach((from) => {
      RookRaysMap.map.set(from, []);
      const x = from % 8;
      const y = Math.floor(from / 8);
      [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ].forEach(([dx, dy]) => {
        let newX = x + dx;
        let newY = y + dy;
        const nextRayIndex = RookRaysMap.map.get(from).length;
        while (isValidCoordinate(newX) && isValidCoordinate(newY)) {
          if (!RookRaysMap.map.get(from)[nextRayIndex]) RookRaysMap.map.get(from).push([]);

          RookRaysMap.map.get(from)[nextRayIndex].push(newX + 8 * newY);
          newX += dx;
          newY += dy;
        }
      });
    });
  }

  get(location: number): number[][] {
    return RookRaysMap.map.get(location);
  }
}
const VALID_ROOK_RAYS_MAP = new RookRaysMap();

class BishopRaysMap {
  private static map = new Map<number, number[][]>();
  private static initialized: boolean = false;

  constructor() {
    if (BishopRaysMap.initialized) return;

    BishopRaysMap.initialized = true;
    [...Array(64).keys()].forEach((from) => {
      BishopRaysMap.map.set(from, []);
      const x = from % 8;
      const y = Math.floor(from / 8);
      [
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ].forEach(([dx, dy]) => {
        let newX = x + dx;
        let newY = y + dy;
        const nextRayIndex = BishopRaysMap.map.get(from).length;
        while (isValidCoordinate(newX) && isValidCoordinate(newY)) {
          if (!BishopRaysMap.map.get(from)[nextRayIndex]) BishopRaysMap.map.get(from).push([]);

          BishopRaysMap.map.get(from)[nextRayIndex].push(newX + 8 * newY);
          newX += dx;
          newY += dy;
        }
      });
    });
  }

  get(location: number): number[][] {
    return BishopRaysMap.map.get(location);
  }
}
const VALID_BISHOP_RAYS_MAP = new BishopRaysMap();

class KnightMovesMap {
  private static map = new Map<number, number[]>();
  private static initialized: boolean = false;

  constructor() {
    if (KnightMovesMap.initialized) return;

    KnightMovesMap.initialized = true;
    [...Array(64).keys()].forEach((from) => {
      if (!KnightMovesMap.map.has(from)) KnightMovesMap.map.set(from, []);
      const x = from % 8;
      const y = Math.floor(from / 8);
      [
        [1, 2],
        [1, -2],
        [2, 1],
        [2, -1],
      ].forEach(([dx, dy]) => {
        [-1, 1].forEach((sign) => {
          const newX = x + dx * sign;
          const newY = y + dy * sign;
          if (!isValidCoordinate(newX)) return;
          if (!isValidCoordinate(newY)) return;

          KnightMovesMap.map.get(from).push(newX + 8 * newY);
        });
      });
    });
  }

  get(location: number): number[] {
    return KnightMovesMap.map.get(location);
  }
}
const VALID_KNIGHT_MOVES_MAP = new KnightMovesMap();

class WhitePawnAttackMap {
  private static map = new Map<number, number[]>();
  private static initialized: boolean = false;

  constructor() {
    if (WhitePawnAttackMap.initialized) return;

    WhitePawnAttackMap.initialized = true;
    [...Array(64).keys()].forEach((from) => {
      if (!WhitePawnAttackMap.map.has(from)) WhitePawnAttackMap.map.set(from, []);
      const x = from % 8;
      const y = Math.floor(from / 8);
      [
        [1, -1],
        [-1, -1],
      ].forEach(([dx, dy]) => {
        const newX = x + dx;
        const newY = y + dy;
        if (!isValidCoordinate(newX)) return;
        if (!isValidCoordinate(newY)) return;

        WhitePawnAttackMap.map.get(from).push(newX + 8 * newY);
      });
    });
  }

  get(location: number): number[] {
    return WhitePawnAttackMap.map.get(location);
  }
}
const VALID_WHITE_PAWN_ATTACK_MAP = new WhitePawnAttackMap();

class BlackPawnAttackMap {
  private static map = new Map<number, number[]>();
  private static initialized: boolean = false;

  constructor() {
    if (BlackPawnAttackMap.initialized) return;

    BlackPawnAttackMap.initialized = true;
    [...Array(64).keys()].forEach((from) => {
      if (!BlackPawnAttackMap.map.has(from)) BlackPawnAttackMap.map.set(from, []);
      const x = from % 8;
      const y = Math.floor(from / 8);
      [
        [1, 1],
        [-1, 1],
      ].forEach(([dx, dy]) => {
        const newX = x + dx;
        const newY = y + dy;
        if (!isValidCoordinate(newX)) return;
        if (!isValidCoordinate(newY)) return;

        BlackPawnAttackMap.map.get(from).push(newX + 8 * newY);
      });
    });
  }

  get(location: number): number[] {
    return BlackPawnAttackMap.map.get(location);
  }
}
const VALID_BLACK_PAWN_ATTACK_MAP = new BlackPawnAttackMap();

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
    VALID_KING_MOVES_MAP.get(location).forEach((to) => {
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
    VALID_KING_MOVES_MAP.get(location).forEach((to) => {
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
    VALID_ROOK_RAYS_MAP.get(location).forEach((ray) => {
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
    VALID_ROOK_RAYS_MAP.get(location).forEach((ray) => {
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
    VALID_BISHOP_RAYS_MAP.get(location).forEach((ray) => {
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
    VALID_BISHOP_RAYS_MAP.get(location).forEach((ray) => {
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
    VALID_KNIGHT_MOVES_MAP.get(location).forEach((to) => {
      if (!this.isWhitePiece(board.at(to))) this.addMove(board, moves, new Mover(location, to));
    });
  }

  private generateBlackKnightMoves(board: Board, location: number, moves: IMover[]): void {
    VALID_KNIGHT_MOVES_MAP.get(location).forEach((to) => {
      if (!this.isBlackPiece(board.at(to))) this.addMove(board, moves, new Mover(location, to));
    });
  }

  private isInCheck(board: Board, forWhite: boolean): boolean {
    if (!forWhite) {
      const kingLocation = board.blackKingPosition;
      for (const ray of VALID_BISHOP_RAYS_MAP.get(kingLocation)) {
        for (let i = 0; i < ray.length; ++i) {
          const piece = board.at(ray[i]);
          if (piece !== '_') {
            if (piece === 'B' || piece === 'Q') return true;

            break;
          }
        }
      }
      for (const ray of VALID_ROOK_RAYS_MAP.get(kingLocation)) {
        for (let i = 0; i < ray.length; ++i) {
          const piece = board.at(ray[i]);
          if (piece !== '_') {
            if (piece === 'R' || piece === 'Q') return true;

            break;
          }
        }
      }
      for (const knightLocation of VALID_KNIGHT_MOVES_MAP.get(kingLocation)) {
        if (board.at(knightLocation) === 'N') return true;
      }
      for (const pawnLocation of VALID_WHITE_PAWN_ATTACK_MAP.get(kingLocation)) {
        if (board.at(pawnLocation) === 'P') return true;
      }
      for (const enemyKingPosition of VALID_KING_MOVES_MAP.get(kingLocation)) {
        if (board.at(enemyKingPosition) === 'K') return true;
      }
    } else {
      const kingLocation = board.whiteKingPosition;
      for (const ray of VALID_BISHOP_RAYS_MAP.get(kingLocation)) {
        for (let i = 0; i < ray.length; ++i) {
          const piece = board.at(ray[i]);
          if (piece !== '_') {
            if (piece === 'b' || piece === 'q') return true;

            break;
          }
        }
      }
      for (const ray of VALID_ROOK_RAYS_MAP.get(kingLocation)) {
        for (let i = 0; i < ray.length; ++i) {
          const piece = board.at(ray[i]);
          if (piece !== '_') {
            if (piece === 'r' || piece === 'q') return true;

            break;
          }
        }
      }
      for (const knightLocation of VALID_KNIGHT_MOVES_MAP.get(kingLocation)) {
        if (board.at(knightLocation) === 'n') return true;
      }
      for (const pawnLocation of VALID_BLACK_PAWN_ATTACK_MAP.get(kingLocation)) {
        if (board.at(pawnLocation) === 'p') return true;
      }
      for (const enemyKingPosition of VALID_KING_MOVES_MAP.get(kingLocation)) {
        if (board.at(enemyKingPosition) === 'k') return true;
      }
    }
    return false;
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
    VALID_BLACK_PAWN_ATTACK_MAP.get(location).forEach((captureTarget) => {
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
    VALID_WHITE_PAWN_ATTACK_MAP.get(location).forEach((captureTarget) => {
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
