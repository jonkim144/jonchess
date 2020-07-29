import { Board } from './board';
import { Engine } from './engine';

describe('Engine', () => {
  it('stuck thinking bug', async () => {
    const board = new Board('rnbqkbnr/3p2pp/4p3/pB2PpB1/P7/2N2N2/1PP2PPP/R2QR1K1 b kq -');
    const engine = new Engine(board);
    const bestMove = await engine.getBestMove();
    expect(bestMove).not.toBe(undefined);
  });
});
