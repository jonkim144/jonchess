export class Board {
  private board: string[] = new Array(64).fill('_');
  private isWhiteToMove_: boolean = true;
  private castling_: string = 'KQkq';
  private enpassant: number = -1;
  private kingPosition = new Map<string, number>();

  constructor(fen: string) {
    this.fen = fen;
  }

  set fen(fen: string) {
    let square = -1;
    const [pieces, sideToMove, castling, enpassant] = fen.split(' ');
    this.isWhiteToMove_ = 'w' === sideToMove;
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
    this.castling_ = value || '-';
  }

  at(i: number): string {
    return this.board[i];
  }

  set(piece: string, location: number): void {
    this.board[location] = piece;
  }

  clear(location: number): void {
    this.board[location] = '_';
  }

  get isWhiteToMove(): boolean {
    return this.isWhiteToMove_;
  }

  set isWhiteToMove(value: boolean) {
    this.isWhiteToMove_ = value;
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
    this.enpassant = value;
  }

  private parseFenEnpassant(fenEnpassant: string): number {
    if ('-' === fenEnpassant) return -1;
    return (parseInt(fenEnpassant[1]) - 1) * 8 + fenEnpassant.charCodeAt(0) - 97;
  }
}
