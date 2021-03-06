import { Component, HostListener, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Board } from './board';
import { Engine, GameState } from './engine';
import { MoveGenerator } from './move_generator';
import { Meta } from '@angular/platform-browser';

const BOARD_OFFSET = [-7, -70];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  private ASSET_MAP = new Map([
    ['r', '/assets/Chess_rdt45.svg'],
    ['n', '/assets/Chess_ndt45.svg'],
    ['b', '/assets/Chess_bdt45.svg'],
    ['q', '/assets/Chess_qdt45.svg'],
    ['k', '/assets/Chess_kdt45.svg'],
    ['p', '/assets/Chess_pdt45.svg'],
    ['R', '/assets/Chess_rlt45.svg'],
    ['N', '/assets/Chess_nlt45.svg'],
    ['B', '/assets/Chess_blt45.svg'],
    ['Q', '/assets/Chess_qlt45.svg'],
    ['K', '/assets/Chess_klt45.svg'],
    ['P', '/assets/Chess_plt45.svg'],
  ]);
  private SQUARE_SIZE = 45;
  private START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  private THEMES: string[][] = [
    ['#c8c2ac', '#67625f'],
    ['#efcca4', '#c36a31'],
    ['#eae9d2', '#4b7399'],
    ['#f0d9b5', '#b58863'],
    ['#efefef', '#8877b7'],
    ['#f0d8bf', '#ba5546'],
    ['#efefef', '#c2d7e2'],
    ['#d9d9d7', '#32694c'],
    ['#bfa37e', '#6f4f38'],
  ];

  title = 'jonchess';
  @ViewChild('boardCanvas', { static: true })
  boardCanvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieceCanvas', { static: true })
  pieceCanvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('highlightCanvas', { static: true })
  highlightCanvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('legalMoveCanvas', { static: true })
  legalMoveCanvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('draggingCanvas', { static: true })
  draggingCanvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('themeCanvas', { static: true })
  themeCanvas: ElementRef<HTMLCanvasElement>;
  fenControl = new FormControl(this.START_FEN);
  debugMode: boolean = false;
  perftControl = new FormControl(0);
  perftOutputControl = new FormControl('');
  messageControl = new FormControl('');

  private pieceLayer: CanvasRenderingContext2D;
  private highlightLayer: CanvasRenderingContext2D;
  private legalMoveLayer: CanvasRenderingContext2D;
  private draggingLayer: CanvasRenderingContext2D;
  private boardLayer: CanvasRenderingContext2D;
  private themeLayer: CanvasRenderingContext2D;
  private theme: string[];
  private board: Board;
  private selectedSquare: number = -1;
  private engine: Engine;
  private flipped: boolean = false;

  constructor(private readonly metaService: Meta) {}

  ngOnInit() {
    this.metaService.addTags([{ name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0' }]);
    this.board = new Board(this.fenControl.value);
    this.engine = new Engine(this.board);
    this.boardLayer = this.boardCanvas.nativeElement.getContext('2d');
    this.pieceLayer = this.pieceCanvas.nativeElement.getContext('2d');
    this.highlightLayer = this.highlightCanvas.nativeElement.getContext('2d');
    this.legalMoveLayer = this.legalMoveCanvas.nativeElement.getContext('2d');
    this.draggingLayer = this.draggingCanvas.nativeElement.getContext('2d');
    this.themeLayer = this.themeCanvas.nativeElement.getContext('2d');
    this.refreshTheme();
    this.renderBoard();
    this.handleMouseDownPiece = this.handleMouseDownPiece.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseDownTheme = this.handleMouseDownTheme.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.draggingCanvas.nativeElement.addEventListener('touchstart', this.handleTouchStart, false);
    this.draggingCanvas.nativeElement.addEventListener('touchmove', this.handleTouchMove, false);
    this.draggingCanvas.nativeElement.addEventListener('touchend', this.handleTouchEnd, false);
    this.draggingCanvas.nativeElement.addEventListener('touchcancel', this.handleTouchEnd, false);
    this.draggingCanvas.nativeElement.addEventListener('mousedown', this.handleMouseDownPiece, false);
    this.draggingCanvas.nativeElement.addEventListener('mouseup', this.handleMouseUp, false);
    this.draggingCanvas.nativeElement.addEventListener('mousemove', this.handleMouseMove, false);
    this.themeCanvas.nativeElement.addEventListener('mousedown', this.handleMouseDownTheme, false);
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowLeft':
        this.undoMove();
        break;
      case 'ArrowRight':
        this.redoMove();
        break;
      default:
        break;
    }
  }

  private redoMove() {
    const oldFen = this.board.fen;
    this.engine.redo();
    if (this.board.fen !== oldFen) {
      this.handleMoveMade();
    }
  }

  private undoMove() {
    const oldFen = this.board.fen;
    this.engine.undo();
    if (this.board.fen !== oldFen) {
      this.handleMoveMade();
    }
  }

  private setMessage(message: string): void {
    this.messageControl.setValue(message);
  }

  handleClickUndo() {
    this.undoMove();
  }

  handleClickRedo() {
    this.redoMove();
  }

  handleClickFlip() {
    this.flipped = !this.flipped;
    this.renderBoard();
    this.clearHighlights();
  }

  handleClickMakeMove(): void {
    this.setMessage('Thinking...');
    setTimeout(() => {
      this.engine.getBestMove().then((move) => {
        if (move) {
          this.engine.tryMakeMove(move.from, move.to);
          this.handleMoveMade();
        } else {
          this.updateGameState();
        }
      });
    });
  }

  private refreshTheme(): void {
    this.theme = JSON.parse(localStorage.getItem('theme')) || this.THEMES[0];
    const [whiteColor, blackColor] = this.theme;
    this.themeLayer.clearRect(0, 0, this.SQUARE_SIZE, this.SQUARE_SIZE);
    this.themeLayer.beginPath();
    this.themeLayer.moveTo(0, 0);
    this.themeLayer.lineTo(this.SQUARE_SIZE, 0);
    this.themeLayer.lineTo(0, this.SQUARE_SIZE);
    this.themeLayer.closePath();
    this.themeLayer.fillStyle = whiteColor;
    this.themeLayer.fill();
    this.themeLayer.beginPath();
    this.themeLayer.moveTo(this.SQUARE_SIZE, this.SQUARE_SIZE);
    this.themeLayer.lineTo(0, this.SQUARE_SIZE);
    this.themeLayer.lineTo(this.SQUARE_SIZE, 0);
    this.themeLayer.closePath();
    this.themeLayer.fillStyle = blackColor;
    this.themeLayer.fill();
    for (let i = 0; i < 8; ++i) {
      for (let j = 0; j < 8; ++j) {
        this.boardLayer.fillStyle = (i + j) % 2 === 0 ? whiteColor : blackColor;
        this.boardLayer.fillRect(i * this.SQUARE_SIZE, j * this.SQUARE_SIZE, this.SQUARE_SIZE, this.SQUARE_SIZE);
      }
    }
  }

  private handleMouseDownTheme(): void {
    const index = this.THEMES.findIndex(([whiteColor, blackColor]) => whiteColor === this.theme[0] && blackColor === this.theme[1]);
    const next = (index + 1) % this.THEMES.length;
    localStorage.setItem('theme', JSON.stringify(this.THEMES[next]));
    this.refreshTheme();
  }

  handleClickSort(): void {
    const values = this.perftOutputControl.value.split('\n');
    values.sort();
    this.perftOutputControl.setValue(values.join('\n'));
  }

  handleChangePerft(): void {
    const generator = new MoveGenerator();
    const board = new Board(this.board.fen);
    const toAlg = (p) => String.fromCharCode(97 + (p % 8)) + (Math.floor(p / 8) + 1).toString();
    const toAlgebraic = (from, to) => `${toAlg(from)}${toAlg(to)}`;
    const perft = (depth, log, isTop = true) => {
      let nodes = 0;
      if (depth === 0) return 1;

      const movers = generator.generate(board);
      for (const mover of movers) {
        mover.move(board);
        const newNodes = perft(depth - 1, log, false);
        nodes += newNodes;
        if (isTop) log(`${toAlgebraic(mover.from, mover.to)}: ${newNodes}`);
        mover.undo(board);
      }
      if (isTop) log(`\nNodes searched: ${nodes}`);
      return nodes;
    };
    const logs = [];
    const logger = (s: string) => logs.push(s);
    perft(parseInt(this.perftControl.value), logger);
    this.perftOutputControl.setValue(logs.join('\n'));
  }

  handleChangeFen(): void {
    if (this.board.fen === this.fenControl.value) return;

    this.clearHighlights();
    this.board.fen = this.fenControl.value;
    this.engine.clearHistory();
    this.renderBoard();
    this.setMessage(`${this.board.isWhiteToMove ? 'White' : 'Black'} to move`);
  }

  private clearHighlights(): void {
    this.clearDots();
    this.selectedSquare = -1;
    this.highlightLayer.clearRect(0, 0, 8 * this.SQUARE_SIZE, 8 * this.SQUARE_SIZE);
    this.highlightLastMove();
  }

  private highlightLastMove(): void {
    const lastMove = this.engine.lastMove;
    if (!lastMove) return;

    [lastMove.from, lastMove.to].forEach((p) => this.highlightSquare(this.flip(7 - (p % 8)), this.flip(Math.floor(p / 8))));
  }

  private highlightSquare(x: number, y: number): void {
    this.highlightLayer.fillStyle = 'rgba(255, 255, 0, 0.4)';
    this.highlightLayer.fillRect(x * this.SQUARE_SIZE, y * this.SQUARE_SIZE, this.SQUARE_SIZE, this.SQUARE_SIZE);
  }

  private renderDot(to: number): void {
    const x = this.flip(7 - (to % 8));
    const y = this.flip(Math.floor(to / 8));
    this.legalMoveLayer.beginPath();
    this.legalMoveLayer.arc((x + 0.5) * this.SQUARE_SIZE, (y + 0.5) * this.SQUARE_SIZE, this.SQUARE_SIZE / 5, 0, 2 * Math.PI);
    this.legalMoveLayer.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.legalMoveLayer.fill();
  }

  private clearDots(): void {
    this.legalMoveLayer.clearRect(0, 0, this.SQUARE_SIZE * 8, this.SQUARE_SIZE * 8);
  }

  private highlightLegalMoves(from: number): void {
    this.clearDots();
    this.engine.getLegalMoves(from).forEach((m) => {
      this.renderDot(m.to);
    });
  }

  private getChangedSquares(fen1: string, fen2: string): number[] {
    const a = new Board(fen1);
    const b = new Board(fen2);
    const changed: number[] = [];
    for (let i = 0; i < 64; ++i) {
      if (a.at(i) !== b.at(i)) changed.push(i);
    }
    return changed;
  }

  private handleMoveMade(): void {
    const changedSquares = this.getChangedSquares(this.board.fen, this.fenControl.value);
    this.fenControl.setValue(this.board.fen);
    this.renderBoard(...changedSquares);
    this.clearHighlights();
    this.updateGameState();
  }

  private updateGameState(): void {
    switch (this.engine.gameState) {
      case GameState.WhiteWins:
        this.setMessage('Checkmate! White wins.');
        break;
      case GameState.BlackWins:
        this.setMessage('Checkmate! Black wins.');
        break;
      case GameState.DrawByRepetition:
        this.setMessage('Draw by repetition.');
        break;
      case GameState.Stalemate:
        this.setMessage('Stalemate!');
        break;
      case GameState.WhiteToMove:
        this.setMessage(`White to move`);
        break;
      case GameState.BlackToMove:
        this.setMessage(`Black to move`);
        break;
    }
  }

  private isDragging: boolean = false;
  private draggingPiece: HTMLImageElement;
  private handleMouseMove(e: MouseEvent): void {
    if (!this.isDragging) return;

    let { pageX, pageY } = e;
    this.handleDrag(pageX, pageY);
  }

  private handleTouchMove(e: TouchEvent): void {
    let { pageX, pageY } = e.touches[0];
    this.handleDrag(pageX, pageY);
  }

  private handleDrag(pageX: number, pageY: number): void {
    pageX += BOARD_OFFSET[0];
    pageY += BOARD_OFFSET[1];
    this.draggingLayer.clearRect(0, 0, 8 * this.SQUARE_SIZE, 8 * this.SQUARE_SIZE);
    this.draggingLayer.drawImage(this.draggingPiece, pageX - 22, pageY - 22, this.SQUARE_SIZE, this.SQUARE_SIZE);
  }

  private flip(xy: number) {
    return this.flipped ? xy : 7 - xy;
  }

  private handleMouseDownPiece(e: Event): void {
    let { pageX, pageY } = e instanceof TouchEvent ? (e as TouchEvent).touches[0] : (e as MouseEvent);
    this.handleStartDrag(pageX, pageY);
  }

  private handleTouchStart(e: TouchEvent): void {
    let { pageX, pageY } = e.touches[0];
    this.handleStartDrag(pageX, pageY);
    e.preventDefault();
  }

  private handleStartDrag(pageX: number, pageY: number): void {
    pageX += BOARD_OFFSET[0];
    pageY += BOARD_OFFSET[1];
    const x = this.flip(7 - Math.floor(pageX / this.SQUARE_SIZE));
    const y = this.flip(Math.floor(pageY / this.SQUARE_SIZE));
    if (x < 0 || y < 0 || x > 7 || y > 7) return;

    const candidate = x + y * 8;
    if (~this.selectedSquare) {
      if (this.selectedSquare === candidate) {
        return;
      }
      if (this.engine.tryMakeMove(this.selectedSquare, candidate)) {
        return this.handleMoveMade();
      }
      this.clearHighlights();
      if (this.board.at(candidate) === '_') {
        this.isDragging = false;
        return;
      }
    } else {
      if (this.board.at(candidate) === '_') return;
    }
    this.selectedSquare = candidate;
    this.highlightSquare(this.flip(7 - x), this.flip(y));
    this.highlightLegalMoves(candidate);
    this.isDragging = true;
    this.renderPiece(candidate, '_');
    this.draggingPiece = new Image();
    this.draggingPiece.onload = () => {
      this.draggingLayer.drawImage(this.draggingPiece, pageX - 22, pageY - 22, this.SQUARE_SIZE, this.SQUARE_SIZE);
    };
    this.draggingPiece.src = this.ASSET_MAP.get(this.board.at(candidate));
  }

  private handleMouseUp(e: MouseEvent): void {
    let { pageX, pageY } = e;
    this.handleDragEnd(pageX, pageY);
  }

  private handleTouchEnd(e: TouchEvent): void {
    let { pageX, pageY } = e.changedTouches[0];
    this.handleDragEnd(pageX, pageY);
  }

  private handleDragEnd(pageX: number, pageY: number): void {
    pageX += BOARD_OFFSET[0];
    pageY += BOARD_OFFSET[1];
    this.isDragging = false;
    const x = this.flip(7 - Math.floor(pageX / this.SQUARE_SIZE));
    const y = this.flip(Math.floor(pageY / this.SQUARE_SIZE));
    const candidate = x + y * 8;
    this.draggingLayer.clearRect(0, 0, 8 * this.SQUARE_SIZE, 8 * this.SQUARE_SIZE);
    if (!~this.selectedSquare) return;

    if (this.engine.tryMakeMove(this.selectedSquare, candidate)) {
      return this.handleMoveMade();
    } else {
      this.renderBoard(this.selectedSquare);
      if (this.selectedSquare !== candidate) this.clearHighlights();
    }
  }

  private renderPiece(square: number, piece: string): void {
    const x = this.flip(7 - (square % 8));
    const y = this.flip(Math.floor(square / 8));
    this.pieceLayer.clearRect(x * this.SQUARE_SIZE, y * this.SQUARE_SIZE, this.SQUARE_SIZE, this.SQUARE_SIZE);
    const asset = this.ASSET_MAP.get(piece);
    if (!asset) return;

    const pieceImage = new Image();
    const pieceScale = 0.9;
    pieceImage.onload = () => {
      this.pieceLayer.drawImage(
        pieceImage,
        (x + (1 - pieceScale) / 2) * this.SQUARE_SIZE,
        (y + (1 - pieceScale) / 2) * this.SQUARE_SIZE,
        this.SQUARE_SIZE * pieceScale,
        this.SQUARE_SIZE * pieceScale,
      );
    };
    pieceImage.src = asset;
  }

  private renderBoard(...squares: number[]): void {
    if (!squares.length) squares = [...Array(64).keys()];
    squares.forEach((i) => this.renderPiece(i, this.board.at(i)));
  }
}
