import { MoveGenerator } from './move_generator';
import { EnPassantMover, IMover, Mover } from './mover';
import { Board } from './board';

describe('Perft', () => {
  let generator: MoveGenerator = new MoveGenerator();
  let board: Board;

  const perft = (depth: number) => {
    let nodes = 0;
    if (depth === 0) return 1;

    const movers = generator.generate(board);
    for (const mover of movers) {
      mover.move(board);
      const newNodes = perft(depth - 1);
      nodes += newNodes;
      mover.undo(board);
    }
    return nodes;
  };
  it('initial position', () => {
    board = new Board('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    const result = perft(5);
    expect(result).toBe(4865609);
  });

  it('Kiwipete', () => {
    board = new Board('r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq -');
    const result = perft(4);
    expect(result).toBe(4085603);
  });

  it('Position 3', () => {
    board = new Board('8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - -');
    const result = perft(4);
    expect(result).toBe(43238);
  });

  it('Position 4', () => {
    board = new Board('r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1');
    const result = perft(4);
    expect(result).toBe(422333);
  });

  it('Position 4 mirrored', () => {
    board = new Board('r2q1rk1/pP1p2pp/Q4n2/bbp1p3/Np6/1B3NBn/pPPP1PPP/R3K2R b KQ - 0 1');
    const result = perft(4);
    expect(result).toBe(422333);
  });

  it('Position 5', () => {
    board = new Board('rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8');
    const result = perft(4);
    expect(result).toBe(2103487);
  });

  it('Position 6', () => {
    board = new Board('r4rk1/1pp1qppp/p1np1n2/2b1p1B1/2B1P1b1/P1NP1N2/1PP1QPPP/R4RK1 w - - 0 10');
    const result = perft(4);
    expect(result).toBe(3894594);
  });
});

describe('MoveGenerator', () => {
  let generator: MoveGenerator;
  let board: Board;

  beforeEach(() => {
    generator = new MoveGenerator();
    board = new Board('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  });

  const serializeMoves = (moves) => moves.map((m) => `${m.from} => ${m.to}`);

  it('hopeless end game', () => {
    board = new Board('5Q2/8/6k1/5R2/8/6P1/6PP/6K1 b - -');
    const actual: IMover[] = generator.generate(board);
    const expected: IMover[] = [new Mover(46, 55)];
    expect(serializeMoves(actual)).toEqual(jasmine.arrayContaining(serializeMoves(expected)));
  });

  it('random middle game exposed map bug', () => {
    board = new Board('1r4nr/6pp/5p2/P1R5/3P1P2/k1N5/P5PP/6K1 b - -');
    const actual: IMover[] = generator.generate(board);
    const expected: IMover[] = [new Mover(62, 52)];
    expect(serializeMoves(actual)).toEqual(jasmine.arrayContaining(serializeMoves(expected)));
  });

  it('generates checkmate saving move', () => {
    board = new Board('4Rbnr/3n1ppp/4k3/1p1NB3/4P3/5N2/1PP2PPP/6K1 b - -');
    const actual: IMover[] = generator.generate(board);
    const expected: IMover[] = [new Mover(61, 52)];
    expect(serializeMoves(actual)).toEqual(jasmine.arrayContaining(serializeMoves(expected)));
  });

  it('generates white pawn promotion push moves', () => {
    board = new Board('rnbq2nr/pppkbP1p/3p2p1/4p3/3P4/5N2/PPP2PPP/RNBQKB1R w KQ -');
    const actual: IMover[] = generator.generate(board);
    const expected: IMover[] = [new Mover(53, 61)];
    expect(serializeMoves(actual)).toEqual(jasmine.arrayContaining(serializeMoves(expected)));
    const seen = [];
    const promotionPushes = actual.filter((m) => m.from === 53 && m.to === 61);
    promotionPushes.forEach((p) => {
      p.move(board);
      seen.push(board.at(61));
      expect(board.at(61)).not.toBe('_');
      expect(board.at(53)).toBe('_');
      p.undo(board);
      expect(board.at(61)).toBe('_');
      expect(board.at(53)).toBe('P');
    });
    expect(seen.sort().join('')).toBe('BNQR');
  });

  it('generates white pawn promotion capture right moves', () => {
    board = new Board('rnbq2nr/pppkbP1p/3p2p1/4p3/3P4/5N2/PPP2PPP/RNBQKB1R w KQ -');
    const actual: IMover[] = generator.generate(board);
    const expected: IMover[] = [new Mover(53, 62)];
    expect(serializeMoves(actual)).toEqual(jasmine.arrayContaining(serializeMoves(expected)));
    const seen = [];
    const promotionPushes = actual.filter((m) => m.from === 53 && m.to === 62);
    promotionPushes.forEach((p) => {
      p.move(board);
      seen.push(board.at(62));
      expect(board.at(62)).not.toBe('_');
      expect(board.at(53)).toBe('_');
      p.undo(board);
      expect(board.at(62)).toBe('n');
      expect(board.at(53)).toBe('P');
    });
    expect(seen.sort().join('')).toBe('BNQR');
  });

  it('generates white pawn promotion capture left moves', () => {
    board = new Board('rnb1kb1r/p1Ppqppp/1p3n2/4p3/8/8/PPP1PPPP/RNBQKBNR w KQkq -');
    const actual: IMover[] = generator.generate(board);
    const expected: IMover[] = [new Mover(50, 57)];
    expect(serializeMoves(actual)).toEqual(jasmine.arrayContaining(serializeMoves(expected)));
    const seen = [];
    const promotionPushes = actual.filter((m) => m.from === 50 && m.to === 57);
    promotionPushes.forEach((p) => {
      p.move(board);
      seen.push(board.at(57));
      expect(board.at(57)).not.toBe('_');
      expect(board.at(50)).toBe('_');
      p.undo(board);
      expect(board.at(57)).toBe('n');
      expect(board.at(50)).toBe('P');
    });
    expect(seen.sort().join('')).toBe('BNQR');
  });

  it('generates black pawn promotion push moves', () => {
    board = new Board('rnbqkbnr/ppppp1pp/8/4P3/8/5P1N/PPPP2pP/RNBQKB1R b KQkq -');
    const actual: IMover[] = generator.generate(board);
    const expected: IMover[] = [new Mover(14, 6)];
    expect(serializeMoves(actual)).toEqual(jasmine.arrayContaining(serializeMoves(expected)));
    const seen = [];
    const promotionPushes = actual.filter((m) => m.from === 14 && m.to === 6);
    promotionPushes.forEach((p) => {
      p.move(board);
      seen.push(board.at(6));
      expect(board.at(6)).not.toBe('_');
      expect(board.at(14)).toBe('_');
      p.undo(board);
      expect(board.at(6)).toBe('_');
      expect(board.at(14)).toBe('p');
    });
    expect(seen.sort().join('')).toBe('bnqr');
  });

  it('generates black pawn promotion capture right moves', () => {
    board = new Board('rnbqkbnr/ppppp1pp/8/4P3/8/5P1N/PPPP2pP/RNBQKB1R b KQkq -');
    const actual: IMover[] = generator.generate(board);
    const expected: IMover[] = [new Mover(14, 7)];
    expect(serializeMoves(actual)).toEqual(jasmine.arrayContaining(serializeMoves(expected)));
    const seen = [];
    const promotionPushes = actual.filter((m) => m.from === 14 && m.to === 7);
    promotionPushes.forEach((p) => {
      p.move(board);
      seen.push(board.at(7));
      expect(board.at(7)).not.toBe('_');
      expect(board.at(14)).toBe('_');
      p.undo(board);
      expect(board.at(7)).toBe('R');
      expect(board.at(14)).toBe('p');
    });
    expect(seen.sort().join('')).toBe('bnqr');
  });

  it('generates black pawn promotion capture left moves', () => {
    board = new Board('rnbqkbnr/ppppp1pp/8/4P3/8/5P1N/PPPP2pP/RNBQKB1R b KQkq -');
    const actual: IMover[] = generator.generate(board);
    const expected: IMover[] = [new Mover(14, 5)];
    expect(serializeMoves(actual)).toEqual(jasmine.arrayContaining(serializeMoves(expected)));
    const seen = [];
    const promotionPushes = actual.filter((m) => m.from === 14 && m.to === 5);
    promotionPushes.forEach((p) => {
      p.move(board);
      seen.push(board.at(5));
      expect(board.at(5)).not.toBe('_');
      expect(board.at(14)).toBe('_');
      p.undo(board);
      expect(board.at(5)).toBe('B');
      expect(board.at(14)).toBe('p');
    });
    expect(seen.sort().join('')).toBe('bnqr');
  });

  it('generates white pawn push moves', () => {
    const actual: IMover[] = generator.generate(board);
    const expected: IMover[] = [...Array(8).keys()]
      .map((i) => new Mover(i + 8, i + 16))
      .concat([...Array(8).keys()].map((i) => new Mover(i + 8, i + 24)));
    expect(serializeMoves(actual)).toEqual(jasmine.arrayContaining(serializeMoves(expected)));
  });

  it('generates black pawn push moves', () => {
    board = new Board('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq -');
    const actual: IMover[] = generator.generate(board);
    const expected: IMover[] = [...Array(8).keys()]
      .map((i) => new Mover(i + 48, i + 40))
      .concat([...Array(8).keys()].map((i) => new Mover(i + 48, i + 32)));
    expect(serializeMoves(actual)).toEqual(jasmine.arrayContaining(serializeMoves(expected)));
  });

  it('generates white pawn capture moves', () => {
    board = new Board('rnbqkbnr/pp1p1ppp/8/2p1p3/3PP3/8/PPP2PPP/RNBQKBNR w KQkq -');
    const actual: IMover[] = generator.generate(board);
    const expected: IMover[] = [new Mover(27, 34), new Mover(27, 36)];
    expect(serializeMoves(actual)).toEqual(jasmine.arrayContaining(serializeMoves(expected)));
  });

  it('generates black pawn capture moves', () => {
    board = new Board('rnbqkbnr/ppppp1pp/8/5p2/4P1P1/8/PPPP1P1P/RNBQKBNR b KQkq g3');
    const start = board.fen;
    const actual: IMover[] = generator.generate(board);
    const expected: IMover[] = [new Mover(37, 28), new Mover(37, 30)];
    expect(serializeMoves(actual)).toEqual(jasmine.arrayContaining(serializeMoves(expected)));
    const captureMover = actual.filter((m) => m.from === 37 && m.to === 28)[0];
    captureMover.move(board);
    captureMover.undo(board);
    expect(board.fen).toContain(start);
  });

  it('generates white double push moves', () => {
    board = new Board('rnbqkbnr/pp1p1ppp/8/2p1p3/3PP3/8/PPP2PPP/RNBQKBNR w KQkq -');
    const actual: IMover[] = generator.generate(board);
    const doublePush = actual.filter((m) => m.from === 8 && m.to - m.from === 16)[0];
    doublePush.move(board);
    expect(board.enPassantTarget).toBe(doublePush.from + 8);
    doublePush.undo(board);
    expect(board.enPassantTarget).toBe(-1);
  });

  it('generates black double push moves', () => {
    board = new Board('rnbqkbnr/pppppppp/8/8/8/4P3/PPPP1PPP/RNBQKBNR b KQkq -');
    const actual: IMover[] = generator.generate(board);
    const doublePush = actual.filter((m) => m.from === 55 && m.from - m.to === 16)[0];
    doublePush.move(board);
    expect(board.enPassantTarget).toBe(doublePush.from - 8);
    doublePush.undo(board);
    expect(board.enPassantTarget).toBe(-1);
  });

  it('generates white en passant left', () => {
    board = new Board('r3k2r/p2pqpb1/bn2pnp1/2pPN3/1p2P3/P1N2Q1p/1PPBBPPP/R3K2R w KQkq c6');
    expect(board.enPassantTarget).toBe(42);
    const actual: IMover[] = generator.generate(board);
    const from = 35;
    const to = 42;
    const expected: IMover[] = [new EnPassantMover(from, to)];
    expect(serializeMoves(actual)).toEqual(jasmine.arrayContaining(serializeMoves(expected)));
    const enPassantMover = actual.filter((m) => m.from === from && m.to === to)[0];
    enPassantMover.move(board);
    expect(board.at(to - 8)).toBe('_');
  });

  it('generates white en passant right', () => {
    board = new Board('rnbqkbnr/ppp1p1pp/8/3pPp2/8/8/PPPP1PPP/RNBQKBNR w KQkq f6');
    const actual: IMover[] = generator.generate(board);
    const from = 36;
    const to = 45;
    const expected: IMover[] = [new EnPassantMover(from, to)];
    expect(serializeMoves(actual)).toEqual(jasmine.arrayContaining(serializeMoves(expected)));
    const enPassantMover = actual.filter((m) => m.from === from && m.to === to)[0];
    enPassantMover.move(board);
    expect(board.at(to - 8)).toBe('_');
  });

  it('generates black en passant left', () => {
    board = new Board('rnbqkbnr/pppp1ppp/8/8/3Pp3/4PP2/PPP3PP/RNBQKBNR b KQkq d3');
    const actual: IMover[] = generator.generate(board);
    const from = 28;
    const to = 19;
    const expected: IMover[] = [new EnPassantMover(from, to)];
    expect(serializeMoves(actual)).toEqual(jasmine.arrayContaining(serializeMoves(expected)));
    const enPassantMover = actual.filter((m) => m.from === from && m.to === to)[0];
    enPassantMover.move(board);
    expect(board.at(to + 8)).toBe('_');
  });

  it('generates black en passant right', () => {
    board = new Board('rnbqkbnr/ppp1pppp/8/8/3pP3/2PP4/PP3PPP/RNBQKBNR b KQkq e3');
    const actual: IMover[] = generator.generate(board);
    const from = 27;
    const to = 20;
    const expected: IMover[] = [new EnPassantMover(from, to)];
    expect(serializeMoves(actual)).toEqual(jasmine.arrayContaining(serializeMoves(expected)));
    const enPassantMover = actual.filter((m) => m.from === from && m.to === to)[0];
    enPassantMover.move(board);
    expect(board.at(to + 8)).toBe('_');
  });

  it('generates white knight moves from center', () => {
    board = new Board('rnbqkbnr/pp6/6p1/4p3/8/5N1p/PPP5/RNBQKB1R w KQkq -');
    const actual: IMover[] = generator.generate(board);
    const from = 21;
    const expected: IMover[] = [11, 27, 36, 38, 31, 15, 6].map((to) => new Mover(from, to));
    expect(serializeMoves(actual)).toEqual(jasmine.arrayContaining(serializeMoves(expected)));
    expect(serializeMoves(actual.filter((m) => m.from === from).sort((a, b) => a.to - b.to)).toString()).toEqual(
      serializeMoves(expected.sort((a, b) => a.to - b.to)).toString(),
    );
  });

  it('generates white knight moves from edge', () => {
    board = new Board('rnbqkbnr/pp6/6p1/4p3/8/7p/PPP5/RNBQKBNR w KQkq -');
    const actual: IMover[] = generator.generate(board);
    const from = 6;
    const expected: IMover[] = [12, 21, 23].map((to) => new Mover(from, to));
    expect(serializeMoves(actual)).toEqual(jasmine.arrayContaining(serializeMoves(expected)));
    expect(serializeMoves(actual.filter((m) => m.from === from).sort((a, b) => a.to - b.to)).toString()).toEqual(
      serializeMoves(expected.sort((a, b) => a.to - b.to)).toString(),
    );
  });

  it('generates black knight moves from center', () => {
    board = new Board('r1bqkbnr/ppp1pppp/2n5/3pP3/3P4/8/PPP2PPP/RNBQKBNR b KQkq -');
    const actual: IMover[] = generator.generate(board);
    const from = 42;
    const expected: IMover[] = [57, 32, 25, 27, 36].map((to) => new Mover(from, to));
    expect(serializeMoves(actual)).toEqual(jasmine.arrayContaining(serializeMoves(expected)));
    expect(serializeMoves(actual.filter((m) => m.from === from).sort((a, b) => a.to - b.to)).toString()).toEqual(
      serializeMoves(expected.sort((a, b) => a.to - b.to)).toString(),
    );
  });

  it('generates black knight moves from edge', () => {
    board = new Board('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3');
    const actual: IMover[] = generator.generate(board);
    const from = 57;
    const expected: IMover[] = [40, 42].map((to) => new Mover(from, to));
    expect(serializeMoves(actual)).toEqual(jasmine.arrayContaining(serializeMoves(expected)));
    expect(serializeMoves(actual.filter((m) => m.from === from).sort((a, b) => a.to - b.to)).toString()).toEqual(
      serializeMoves(expected.sort((a, b) => a.to - b.to)).toString(),
    );
  });

  it('generates white bishop moves', () => {
    board = new Board('rnbqkbnr/p1pp3p/8/1pP1p1p1/5p2/4P1PP/PP1P1P2/RNBQKBNR w KQkq -');
    const actual: IMover[] = generator.generate(board);
    const from = 5;
    const expected: IMover[] = [12, 19, 26, 33, 14].map((to) => new Mover(from, to));
    expect(serializeMoves(actual)).toEqual(jasmine.arrayContaining(serializeMoves(expected)));
    expect(serializeMoves(actual.filter((m) => m.from === from).sort((a, b) => a.to - b.to)).toString()).toEqual(
      serializeMoves(expected.sort((a, b) => a.to - b.to)).toString(),
    );
  });

  it('generates black bishop moves', () => {
    board = new Board('rnbqkbnr/p1pp4/7p/1pP1p1p1/5pPP/4P3/PP1P1P2/RNBQKBNR b KQkq -');
    const actual: IMover[] = generator.generate(board);
    const from = 61;
    const expected: IMover[] = [52, 43, 34, 54].map((to) => new Mover(from, to));
    expect(serializeMoves(actual)).toEqual(jasmine.arrayContaining(serializeMoves(expected)));
    expect(serializeMoves(actual.filter((m) => m.from === from).sort((a, b) => a.to - b.to)).toString()).toEqual(
      serializeMoves(expected.sort((a, b) => a.to - b.to)).toString(),
    );
  });

  it('generates white rook moves', () => {
    board = new Board('r1bqk1nr/ppp4p/2np1p2/2b1p1P1/2B1P2R/5N2/PPPP1PP1/RNBQK3 w Qkq -');
    const actual: IMover[] = generator.generate(board);
    const from = 31;
    const expected: IMover[] = [23, 15, 7, 30, 29, 39, 47, 55].map((to) => new Mover(from, to));
    expect(serializeMoves(actual)).toEqual(jasmine.arrayContaining(serializeMoves(expected)));
    expect(serializeMoves(actual.filter((m) => m.from === from).sort((a, b) => a.to - b.to)).toString()).toEqual(
      serializeMoves(expected.sort((a, b) => a.to - b.to)).toString(),
    );
  });

  it('generates black rook moves', () => {
    board = new Board('rnbqkbn1/pp2ppp1/2p4r/4P2P/3p3P/2N5/PPPP1P2/R1BQKBNR b KQkq h3');
    const actual: IMover[] = generator.generate(board);
    const from = 47;
    const expected: IMover[] = [55, 63, 46, 45, 44, 43, 39].map((to) => new Mover(from, to));
    expect(serializeMoves(actual)).toEqual(jasmine.arrayContaining(serializeMoves(expected)));
    expect(serializeMoves(actual.filter((m) => m.from === from).sort((a, b) => a.to - b.to)).toString()).toEqual(
      serializeMoves(expected.sort((a, b) => a.to - b.to)).toString(),
    );
  });

  it('generates white queen moves', () => {
    board = new Board('rnbqkbnr/ppp2pp1/3p4/4p2p/3PP1Q1/8/PPP2PPP/RNB1KBNR w KQkq h6');
    const actual: IMover[] = generator.generate(board);
    const from = 30;
    const expected: IMover[] = [21, 12, 3, 23, 39, 37, 44, 51, 58, 22, 29, 31, 38, 46, 54].map((to) => new Mover(from, to));
    expect(serializeMoves(actual)).toEqual(jasmine.arrayContaining(serializeMoves(expected)));
    expect(serializeMoves(actual.filter((m) => m.from === from).sort((a, b) => a.to - b.to)).toString()).toEqual(
      serializeMoves(expected.sort((a, b) => a.to - b.to)).toString(),
    );
  });

  it('generates black queen moves', () => {
    board = new Board('rnb1k1nr/pppp1ppp/4p3/2b5/2B1P2q/3P3P/PPP2PP1/RNBQK1NR b KQkq -');
    const actual: IMover[] = generator.generate(board);
    const from = 31;
    const expected: IMover[] = [23, 22, 13, 30, 29, 28, 38, 45, 52, 59, 39, 47].map((to) => new Mover(from, to));
    expect(serializeMoves(actual)).toEqual(jasmine.arrayContaining(serializeMoves(expected)));
    expect(serializeMoves(actual.filter((m) => m.from === from).sort((a, b) => a.to - b.to)).toString()).toEqual(
      serializeMoves(expected.sort((a, b) => a.to - b.to)).toString(),
    );
  });

  it('generates white king moves', () => {
    board = new Board('rnbqkbnr/ppp3pp/3p4/4p3/4P3/N1P2p1P/PP1PKPP1/R1BQ1BNR w kq -');
    const actual: IMover[] = generator.generate(board);
    const from = 12;
    const expected: IMover[] = [4, 19, 20, 21].map((to) => new Mover(from, to));
    expect(serializeMoves(actual)).toEqual(jasmine.arrayContaining(serializeMoves(expected)));
    expect(serializeMoves(actual.filter((m) => m.from === from).sort((a, b) => a.to - b.to)).toString()).toEqual(
      serializeMoves(expected.sort((a, b) => a.to - b.to)).toString(),
    );
  });

  it('generates black king moves', () => {
    board = new Board('rnbq1bnr/pp2k2p/5Np1/2ppp3/4P3/N1P2K1P/PP1P1PP1/R1BQ1B1R b - -');
    const actual: IMover[] = generator.generate(board);
    const from = 52;
    const expected: IMover[] = [53, 45, 44, 43].map((to) => new Mover(from, to));
    expect(serializeMoves(actual)).toEqual(jasmine.arrayContaining(serializeMoves(expected)));
    expect(serializeMoves(actual.filter((m) => m.from === from).sort((a, b) => a.to - b.to)).toString()).toEqual(
      serializeMoves(expected.sort((a, b) => a.to - b.to)).toString(),
    );
  });

  it('generates white king short castle', () => {
    board = new Board('r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq -');
    const actual: IMover[] = generator.generate(board);
    const from = 4;
    const expected: IMover[] = [6].map((to) => new Mover(from, to));
    expect(serializeMoves(actual)).toEqual(jasmine.arrayContaining(serializeMoves(expected)));
    const [shortCastleMover] = actual.filter((m) => m.from === 4 && m.to === 6);
    shortCastleMover.move(board);
    expect(board.at(4)).toBe('_');
    expect(board.at(5)).toBe('R');
    expect(board.at(6)).toBe('K');
    expect(board.at(7)).toBe('_');
    expect(board.castling).toBe('kq');
    shortCastleMover.undo(board);
    expect(board.at(4)).toBe('K');
    expect(board.at(5)).toBe('_');
    expect(board.at(6)).toBe('_');
    expect(board.at(7)).toBe('R');
    expect(board.castling).toBe('KQkq');
  });

  it('does not generate castle through check', () => {
    board = new Board('rn1qk1nr/ppp2ppp/8/3pp3/1b2P3/5NPb/PPPPBP1P/RNBQK2R w KQkq -');
    const actual: IMover[] = generator.generate(board);
    const expected: IMover[] = [new Mover(4, 6)];
    expect(serializeMoves(actual)).not.toEqual(jasmine.arrayContaining(serializeMoves(expected)));
  });

  it('clears castling if rook captured', () => {
    board = new Board('rnbq1k1r/pp1Pbppp/2p5/8/2B5/P7/1PP1NnPP/RNBQK2R b KQ -');
    const [knightCaptureRook] = generator.generate(board).filter((m) => m.from === 13 && m.to === 7);
    knightCaptureRook.move(board);
    expect(board.castling).toBe('Q');
  });

  it('generates white king long castle', () => {
    board = new Board('rnb1kb1r/ppp2ppp/3qpn2/3p4/3P1B2/2NQ4/PPP1PPPP/R3KBNR w KQkq -');
    const actual: IMover[] = generator.generate(board);
    const from = 4;
    const expected: IMover[] = [2].map((to) => new Mover(from, to));
    expect(serializeMoves(actual)).toEqual(jasmine.arrayContaining(serializeMoves(expected)));
    const [longCastleMover] = actual.filter((m) => m.from === 4 && m.to === 2);
    longCastleMover.move(board);
    expect(board.at(0)).toBe('_');
    expect(board.at(1)).toBe('_');
    expect(board.at(2)).toBe('K');
    expect(board.at(3)).toBe('R');
    expect(board.at(4)).toBe('_');
    expect(board.castling).toBe('kq');
    longCastleMover.undo(board);
    expect(board.at(0)).toBe('R');
    expect(board.at(1)).toBe('_');
    expect(board.at(2)).toBe('_');
    expect(board.at(3)).toBe('_');
    expect(board.at(4)).toBe('K');
    expect(board.castling).toBe('KQkq');
  });

  it('generates black king short castle', () => {
    board = new Board('rnbqk2r/pppp1ppp/5n2/2b1p3/2B1P3/5N2/PPPPQPPP/RNB1K2R b KQkq -');
    const actual: IMover[] = generator.generate(board);
    const from = 60;
    const expected: IMover[] = [62].map((to) => new Mover(from, to));
    expect(serializeMoves(actual)).toEqual(jasmine.arrayContaining(serializeMoves(expected)));
    const [shortCastleMover] = actual.filter((m) => m.from === 60 && m.to === 62);
    shortCastleMover.move(board);
    expect(board.at(60)).toBe('_');
    expect(board.at(61)).toBe('r');
    expect(board.at(62)).toBe('k');
    expect(board.at(63)).toBe('_');
    expect(board.castling).toBe('KQ');
    shortCastleMover.undo(board);
    expect(board.at(60)).toBe('k');
    expect(board.at(61)).toBe('_');
    expect(board.at(62)).toBe('_');
    expect(board.at(63)).toBe('r');
    expect(board.castling).toBe('KQkq');
  });

  it('generates black king long castle', () => {
    board = new Board('r3k2r/pbppqppp/1pn2n2/2b1p3/2B1P3/1PN2N2/PBPPQPPP/R4RK1 b kq -');
    const actual: IMover[] = generator.generate(board);
    const from = 60;
    const expected: IMover[] = [58].map((to) => new Mover(from, to));
    expect(serializeMoves(actual)).toEqual(jasmine.arrayContaining(serializeMoves(expected)));
    const [shortCastleMover] = actual.filter((m) => m.from === 60 && m.to === 58);
    shortCastleMover.move(board);
    expect(board.at(56)).toBe('_');
    expect(board.at(57)).toBe('_');
    expect(board.at(58)).toBe('k');
    expect(board.at(59)).toBe('r');
    expect(board.at(60)).toBe('_');
    expect(board.castling).toBe('-');
    shortCastleMover.undo(board);
    expect(board.at(56)).toBe('r');
    expect(board.at(57)).toBe('_');
    expect(board.at(58)).toBe('_');
    expect(board.at(59)).toBe('_');
    expect(board.at(60)).toBe('k');
    expect(board.castling).toBe('kq');
  });

  it('clears castling when white king moves', () => {
    board = new Board('rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6');
    const actual: IMover[] = generator.generate(board);
    const kingMover = actual.filter((m) => m.from === 4)[0];
    kingMover.move(board);
    expect(board.castling).toBe('kq');
    kingMover.undo(board);
    expect(board.castling).toBe('KQkq');
  });

  it('clears castling when black king moves', () => {
    board = new Board('rnbqkbnr/ppp1pppp/8/3p4/3P4/5N2/PPP1PPPP/RNBQKB1R b KQkq -');
    const actual: IMover[] = generator.generate(board);
    const kingMover = actual.filter((m) => m.from === 60)[0];
    kingMover.move(board);
    expect(board.castling).toBe('KQ');
    kingMover.undo(board);
    expect(board.castling).toBe('KQkq');
  });

  it('clears castling when white king-rook moves', () => {
    board = new Board('rnbqkbnr/pppp1ppp/8/4p3/7P/8/PPPPPPP1/RNBQKBNR w KQkq e6');
    const actual: IMover[] = generator.generate(board);
    const kingRookMover = actual.filter((m) => m.from === 7)[0];
    kingRookMover.move(board);
    expect(board.castling).toBe('Qkq');
    kingRookMover.undo(board);
    expect(board.castling).toBe('KQkq');
  });

  it('clears castling when black king-rook moves', () => {
    board = new Board('rnbqkbnr/pppp1pp1/8/4p2p/7P/2N3P1/PPPPPP2/R1BQKBNR b KQkq -');
    const actual: IMover[] = generator.generate(board);
    const kingRookMover = actual.filter((m) => m.from === 63)[0];
    kingRookMover.move(board);
    expect(board.castling).toBe('KQq');
    kingRookMover.undo(board);
    expect(board.castling).toBe('KQkq');
  });

  it('clears castling when white queen-rook moves', () => {
    board = new Board('rnbqkbnr/2pp1pp1/1p6/p3p2p/P6P/2N3P1/1PPPPP2/R1BQKBNR w KQkq -');
    const actual: IMover[] = generator.generate(board);
    const kingRookMover = actual.filter((m) => m.from === 0)[0];
    kingRookMover.move(board);
    expect(board.castling).toBe('Kkq');
    kingRookMover.undo(board);
    expect(board.castling).toBe('KQkq');
  });

  it('clears castling when black queen-rook moves', () => {
    board = new Board('rnbqkbnr/1ppp1pp1/8/p3p2p/P6P/2N3P1/1PPPPP2/R1BQKBNR b KQkq a3');
    const actual: IMover[] = generator.generate(board);
    const kingRookMover = actual.filter((m) => m.from === 56)[0];
    kingRookMover.move(board);
    expect(board.castling).toBe('KQk');
    kingRookMover.undo(board);
    expect(board.castling).toBe('KQkq');
  });
});
