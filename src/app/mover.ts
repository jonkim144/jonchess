import { Board } from './board';

export interface IMover {
  move(board: Board): void;
  undo(board: Board): void;
  readonly from: number;
  readonly to: number;
  readonly promotion: string;
  givesCheck: boolean;
  readonly isCapture: boolean;
}

export class Mover implements IMover {
  private captured: string;
  private oldEnPassantTarget: number;
  private oldCastling: string;
  private givesCheck_: boolean = false;

  constructor(private readonly from_: number, private readonly to_: number) {}

  move(board: Board): void {
    this.oldCastling = board.castling;
    this.oldEnPassantTarget = board.enPassantTarget;
    this.captured = board.at(this.to);
    board.set(board.at(this.from), this.to);
    board.clear(this.from);
    board.enPassantTarget = -1;
    board.isWhiteToMove = !board.isWhiteToMove;
    if ('R' === this.captured) {
      if (this.to === 0) board.castling = board.castling.replace('Q', '');
      else if (this.to === 7) board.castling = board.castling.replace('K', '');
    } else if ('r' === this.captured) {
      if (this.to === 56) board.castling = board.castling.replace('q', '');
      else if (this.to === 63) board.castling = board.castling.replace('k', '');
    }
  }

  undo(board: Board): void {
    board.set(board.at(this.to), this.from);
    board.set(this.captured, this.to);
    board.enPassantTarget = this.oldEnPassantTarget;
    board.isWhiteToMove = !board.isWhiteToMove;
    board.castling = this.oldCastling;
  }

  get from(): number {
    return this.from_;
  }

  get to(): number {
    return this.to_;
  }

  get promotion(): string {
    return '';
  }

  set givesCheck(value: boolean) {
    this.givesCheck_ = value;
  }

  get givesCheck(): boolean {
    return this.givesCheck_;
  }

  get isCapture(): boolean {
    return this.captured !== '_';
  }
}

export class RookMover implements IMover {
  private oldCastling: string;
  private givesCheck_: boolean = false;

  constructor(private readonly rookMover: IMover, private readonly castlingToClear: string) {}

  move(board: Board): void {
    this.oldCastling = board.castling;
    this.rookMover.move(board);
    board.castling = board.castling.replace(this.castlingToClear, '');
  }

  undo(board: Board): void {
    this.rookMover.undo(board);
    board.castling = this.oldCastling;
  }

  get from(): number {
    return this.rookMover.from;
  }

  get to(): number {
    return this.rookMover.to;
  }

  get promotion(): string {
    return '';
  }

  set givesCheck(value: boolean) {
    this.givesCheck_ = value;
  }

  get givesCheck(): boolean {
    return this.givesCheck_;
  }

  get isCapture(): boolean {
    return this.rookMover.isCapture;
  }
}

export class KingMover implements IMover {
  private oldCastling: string;
  private givesCheck_: boolean = false;

  constructor(private readonly kingMover: IMover, private readonly castlingToClear: string) {}

  move(board: Board): void {
    this.oldCastling = board.castling;
    this.kingMover.move(board);
    board.castling = board.castling.replace(this.castlingToClear[0], '').replace(this.castlingToClear[1], '');
    board.setKingPosition(this.castlingToClear[0], this.to);
  }

  undo(board: Board): void {
    this.kingMover.undo(board);
    board.castling = this.oldCastling;
    board.setKingPosition(this.castlingToClear[0], this.from);
  }

  get from(): number {
    return this.kingMover.from;
  }

  get to(): number {
    return this.kingMover.to;
  }

  get promotion(): string {
    return '';
  }

  set givesCheck(value: boolean) {
    this.givesCheck_ = value;
  }

  get givesCheck(): boolean {
    return this.givesCheck_;
  }

  get isCapture(): boolean {
    return this.kingMover.isCapture;
  }
}

export class DoublePushMover implements IMover {
  private givesCheck_: boolean = false;

  constructor(private readonly pawnMover: Mover) {}

