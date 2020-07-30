import { Board } from './board';
import { Engine } from './engine';

describe('Engine', async () => {
  it('stuck thinking bug', async () => {
    const board = new Board('rnbqkbnr/3p2pp/4p3/pB2PpB1/P7/2N2N2/1PP2PPP/R2QR1K1 b kq -');
    const engine = new Engine(board);
    const bestMove = await engine.getBestMove();
    expect(bestMove).not.toBe(undefined);
  });

  const toAlgebraic = (location) => {
    const file = location % 8;
    const rank = Math.floor(location / 8);
    return `${String.fromCharCode('a'.charCodeAt(0) + file)}${rank + 1}`;
  };
  const serializeMove = (move) => toAlgebraic(move.from) + toAlgebraic(move.to);

  describe('Bratko-Kopec', async () => {
    it('BK.01', async () => {
      // pass
      const engine = new Engine(new Board('1k1r4/pp1b1R2/3q2pp/4p3/2B5/4Q3/PPP2B2/2K5 b - - bm Qd1+; id "BK.01";'));
      expect(serializeMove(await engine.getBestMove())).toBe('d6d1');
    });
    xit('BK.02', async () => {
      const engine = new Engine(new Board('3r1k2/4npp1/1ppr3p/p6P/P2PPPP1/1NR5/5K2/2R5 w - - bm d5; id "BK.02";'));
      expect(serializeMove(await engine.getBestMove())).toBe('d4d5');
    });
    xit('BK.03', async () => {
      const engine = new Engine(new Board('2q1rr1k/3bbnnp/p2p1pp1/2pPp3/PpP1P1P1/1P2BNNP/2BQ1PRK/7R b - - bm f5; id "BK.03";'));
      expect(serializeMove(await engine.getBestMove())).toBe('f6f5');
    });
    xit('BK.04', async () => {
      const engine = new Engine(new Board('rnbqkb1r/p3pppp/1p6/2ppP3/3N4/2P5/PPP1QPPP/R1B1KB1R w KQkq - bm e6; id "BK.04";'));
      expect(serializeMove(await engine.getBestMove())).toBe('e5e6');
    });
    xit('BK.05', async () => {
      const engine = new Engine(new Board('r1b2rk1/2q1b1pp/p2ppn2/1p6/3QP3/1BN1B3/PPP3PP/R4RK1 w - - bm Nd5 a4; id "BK.05";'));
      expect(serializeMove(await engine.getBestMove())).toBe('c3d5');
    });
    xit('BK.06', async () => {
      const engine = new Engine(new Board('2r3k1/pppR1pp1/4p3/4P1P1/5P2/1P4K1/P1P5/8 w - - bm g6; id "BK.06";'));
      expect(serializeMove(await engine.getBestMove())).toBe('g5g6');
    });
    xit('BK.07', async () => {
      const engine = new Engine(new Board('1nk1r1r1/pp2n1pp/4p3/q2pPp1N/b1pP1P2/B1P2R2/2P1B1PP/R2Q2K1 w - - bm Nf6; id "BK.07";'));
      expect(serializeMove(await engine.getBestMove())).toBe('h5f6');
    });
    xit('BK.08', async () => {
      const engine = new Engine(new Board('4b3/p3kp2/6p1/3pP2p/2pP1P2/4K1P1/P3N2P/8 w - - bm f5; id "BK.08";'));
      expect(serializeMove(await engine.getBestMove())).toBe('f4f5');
    });
    xit('BK.09', async () => {
      const engine = new Engine(new Board('2kr1bnr/pbpq4/2n1pp2/3p3p/3P1P1B/2N2N1Q/PPP3PP/2KR1B1R w - - bm f5; id "BK.09";'));
      expect(serializeMove(await engine.getBestMove())).toBe('f4f5');
    });
    xit('BK.10', async () => {
      const engine = new Engine(new Board('3rr1k1/pp3pp1/1qn2np1/8/3p4/PP1R1P2/2P1NQPP/R1B3K1 b - - bm Ne5; id "BK.10";'));
      expect(serializeMove(await engine.getBestMove())).toBe('c6e5');
    });
    xit('BK.11', async () => {
      const engine = new Engine(new Board('2r1nrk1/p2q1ppp/bp1p4/n1pPp3/P1P1P3/2PBB1N1/4QPPP/R4RK1 w - - bm f4; id "BK.11";'));
      expect(serializeMove(await engine.getBestMove())).toBe('f2f4');
    });
    it('BK.12', async () => {
      const engine = new Engine(new Board('r3r1k1/ppqb1ppp/8/4p1NQ/8/2P5/PP3PPP/R3R1K1 b - - bm Bf5; id "BK.12";'));
      expect(serializeMove(await engine.getBestMove())).toBe('d7f5');
    });
    xit('BK.13', async () => {
      const engine = new Engine(new Board('r2q1rk1/4bppp/p2p4/2pP4/3pP3/3Q4/PP1B1PPP/R3R1K1 w - - bm b4; id "BK.13";'));
      expect(serializeMove(await engine.getBestMove())).toBe('b2b4');
    });
    xit('BK.14', async () => {
      const engine = new Engine(new Board('rnb2r1k/pp2p2p/2pp2p1/q2P1p2/8/1Pb2NP1/PB2PPBP/R2Q1RK1 w - - bm Qd2 Qe1; id "BK.14";'));
      expect(serializeMove(await engine.getBestMove())).toBe('d1d2');
    });
    it('BK.15', async () => {
      // pass
      const engine = new Engine(new Board('2r3k1/1p2q1pp/2b1pr2/p1pp4/6Q1/1P1PP1R1/P1PN2PP/5RK1 w - - bm Qxg7+; id "BK.15";'));
      expect(serializeMove(await engine.getBestMove())).toBe('g4g7');
    });
    xit('BK.16', async () => {
      const engine = new Engine(new Board('r1bqkb1r/4npp1/p1p4p/1p1pP1B1/8/1B6/PPPN1PPP/R2Q1RK1 w kq - bm Ne4; id "BK.16";'));
      expect(serializeMove(await engine.getBestMove())).toBe('d2e4');
    });
    xit('BK.17', async () => {
      const engine = new Engine(new Board('r2q1rk1/1ppnbppp/p2p1nb1/3Pp3/2P1P1P1/2N2N1P/PPB1QP2/R1B2RK1 b - - bm h5; id "BK.17";'));
      expect(serializeMove(await engine.getBestMove())).toBe('h7h5');
    });
    xit('BK.18', async () => {
      const engine = new Engine(new Board('r1bq1rk1/pp2ppbp/2np2p1/2n5/P3PP2/N1P2N2/1PB3PP/R1B1QRK1 b - - bm Nb3; id "BK.18";'));
      expect(serializeMove(await engine.getBestMove())).toBe('c5b3');
    });
    xit('BK.19', async () => {
      const engine = new Engine(new Board('3rr3/2pq2pk/p2p1pnp/8/2QBPP2/1P6/P5PP/4RRK1 b - - bm Rxe4; id "BK.19";'));
      expect(serializeMove(await engine.getBestMove())).toBe('e8e4');
    });
    xit('BK.20', async () => {
      const engine = new Engine(new Board('r4k2/pb2bp1r/1p1qp2p/3pNp2/3P1P2/2N3P1/PPP1Q2P/2KRR3 w - - bm g4; id "BK.20";'));
      expect(serializeMove(await engine.getBestMove())).toBe('g3g4');
    });
    it('BK.21', async () => {
      // pass
      const engine = new Engine(new Board('3rn2k/ppb2rpp/2ppqp2/5N2/2P1P3/1P5Q/PB3PPP/3RR1K1 w - - bm Nh6; id "BK.21";'));
      expect(serializeMove(await engine.getBestMove())).toBe('f5h6');
    });
    xit('BK.22', async () => {
      const engine = new Engine(new Board('2r2rk1/1bqnbpp1/1p1ppn1p/pP6/N1P1P3/P2B1N1P/1B2QPP1/R2R2K1 b - - bm Bxe4; id "BK.22";'));
      expect(serializeMove(await engine.getBestMove())).toBe('b7e4');
    });
    xit('BK.23', async () => {
      const engine = new Engine(new Board('r1bqk2r/pp2bppp/2p5/3pP3/P2Q1P2/2N1B3/1PP3PP/R4RK1 b kq - bm f6; id "BK.23";'));
      expect(serializeMove(await engine.getBestMove())).toBe('f7f6');
    });
    xit('BK.24', async () => {
      const engine = new Engine(new Board('r2qnrnk/p2b2b1/1p1p2pp/2pPpp2/1PP1P3/PRNBB3/3QNPPP/5RK1 w - - bm f4; id "BK.24";'));
      expect(serializeMove(await engine.getBestMove())).toBe('f2f4');
    });
  });
});
