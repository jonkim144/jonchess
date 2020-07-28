import { CastlingMover, DoublePushMover, EnPassantMover, KingMover, Mover, PromotionMover, RookMover } from './mover';
import { Board } from './board';

describe('Movers', () => {
  describe('Mover', () => {
    let board;
    beforeEach(() => {
      board = new Board('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    });

    it('move piece to blank square', () => {
      const mover = new Mover(1, 18);
      mover.move(board);
      expect(board.at(1)).toBe('_');
      expect(board.at(18)).toBe('N');
      expect(board.isWhiteToMove).toBe(false);
    });

    it('move piece to occupied square captures', () => {
      board = new Board('r1bqk2r/pppp1ppp/2n2n2/2b1p3/2BPP3/2P2N2/PP3PPP/RNBQK2R b KQkq - 0 5');
      const mover = new Mover(36, 27);
      mover.move(board);
      expect(board.at(36)).toBe('_');
      expect(board.at(27)).toBe('p');
      mover.undo(board);
      expect(board.at(36)).toBe('p');
      expect(board.at(27)).toBe('P');
    });

    it('resets en passant target after non-double-push', () => {
      board = new Board('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3');
      const mover = new Mover(57, 42);
      mover.move(board);
      expect(board.enPassantTarget).toBe(-1);
      expect(board.isWhiteToMove).toBe(true);
      mover.undo(board);
      expect(board.enPassantTarget).toBe(20);
      expect(board.isWhiteToMove).toBe(false);
    });

    it('clears white short castling when rook captured', () => {
      board = new Board('rnbq1k1r/pp1Pbppp/2p5/8/2B5/P7/1PP1NnPP/RNBQK2R b KQ -');
      const mover = new Mover(13, 7);
      mover.move(board);
      expect(board.castling).toBe('Q');
    });

    it('clears white long castling when rook captured', () => {
      board = new Board('rnbq1k1r/pp1Pbppp/2p5/8/2B5/P7/1Pn1N1PP/RNBQK2R b KQ -');
      const mover = new Mover(10, 0);
      mover.move(board);
      expect(board.castling).toBe('K');
    });
  });

  describe('DoublePushMover', () => {
    let board;
    beforeEach(() => {
      board = new Board('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    });

    it('sets en passant target for white', () => {
      const doublePushMover = new DoublePushMover(new Mover(8, 24));
      doublePushMover.move(board);
      expect(board.enPassantTarget).toBe(16);
      doublePushMover.undo(board);
      expect(board.enPassantTarget).toBe(-1);
    });

    it('sets en passant target for black', () => {
      board = new Board('rnbqkbnr/pppppppp/8/8/8/4P3/PPPP1PPP/RNBQKBNR b KQkq -');
      const doublePushMover = new DoublePushMover(new Mover(50, 34));
      doublePushMover.move(board);
      expect(board.enPassantTarget).toBe(42);
      doublePushMover.undo(board);
      expect(board.enPassantTarget).toBe(-1);
    });

    it('overwrites en passant target after back-to-back double-push', () => {
      board = new Board('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3');
      expect(board.enPassantTarget).toBe(20);
      const mover = new DoublePushMover(new Mover(50, 34)); // sicilian
      mover.move(board);
      expect(board.enPassantTarget).toBe(42);
      mover.undo(board);
      expect(board.enPassantTarget).toBe(20);
    });
  });

  describe('RookMover', () => {
    it('clears short castling for white', () => {
      const board = new Board('rnbqkbnr/2pp1pp1/1p6/p3p2p/P6P/2N3P1/1PPPPP2/R1BQKBNR w KQkq -');
      const rookMover = new RookMover(new Mover(7, 15), 'K');
      rookMover.move(board);
      expect(board.castling).toBe('Qkq');
      expect(board.at(7)).toBe('_');
      expect(board.at(15)).toBe('R');
      expect(board.isWhiteToMove).toBe(false);
      rookMover.undo(board);
      expect(board.castling).toBe('KQkq');
      expect(board.at(7)).toBe('R');
      expect(board.at(15)).toBe('_');
      expect(board.isWhiteToMove).toBe(true);
    });

    it('clears long castling for white', () => {
      const board = new Board('rnbqkbnr/2pp1pp1/1p6/p3p2p/P6P/2N3P1/1PPPPP2/R1BQKBNR w KQkq -');
      const rookMover = new RookMover(new Mover(0, 1), 'Q');
      rookMover.move(board);
      expect(board.castling).toBe('Kkq');
      expect(board.at(0)).toBe('_');
      expect(board.at(1)).toBe('R');
      rookMover.undo(board);
      expect(board.castling).toBe('KQkq');
      expect(board.at(0)).toBe('R');
      expect(board.at(1)).toBe('_');
    });

    it('clears short castling for black', () => {
      const board = new Board('rnbqkbnr/2pp1pp1/1p6/p3p2p/P6P/2N1P1P1/1PPP1P2/R1BQKBNR b KQkq -');
      const rookMover = new RookMover(new Mover(63, 55), 'k');
      rookMover.move(board);
      expect(board.castling).toBe('KQq');
      expect(board.at(63)).toBe('_');
      expect(board.at(55)).toBe('r');
      rookMover.undo(board);
      expect(board.castling).toBe('KQkq');
      expect(board.at(63)).toBe('r');
      expect(board.at(55)).toBe('_');
    });

    it('clears long castling for black', () => {
      const board = new Board('rnbqkbnr/2pp1pp1/1p6/p3p2p/P6P/2N1P1P1/1PPP1P2/R1BQKBNR b KQkq -');
      const rookMover = new RookMover(new Mover(56, 48), 'q');
      rookMover.move(board);
      expect(board.castling).toBe('KQk');
      expect(board.at(56)).toBe('_');
      expect(board.at(48)).toBe('r');
      rookMover.undo(board);
      expect(board.castling).toBe('KQkq');
      expect(board.at(56)).toBe('r');
      expect(board.at(48)).toBe('_');
    });
  });

  describe('KingMover', () => {
    it('clears castling for white', () => {
      const board = new Board('rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6');
      const kingMover = new KingMover(new Mover(4, 12), 'KQ');
      kingMover.move(board);
      expect(board.castling).toBe('kq');
      expect(board.at(4)).toBe('_');
      expect(board.at(12)).toBe('K');
      expect(board.isWhiteToMove).toBe(false);
      kingMover.undo(board);
      expect(board.castling).toBe('KQkq');
      expect(board.at(4)).toBe('K');
      expect(board.at(12)).toBe('_');
      expect(board.isWhiteToMove).toBe(true);
    });

    it('clears castling for black', () => {
      const board = new Board('rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPPKPPP/RNBQ1BNR b kq -');
      const kingMover = new KingMover(new Mover(60, 52), 'kq');
      kingMover.move(board);
      expect(board.castling).toBe('-');
      expect(board.at(60)).toBe('_');
      expect(board.at(52)).toBe('k');
      expect(board.isWhiteToMove).toBe(true);
      kingMover.undo(board);
      expect(board.castling).toBe('kq');
      expect(board.at(60)).toBe('k');
      expect(board.at(52)).toBe('_');
      expect(board.isWhiteToMove).toBe(false);
    });
  });

  describe('CastlingMover', () => {
    let board;
    beforeEach(() => {
      board = new Board('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
    });

    it('white short castle', () => {
      const castlingMover = new CastlingMover(new KingMover(new Mover(4, 6), 'KQ'), new Mover(7, 5));
      castlingMover.move(board);

      expect(board.at(4)).toBe('_');
      expect(board.at(5)).toBe('R');
      expect(board.at(6)).toBe('K');
      expect(board.at(7)).toBe('_');
      expect(board.castling).toBe('kq');
      expect(board.isWhiteToMove).toBe(false);

      castlingMover.undo(board);

      expect(board.at(4)).toBe('K');
      expect(board.at(5)).toBe('_');
      expect(board.at(6)).toBe('_');
      expect(board.at(7)).toBe('R');
      expect(board.castling).toBe('KQkq');
      expect(board.isWhiteToMove).toBe(true);
    });

    it('white long castle', () => {
      const castlingMover = new CastlingMover(new KingMover(new Mover(4, 2), 'KQ'), new Mover(0, 3));
      castlingMover.move(board);

      expect(board.at(0)).toBe('_');
      expect(board.at(1)).toBe('_');
      expect(board.at(2)).toBe('K');
      expect(board.at(3)).toBe('R');
      expect(board.at(4)).toBe('_');
      expect(board.castling).toBe('kq');

      castlingMover.undo(board);

      expect(board.at(0)).toBe('R');
      expect(board.at(1)).toBe('_');
      expect(board.at(2)).toBe('_');
      expect(board.at(3)).toBe('_');
      expect(board.at(4)).toBe('K');
      expect(board.castling).toBe('KQkq');
    });

    it('black short castle', () => {
      board = new Board('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R b KQkq - 0 1');
      const castlingMover = new CastlingMover(new KingMover(new Mover(4 + 7 * 8, 6 + 7 * 8), 'kq'), new Mover(7 + 7 * 8, 5 + 7 * 8));
      castlingMover.move(board);

      expect(board.at(4 + 7 * 8)).toBe('_');
      expect(board.at(5 + 7 * 8)).toBe('r');
      expect(board.at(6 + 7 * 8)).toBe('k');
      expect(board.at(7 + 7 * 8)).toBe('_');
      expect(board.castling).toBe('KQ');
      expect(board.isWhiteToMove).toBe(true);

      castlingMover.undo(board);

      expect(board.at(4 + 7 * 8)).toBe('k');
      expect(board.at(5 + 7 * 8)).toBe('_');
      expect(board.at(6 + 7 * 8)).toBe('_');
      expect(board.at(7 + 7 * 8)).toBe('r');
      expect(board.castling).toBe('KQkq');
      expect(board.isWhiteToMove).toBe(false);
    });

    it('black long castle', () => {
      board = new Board('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R b KQkq - 0 1');
      const castlingMover = new CastlingMover(new KingMover(new Mover(4 + 7 * 8, 2 + 7 * 8), 'kq'), new Mover(0 + 7 * 8, 3 + 7 * 8));
      castlingMover.move(board);

      expect(board.at(0 + 7 * 8)).toBe('_');
      expect(board.at(1 + 7 * 8)).toBe('_');
      expect(board.at(2 + 7 * 8)).toBe('k');
      expect(board.at(3 + 7 * 8)).toBe('r');
      expect(board.at(4 + 7 * 8)).toBe('_');
      expect(board.castling).toBe('KQ');
      expect(board.isWhiteToMove).toBe(true);

      castlingMover.undo(board);

      expect(board.at(0 + 7 * 8)).toBe('r');
      expect(board.at(1 + 7 * 8)).toBe('_');
      expect(board.at(2 + 7 * 8)).toBe('_');
      expect(board.at(3 + 7 * 8)).toBe('_');
      expect(board.at(4 + 7 * 8)).toBe('k');
      expect(board.castling).toBe('KQkq');
      expect(board.isWhiteToMove).toBe(false);
    });
  });

  describe('EnPassantMover', () => {
    it('white en passant left', () => {
      const board = new Board('r1bq1r2/pp2n3/4N2k/3pPppP/1b1n2Q1/2N5/PP3PP1/R1B1K2R w KQ g6 0 15');
      const from = 7 + 4 * 8;
      const to = 6 + 5 * 8;
      const enPassantMover = new EnPassantMover(from, to);
      enPassantMover.move(board);

      expect(board.at(from)).toBe('_');
      expect(board.at(to)).toBe('P');
      expect(board.at(to - 8)).toBe('_');
      expect(board.enPassantTarget).toBe(-1);

      enPassantMover.undo(board);

      expect(board.at(from)).toBe('P');
      expect(board.at(to)).toBe('_');
      expect(board.at(to - 8)).toBe('p');
      expect(board.enPassantTarget).toBe(to);
    });

    it('white en passant right', () => {
      const board = new Board('2r1qb1r/3n2pp/k2N4/PppPp3/1Q2n1b1/5N2/1PP3PP/R1B1K2R w KQ b6 0 15');
      const from = 4 * 8;
      const to = 1 + 5 * 8;
      const enPassantMover = new EnPassantMover(from, to);
      enPassantMover.move(board);

      expect(board.at(from)).toBe('_');
      expect(board.at(to)).toBe('P');
      expect(board.at(to - 8)).toBe('_');
      expect(board.enPassantTarget).toBe(-1);

      enPassantMover.undo(board);

      expect(board.at(from)).toBe('P');
      expect(board.at(to)).toBe('_');
      expect(board.at(to - 8)).toBe('p');
      expect(board.enPassantTarget).toBe(to);
    });

    it('black en passant left', () => {
      const board = new Board('5r2/1n6/2p3k1/b1Pb3p/P2PpPpP/Q3P1P1/1B4KR/4q3 b - f3 0 38');
      const from = 6 + 3 * 8;
      const to = 5 + 2 * 8;
      const enPassantMover = new EnPassantMover(from, to);
      enPassantMover.move(board);

      expect(board.at(from)).toBe('_');
      expect(board.at(to)).toBe('p');
      expect(board.at(to + 8)).toBe('_');
      expect(board.enPassantTarget).toBe(-1);

      enPassantMover.undo(board);

      expect(board.at(from)).toBe('p');
      expect(board.at(to)).toBe('_');
      expect(board.at(to + 8)).toBe('P');
      expect(board.enPassantTarget).toBe(to);
    });

    it('black en passant right', () => {
      const board = new Board('5r2/1n6/2p3k1/b1Pb3p/P2PpPpP/Q3P1P1/1B4KR/4q3 b - f3 0 38');
      const from = 4 + 3 * 8;
      const to = 5 + 2 * 8;
      const enPassantMover = new EnPassantMover(from, to);
      enPassantMover.move(board);

      expect(board.at(from)).toBe('_');
      expect(board.at(to)).toBe('p');
      expect(board.at(to + 8)).toBe('_');
      expect(board.enPassantTarget).toBe(-1);

      enPassantMover.undo(board);

      expect(board.at(from)).toBe('p');
      expect(board.at(to)).toBe('_');
      expect(board.at(to + 8)).toBe('P');
      expect(board.enPassantTarget).toBe(to);
    });
  });

  describe('PromotionMover', () => {
    let board;
    beforeEach(() => {
      board = new Board('r1n5/1P6/8/3k4/8/3K4/6p1/5R1N w KQkq - 0 1');
    });

    it('white promote push', () => {
      const from = 1 + 6 * 8;
      const to = 1 + 7 * 8;
      const promotionMover = new PromotionMover(from, to, 'Q');
      promotionMover.move(board);

      expect(board.at(to)).toBe('Q');
      expect(board.at(from)).toBe('_');

      promotionMover.undo(board);

      expect(board.at(to)).toBe('_');
      expect(board.at(from)).toBe('P');
    });

    it('white promote capture left', () => {
      const from = 1 + 6 * 8;
      const to = 0 + 7 * 8;
      const promotionMover = new PromotionMover(from, to, 'Q');
      promotionMover.move(board);

      expect(board.at(to)).toBe('Q');
      expect(board.at(from)).toBe('_');

      promotionMover.undo(board);

      expect(board.at(to)).toBe('r');
      expect(board.at(from)).toBe('P');
    });

    it('white promote capture right', () => {
      const from = 1 + 6 * 8;
      const to = 2 + 7 * 8;
      const promotionMover = new PromotionMover(from, to, 'Q');
      promotionMover.move(board);

      expect(board.at(to)).toBe('Q');
      expect(board.at(from)).toBe('_');

      promotionMover.undo(board);

      expect(board.at(to)).toBe('n');
      expect(board.at(from)).toBe('P');
    });

    it('black promote push', () => {
      const from = 6 + 8;
      const to = 6;
      const promotionMover = new PromotionMover(from, to, 'q');
      promotionMover.move(board);

      expect(board.at(to)).toBe('q');
      expect(board.at(from)).toBe('_');

      promotionMover.undo(board);

      expect(board.at(to)).toBe('_');
      expect(board.at(from)).toBe('p');
    });

    it('black promote capture left', () => {
      const from = 6 + 8;
      const to = 5;
      const promotionMover = new PromotionMover(from, to, 'q');
      promotionMover.move(board);

      expect(board.at(to)).toBe('q');
      expect(board.at(from)).toBe('_');

      promotionMover.undo(board);

      expect(board.at(to)).toBe('R');
      expect(board.at(from)).toBe('p');
    });

    it('black promote capture right', () => {
      const from = 6 + 8;
      const to = 7;
      const promotionMover = new PromotionMover(from, to, 'q');
      promotionMover.move(board);

      expect(board.at(to)).toBe('q');
      expect(board.at(from)).toBe('_');

      promotionMover.undo(board);

      expect(board.at(to)).toBe('N');
      expect(board.at(from)).toBe('p');
    });
  });
});
