import { Board } from './board';

describe('Board', () => {
  it('at starting position', () => {
    const board = new Board('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    expect(board.at(0)).toBe('R');
    expect(board.at(1)).toBe('N');
    expect(board.at(2)).toBe('B');
    expect(board.at(3)).toBe('Q');
    expect(board.at(4)).toBe('K');
    expect(board.at(5)).toBe('B');
    expect(board.at(6)).toBe('N');
    expect(board.at(7)).toBe('R');
    for (let i = 8; i < 16; ++i) {
      expect(board.at(i)).toBe('P');
    }
    for (let i = 16; i < 16 + 4 * 8; ++i) {
      expect(board.at(i)).toBe('_');
    }
    for (let i = 48; i < 56; ++i) {
      expect(board.at(i)).toBe('p');
    }
    expect(board.at(56)).toBe('r');
    expect(board.at(57)).toBe('n');
    expect(board.at(58)).toBe('b');
    expect(board.at(59)).toBe('q');
    expect(board.at(60)).toBe('k');
    expect(board.at(61)).toBe('b');
    expect(board.at(62)).toBe('n');
    expect(board.at(63)).toBe('r');
    expect(board.canWhiteCastleShort).toBeTruthy();
    expect(board.canWhiteCastleLong).toBeTruthy();
    expect(board.canBlackCastleShort).toBeTruthy();
    expect(board.canBlackCastleLong).toBeTruthy();
    expect(board.enPassantTarget).toBe(-1);
  });

  it('set piece on blank square', () => {
    const board = new Board('8/8/8/8/8/8/8/8 w KQkq -');
    board.set('R', 0);
    expect(board.at(0)).toBe('R');
  });

  it('set piece overwrites existing', () => {
    const board = new Board('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    board.set('Q', 0);
    expect(board.at(0)).toBe('Q');
  });

  it('clear existing piece', () => {
    const board = new Board('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    expect(board.at(8)).toBe('P');
    board.clear(8);
    expect(board.at(8)).toBe('_');
  });

  it('clearing empty square leaves it empty', () => {
    const board = new Board('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    expect(board.at(18)).toBe('_');
    board.clear(18);
    expect(board.at(18)).toBe('_');
  });

  it('set fen refreshes board and clears empty squares', () => {
    const board = new Board('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    const newFen = 'rnbqkbnr/ppp1pppp/8/8/3pP3/2PP4/PP3PPP/RNBQKBNR b KQkq e3';
    board.fen = newFen;
    expect(board.fen).toBe(newFen);
  });
});
