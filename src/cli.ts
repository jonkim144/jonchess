import { Algebraic } from './app/algebraic';
import { Board } from './app/board';
import { Engine } from './app/engine';
import { IMover } from './app/mover';
import * as readline from 'readline';

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const board = new Board(START_FEN);
const engine = new Engine(board);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let bestMove: IMover | undefined;

const waitForInput = () => {
  rl.question('', (answer) => {
    if (!answer) answer = '';
    const commands = answer.split(' ');
    do {
      const [command, ...args] = commands;
      switch (command) {
        case 'd':
          console.log();
          for (let y = 7; y >= 0; --y) {
            console.log('+---+---+---+---+---+---+---+---+');
            let row = '|';
            for (let x = 0; x < 8; ++x) {
              const piece = board.at(x + y * 8);
              row += ` ${piece === '_' ? ' ' : piece} |`;
            }
            console.log(row);
          }
          console.log('+---+---+---+---+---+---+---+---+');
          console.log();
          console.log('FEN:', board.fen);
          break;
        case 'quit':
          return rl.close();
        case 'uci':
          console.log('id name jonchess');
          console.log('id author Jonathan Kim');
          console.log('uciok');
          break;
        case 'isready':
          console.log('readyok');
          break;
        case 'ucinewgame':
          board.fen = START_FEN;
          engine.clearHistory();
          break;
        case 'position':
          const [fen] = args;
          const old = board.fen;
          board.fen = fen === 'startpos' ? START_FEN : args.join(' ');
          if (board.fen !== old) engine.clearHistory();
          const movesIndex = args.indexOf('moves');
          if (~movesIndex) {
            const moves = args.slice(movesIndex + 1);
            for (const move of moves) {
              const [from, to] = [Algebraic.from(move.substring(0, 2)), Algebraic.from(move.substring(2, 4))];
              if (!engine.tryMakeMove(from, to, move[4])) {
                console.error('Illegal move:', move, 'position:', board.fen);
                break;
              }
            }
          }
          commands.length = 0;
          break;
        case 'go':
          engine.getBestMove().then((mover) => {
            console.log(`bestmove ${Algebraic.to(mover.from)}${Algebraic.to(mover.to)}${mover.promotion}`);
          });
          break;
        case 'ponderhit':
        case 'infinite':
          break;
        case 'searchmoves':
          commands.length = 0;
          break;
        case 'wtime':
        case 'btime':
        case 'winc':
        case 'binc':
        case 'movestogo':
        case 'nodes':
        case 'mate':
        case 'movetime':
        case 'stop':
          commands.shift();
          break;
        case 'depth':
          const [depth] = args;
          engine.depth = Math.min(5, parseInt(depth));
          commands.shift();
          break;
        default:
          console.info('Ignored command:', command, 'args:', args);
          break;
      }
      commands.shift();
    } while (commands.length);
    waitForInput();
  });
};

waitForInput();
