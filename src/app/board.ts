const bytesToBigInt = (bytes) => {
  let result = 0n;
  const n = bytes.length;
  if (n >= 8) {
    const view = new DataView(bytes.buffer, bytes.byteOffset);
    for (let i = 0, k = n & ~7; i < k; i += 8) {
      const x = view.getBigUint64(i, false);
      result = (result << 64n) + x;
    }
  }
  for (let i = n & ~7; i < n; ++i) {
    result = result * 256n + BigInt(bytes[i]);
  }

  return result;
};

const randomBytes = (size) => {
  return crypto.getRandomValues(new Uint8Array(size));
};

const getRandomBigInts = (count: number) => {
  const randos: bigint[] = [];
  while (randos.length < count) {
    randos.push(bytesToBigInt(randomBytes(8)));
  }
  return randos;
};

class Zobrist {
  private readonly pieceKeys: Map<number, Map<string, bigint>>;
  private readonly castlingKeys: Map<string, bigint>;
  private readonly sideToMoveKeys: Map<boolean, bigint>;
  private readonly enPassantKeys: Map<number, bigint>;

  constructor() {
    this.pieceKeys = new Map<number, Map<string, bigint>>();
    for (let i = 0; i < 64; ++i) {
      const map = new Map<string, bigint>();
      const pieces = ['K', 'Q', 'R', 'B', 'N', 'P', 'k', 'q', 'r', 'b', 'n', 'p', '_'];
      const randos: bigint[] = getRandomBigInts(pieces.length);
      pieces.forEach((piece, index) => map.set(piece, randos[index]));
      this.pieceKeys.set(i, map);
    }
    this.castlingKeys = new Map<string, bigint>();
    const castlingRandos = getRandomBigInts(5);
    ['K', 'Q', 'k', 'q', '-'].forEach((c) => this.castlingKeys.set(c, castlingRandos.pop()));
    this.sideToMoveKeys = new Map<boolean, bigint>();
    const sideToMoveRandos = getRandomBigInts(2);
    this.sideToMoveKeys.set(true, sideToMoveRandos.pop());
    this.sideToMoveKeys.set(false, sideToMoveRandos.pop());
    this.enPassantKeys = new Map<number, bigint>();
    const enPassantRandos = getRandomBigInts(17);
    for (let x = 0; x < 8; ++x) {
      this.enPassantKeys.set(2 * 8 + x, enPassantRandos.pop());
      this.enPassantKeys.set(5 * 8 + x, enPassantRandos.pop());
    }
    this.enPassantKeys.set(-1, enPassantRandos.pop());
  }

  getPieceKey(location: number, piece: string): bigint {
    return this.pieceKeys.get(location).get(piece);
  }

  getCastlingKey(code: string): bigint {
    return this.castlingKeys.get(code);
  }

  getSideToMoveKey(isWhite: boolean): bigint {
    return this.sideToMoveKeys.get(isWhite);
  }

  getEnPassantKey(location: number): bigint {
    return this.enPassantKeys.get(location);
  }
}

export class Board {
  private board: string[] = new Array(64).fill('_');
  private isWhiteToMove_: boolean = true;
  private castling_: string = 'KQkq';
  private enpassant: number = -1;
  private kingPosition = new Map<string, number>();
  private zobrist = new Zobrist();
  private hash_ = 0n;

  constructor(fen: string) {
    this.fen = fen;
  }

  private reset(): void {
    this.hash_ = 0n;
    this.isWhiteToMove_ = true;
    this.castling_ = 'KQkq';
    this.enpassant = -1;
  }

  set fen(fen: string) {
    this.reset();
    let square = -1;
    const [pieces, sideToMove, castling, enpassant] = fen.split(' ');
    this.isWhiteToMove = 'w' === sideToMove;
    this.castling = castling;
    this.enpassant = this.parseFenEnpassant(enpassant);
    pieces
      .split('/')
      .reverse()
      .forEach((row) => {
        row.split('').forEach((c) => {
          switch (c) {
            case 'k':
              this.kingPosition.set('k', ++square);
              this.set('k', square);
              break;
            case 'K':
              this.kingPosition.set('K', ++square);
              this.set('K', square);
              break;
            default:
              return this.set(c, ++square);
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
              const nextSquare = square + parseInt(c);
              while (square < nextSquare) this.clear(++square);
              break;
          }
        });
      });
  }

  get fen(): string {
    const rows = [];
    for (let y = 0; y < 8; ++y) {
      let blanks = 0;
      let row = '';
      for (let x = 0; x < 8; ++x) {
        const location = x + y * 8;
        if (this.at(location) !== '_') {
          if (blanks) {
            row += blanks;
          }
          row += this.at(location);
          blanks = 0;
          continue;
        }
        ++blanks;
      }
      if (blanks) row += blanks;
      rows.push(row);
    }
    return `${rows.reverse().join('/')} ${this.isWhiteToMove_ ? 'w' : 'b'} ${this.castling} ${
      -1 === this.enpassant ? '-' : this.toAlgebraic(this.enpassant)
    }`;
  }

  private toAlgebraic(location: number): string {
    const file = location % 8;
    const rank = Math.floor(location / 8);
    return `${String.fromCharCode('a'.charCodeAt(0) + file)}${rank + 1}`;
  }

  get hash(): bigint {
    return this.hash_;
  }

  get whiteKingPosition(): number {
    return this.kingPosition.get('K');
  }

  setKingPosition(king: string, value: number) {
    this.kingPosition.set(king, value);
  }

  get blackKingPosition(): number {
    return this.kingPosition.get('k');
  }

  get castling(): string {
    return this.castling_;
  }

  set castling(value: string) {
    for (const code of this.castling_) this.hash_ ^= this.zobrist.getCastlingKey(code);
    this.castling_ = value || '-';
    for (const code of this.castling_) this.hash_ ^= this.zobrist.getCastlingKey(code);
  }

  at(i: number): string {
    return this.board[i];
  }

  set(piece: string, location: number): void {
    this.hash_ ^= this.zobrist.getPieceKey(location, this.board[location]);
    this.board[location] = piece;
    this.hash_ ^= this.zobrist.getPieceKey(location, piece);
  }

  clear(location: number): void {
    this.set('_', location);
  }

  get isWhiteToMove(): boolean {
    return this.isWhiteToMove_;
  }

  set isWhiteToMove(value: boolean) {
    this.hash_ ^= this.zobrist.getSideToMoveKey(value);
    this.isWhiteToMove_ = value;
    this.hash_ ^= this.zobrist.getSideToMoveKey(value);
  }

  get canWhiteCastleShort(): boolean {
    return !!~this.castling.indexOf('K');
  }
  get canWhiteCastleLong(): boolean {
    return !!~this.castling.indexOf('Q');
  }
  get canBlackCastleShort(): boolean {
    return !!~this.castling.indexOf('k');
  }
  get canBlackCastleLong(): boolean {
    return !!~this.castling.indexOf('q');
  }

  get enPassantTarget(): number {
    return this.enpassant;
  }

  set enPassantTarget(value: number) {
    this.hash_ ^= this.zobrist.getEnPassantKey(value);
    this.enpassant = value;
    this.hash_ ^= this.zobrist.getEnPassantKey(value);
  }

  private parseFenEnpassant(fenEnpassant: string): number {
    if ('-' === fenEnpassant) return -1;
    return (parseInt(fenEnpassant[1]) - 1) * 8 + fenEnpassant.charCodeAt(0) - 97;
  }
}