  move(board: Board): void {
    this.pawnMover.move(board);
    const delta = this.pawnMover.to - this.pawnMover.from;
    board.enPassantTarget = this.pawnMover.from + delta / 2;
  }

  undo(board: Board): void {
    this.pawnMover.undo(board);
  }

  get from(): number {
    return this.pawnMover.from;
  }

  get to(): number {
    return this.pawnMover.to;
  }

  get promotion(): string {
    return '';
  }

  set givesCheck(value: boolean) {
    this.givesCheck_ = value;
  }

  get givesCheck(): boolean {
    return this.givesCheck_;
  }

  get isCapture(): boolean {
    return false;
  }
}

export class CastlingMover implements IMover {
  private givesCheck_: boolean = false;
  private oldCastling: string;
  private oldSideToMove: boolean;
  private oldEnPassant: number;

  constructor(private readonly kingMover: KingMover, private readonly rookMover: Mover) {}

  move(board: Board): void {
    this.oldCastling = board.castling;
    this.oldEnPassant = board.enPassantTarget;
    this.oldSideToMove = board.isWhiteToMove;
    this.kingMover.move(board);
    this.rookMover.move(board);
    board.isWhiteToMove = !this.oldSideToMove;
  }

  undo(board: Board): void {
    this.kingMover.undo(board);
    this.rookMover.undo(board);
    board.isWhiteToMove = this.oldSideToMove;
    board.enPassantTarget = this.oldEnPassant;
    board.castling = this.oldCastling;
  }

  get from(): number {
    return this.kingMover.from;
  }

  get to(): number {
    return this.kingMover.to;
  }

  get promotion(): string {
    return '';
  }

  set givesCheck(value: boolean) {
    this.givesCheck_ = value;
  }

  get givesCheck(): boolean {
    return this.givesCheck_;
  }

  get isCapture(): boolean {
    return false;
  }
}

export class EnPassantMover implements IMover {
  private givesCheck_: boolean = false;
  private pawnMover: Mover;
  private captured: string;
  private capturedLocation: number;

  constructor(from: number, to: number) {
    this.pawnMover = new Mover(from, to);
  }

  move(board: Board): void {
    const enPassantTarget = board.enPassantTarget;
    this.pawnMover.move(board);
    const offset = enPassantTarget - this.from;
    this.capturedLocation = enPassantTarget - (8 * offset) / Math.abs(offset);
    this.captured = board.at(this.capturedLocation);
    board.clear(this.capturedLocation);
  }

  undo(board: Board): void {
    this.pawnMover.undo(board);
    board.set(this.captured, this.capturedLocation);
  }

  get from(): number {
    return this.pawnMover.from;
  }

  get to(): number {
    return this.pawnMover.to;
  }

  get promotion(): string {
    return '';
  }

  set givesCheck(value: boolean) {
    this.givesCheck_ = value;
  }

  get givesCheck(): boolean {
    return this.givesCheck_;
  }

  get isCapture(): boolean {
    return true;
  }
}

export class PromotionMover implements IMover {
  private givesCheck_: boolean = false;
  private readonly pawnMover: Mover;
  private pawn: string;

  constructor(from: number, to: number, private readonly promotion_: string) {
    this.pawnMover = new Mover(from, to);
  }

  move(board: Board): void {
    this.pawn = board.at(this.from);
    this.pawnMover.move(board);
    board.set(this.promotion, this.to);
  }

  undo(board: Board): void {
    this.pawnMover.undo(board);
    board.set(this.pawn, this.from);
  }

  get from(): number {
    return this.pawnMover.from;
  }

  get to(): number {
    return this.pawnMover.to;
  }

  get promotion(): string {
    return this.promotion_;
  }

  set givesCheck(value: boolean) {
    this.givesCheck_ = value;
  }

  get givesCheck(): boolean {
    return this.givesCheck_;
  }

  get isCapture(): boolean {
    return this.pawnMover.isCapture;
  }
}
