import { Algebraic } from './algebraic';
import { Board } from './board';
import Chess from 'chess.js';
import { MoveGenerator } from './move_generator';
import { IMover } from './mover';
import axios from 'axios';

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const getMove = (board: Board, generator: MoveGenerator, { from, to }) => {
  const [mover] = generator.generate(board, Algebraic.from(from), Algebraic.from(to));
  return mover;
};

export class Book {
  static parsePgn(...pgnUrls: string[]): Promise<Book> {
    return new Promise(async (resolve) => {
      const map = new Map<bigint, IMover[]>();
      const generator = new MoveGenerator();
      for (const pgnUrl of pgnUrls) {
        const { data: rawPgnFile } = await axios.get(pgnUrl);
        for (const raw of rawPgnFile.split(' *')) {
          const pgnGame = new Chess();
          pgnGame.load_pgn(raw.trim() + ' *');
          const board = new Board(START_FEN);
          const currentGame = new Chess();
          for (const m of pgnGame.history()) {
            const mover = getMove(board, generator, currentGame.move(m));
            if (!map.has(board.hash)) map.set(board.hash, []);
            map.get(board.hash).push(mover);
            mover.move(board);
          }
        }
      }
      resolve(new Book(map));
    });
  }

  constructor(private readonly map: Map<bigint, IMover[]>) {}

  hasMoves(hash: bigint): boolean {
    return this.map.has(hash);
  }

  getMoves(hash: bigint): IMover[] {
    return this.map.get(hash);
  }
}
