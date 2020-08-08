import { Algebraic } from './algebraic';
import { Board } from './board';
import Chess from 'chess.js';
import { MoveGenerator } from './move_generator';
import { IMover } from './mover';

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const getMove = (board: Board, generator: MoveGenerator, { from, to }) => {
  const [mover] = generator.generate(board, Algebraic.from(from), Algebraic.from(to));
  return mover;
};

export class Book {
  private readonly map = new Map<bigint, IMover[]>();

  constructor() {
    const generator = new MoveGenerator();
    for (const raw of OPENINGS_PGN.split(' *')) {
      const pgnGame = new Chess();
      pgnGame.load_pgn(raw.trim() + ' *');
      const board = new Board(START_FEN);
      const currentGame = new Chess();
      for (const m of pgnGame.history()) {
        const mover = getMove(board, generator, currentGame.move(m));
        if (!this.map.has(board.hash)) this.map.set(board.hash, []);
        this.map.get(board.hash).push(mover);
        mover.move(board);
      }
    }
  }

  hasMoves(hash: bigint): boolean {
    return this.map.has(hash);
  }

  getMoves(hash: bigint): IMover[] {
    return this.map.get(hash);
  }
}

const OPENINGS_PGN = `
[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Alekhine's Defence"]
[Black "?"]
[Result "*"]
[ECO "B02"]
[PlyCount "2"]
[EventDate "2002.08.08"]

{Aljechin-Verteidigung  Défense Alekhine Defensa Alekhine} 1. e4 Nf6 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Alekhine's Defence"]
[Black "Chase Variation"]
[Result "*"]
[ECO "B02"]
[PlyCount "7"]
[EventDate "2002.08.08"]

{Aljechin-Verteidigung Jagdvariante  Défense Alekhine Variante de chasse
Defensa Alekhine Variante del Acoso} 1. e4 Nf6 2. e5 Nd5 3. c4 Nb6 4. c5 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Alekhine's Defence"]
[Black "Four Pawns Attack"]
[Result "*"]
[ECO "B03"]
[PlyCount "9"]
[EventDate "2002.08.08"]

{Aljechin-Verteidigung Vierbauernangriff  Défense Alekhine Variante des quatre
pions Defensa Alekhine Ataque de los 4 Peones} 1. e4 Nf6 2. e5 Nd5 3. d4 d6 4.
c4 Nb6 5. f4 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Alekhine's Defence"]
[Black "Modern Variation"]
[Result "*"]
[ECO "B04"]
[PlyCount "7"]
[EventDate "2002.08.08"]

{Aljechin-Verteidigung Moderne Variante  Défense Alekhine Variante moderne
Defensa Alekhine Variante Moderna} 1. e4 Nf6 2. e5 Nd5 3. d4 d6 4. Nf3 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Benoni Defence"]
[Black "?"]
[Result "*"]
[ECO "A60"]
[PlyCount "6"]
[EventDate "2002.08.08"]

{Benoni Verteidigung  Défense Benoni Defensa Benoni} 1. d4 Nf6 2. c4 c5 3. d5
e6 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Benoni Defence"]
[Black "Classical Variation"]
[Result "*"]
[ECO "A70"]
[PlyCount "15"]
[EventDate "2002.08.08"]

{Benoni Verteidigung Klassische Variante  Défense Benoni Variante principale
Defensa Benoni Variante Clásica} 1. d4 Nf6 2. c4 c5 3. d5 e6 4. Nc3 exd5 5.
cxd5 d6 6. e4 g6 7. Nf3 Bg7 8. Be2 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Benoni Defence"]
[Black "Fianchetto Variation"]
[Result "*"]
[ECO "A61"]
[PlyCount "13"]
[EventDate "2002.08.08"]

{Benoni Verteidigung Fianchetto-Variante  Défense Benoni Variante du
fianchetto Defensa Benoni Variante del Fianchetto} 1. d4 Nf6 2. c4 c5 3. d5 e6
4. Nc3 exd5 5. cxd5 d6 6. Nf3 g6 7. g3 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Benoni Defence"]
[Black "Four Pawns Attack"]
[Result "*"]
[ECO "A66"]
[PlyCount "13"]
[EventDate "2002.08.08"]

{Benoni Verteidigung Vierbauern-Angriff  Défense Benoni Attaque des quatre
pions Defensa Benoni Ataque de los 4 Peones} 1. d4 Nf6 2. c4 c5 3. d5 e6 4. Nc3
exd5 5. cxd5 d6 6. e4 g6 7. f4 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Bird's Opening"]
[Black "?"]
[Result "*"]
[ECO "A02"]
[PlyCount "1"]
[EventDate "2002.08.08"]

{Bird-Eröffnung  Ouverture Bird Apertura Bird} 1. f4 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Bird's Opening"]
[Black "From's Gambit"]
[Result "*"]
[ECO "A02"]
[PlyCount "2"]
[EventDate "2002.08.08"]

{Bird-Eröffnung Froms Gambit  Ouverture Bird Gambit From Apertura Bird Gambito
From} 1. f4 e5 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Bishop's Opening"]
[Black "?"]
[Result "*"]
[ECO "C23"]
[PlyCount "3"]
[EventDate "2002.08.08"]

{Läuferspiel  Début du Fou Apertura del Alfil} 1. e4 e5 2. Bc4 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Bishop's Opening"]
[Black "Greco's Gambit"]
[Result "*"]
[ECO "C24"]
[PlyCount "5"]
[EventDate "2002.08.08"]

{Läuferspiel Greco-Gambit  Début du Fou Gambit Greco Apertura del Alfil
Gambito Greco} 1. e4 e5 2. Bc4 Nf6 3. f4 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Bishop's Opening"]
[Black "Lewis' Counter Gambit"]
[Result "*"]
[ECO "C23"]
[PlyCount "6"]
[EventDate "2002.08.08"]

{Läuferspiel Lewis-Gegengambit  Début du Fou Contre-gambit Lewis Apertura del
Alfil Contragambito Lewis} 1. e4 e5 2. Bc4 Bc5 3. c3 d5 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Bishop's Opening"]
[Black "Lewis' Gambit"]
[Result "*"]
[ECO "C23"]
[PlyCount "5"]
[EventDate "2002.08.08"]

{Läuferspiel Lewis-Gambit  Début du Fou Gambit Lewis Apertura del Alfil
Gambito Lewis} 1. e4 e5 2. Bc4 Bc5 3. d4 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Bishop's Opening"]
[Black "Ponziani's Gambit"]
[Result "*"]
[ECO "C24"]
[PlyCount "5"]
[EventDate "2002.08.08"]

{Läuferspiel Ponziani-Gambit  Début du Fou Gambit Ponziani Apertura del Alfil
Gambito Ponziani} 1. e4 e5 2. Bc4 Nf6 3. d4 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Bishop's Opening"]
[Black "del Rio Variation"]
[Result "*"]
[ECO "C23"]
[PlyCount "6"]
[EventDate "2002.08.08"]

{Läuferspiel del Rio-Variante  Début du Fou Variante del Rio Apertura del
Alfil Variante del Río} 1. e4 e5 2. Bc4 Bc5 3. c3 Qg5 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Blumenfeld Counter Gambit"]
[Black "?"]
[Result "*"]
[ECO "E10"]
[PlyCount "8"]
[EventDate "2002.08.08"]

{Blumenfeld-Gambit  Gambit Blumenfeld Contragambito Blumenfeld} 1. d4 Nf6 2. c4
e6 3. Nf3 c5 4. d5 b5 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Bogo Indian Defence"]
[Black "?"]
[Result "*"]
[ECO "E11"]
[PlyCount "6"]
[EventDate "2002.08.08"]

{Bogoljubow-Indische Verteidigung  Défense Bogo-indienne Defensa Bogo India} 1.
d4 Nf6 2. c4 e6 3. Nf3 Bb4+ *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Budapest Defence"]
[Black "?"]
[Result "*"]
[ECO "A51"]
[PlyCount "4"]
[EventDate "2002.08.08"]

{Budapester Gambit  Gambit de Budapest Defensa Budapest} 1. d4 Nf6 2. c4 e5 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Caro-Kann"]
[Black "?"]
[Result "*"]
[ECO "B10"]
[PlyCount "2"]
[EventDate "2002.08.08"]

{Caro-Kann  Défense Caro-Kann Caro-Kann} 1. e4 c6 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Caro-Kann"]
[Black "Advance Variation"]
[Result "*"]
[ECO "B12"]
[PlyCount "5"]
[EventDate "2002.08.08"]

{Caro-Kann Vorstoßvariante  Défense Caro-Kann Variante d'avance Caro-Kann
Variante del Avance} 1. e4 c6 2. d4 d5 3. e5 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Caro-Kann"]
[Black "Anti Caro-Kann"]
[Result "*"]
[ECO "B10"]
[PlyCount "3"]
[EventDate "2002.08.08"]

{Caro-Kann Anti Caro-Kann  Défense Caro-Kann Anti Caro-Kann Caro-Kann Anti
Caro-Kann} 1. e4 c6 2. c4 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Caro-Kann"]
[Black "Bornstein-Larsen System"]
[Result "*"]
[ECO "B16"]
[PlyCount "10"]
[EventDate "2002.08.08"]

{Caro-Kann Bronstein-Larsen Variante  Défense Caro-Kann Variante
Bronstein-Larsen  Caro-Kann Sistema Bornstein-Larsen} 1. e4 c6 2. d4 d5 3. Nc3
dxe4 4. Nxe4 Nf6 5. Nxf6+ gxf6 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Caro-Kann"]
[Black "Classical System"]
[Result "*"]
[ECO "B18"]
[PlyCount "8"]
[EventDate "2002.08.08"]

{Caro-Kann Klassisches System  Défense Caro-Kann Variante classique Caro-Kann
Sistema Clásico} 1. e4 c6 2. d4 d5 3. Nc3 dxe4 4. Nxe4 Bf5 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Caro-Kann"]
[Black "Closed Variation"]
[Result "*"]
[ECO "B10"]
[PlyCount "3"]
[EventDate "2002.08.08"]

{Caro-Kann Geschlossene Variante  Défense Caro-Kann Variante fermée Caro-Kann
Variante Cerrada} 1. e4 c6 2. d3 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Caro-Kann"]
[Black "Exchange Variation"]
[Result "*"]
[ECO "B13"]
[PlyCount "7"]
[EventDate "2002.08.08"]

{Caro-Kann Abtauschvariante  Défense Caro-Kann Variante d'échange Caro-Kann
Variante del Cambio} 1. e4 c6 2. d4 d5 3. exd5 cxd5 4. Bd3 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Caro-Kann"]
[Black "Flohr's System"]
[Result "*"]
[ECO "B17"]
[PlyCount "8"]
[EventDate "2002.08.08"]

{Caro-Kann Flohr-System  Défense Caro-Kann Variante Steinitz Caro-Kann Sistema
Flohr} 1. e4 c6 2. d4 d5 3. Nc3 dxe4 4. Nxe4 Nd7 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Caro-Kann"]
[Black "Gurgenidze's System"]
[Result "*"]
[ECO "B15"]
[PlyCount "6"]
[EventDate "2002.08.08"]

{Caro-Kann Gurgenidze-System  Défense Caro-Kann Variante Gurgenidze Caro-Kann
Sistema Gurgenidze} 1. e4 c6 2. d4 d5 3. Nc3 g6 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Caro-Kann"]
[Black "Panov's Attack"]
[Result "*"]
[ECO "B13"]
[PlyCount "7"]
[EventDate "2002.08.08"]

{Caro-Kann Panov-Angriff  Défense Caro-Kann Attaque Panov Caro-Kann Ataque
Panov} 1. e4 c6 2. d4 d5 3. exd5 cxd5 4. c4 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Caro-Kann"]
[Black "Tartakower-Nimzovich System"]
[Result "*"]
[ECO "B15"]
[PlyCount "10"]
[EventDate "2002.08.08"]

{Caro-Kann Tartakower-Nimzowitsch Variante  Défense Caro-Kann Variante
Nimzovitch Caro-Kann Sistema Tartakower-Nimzovich} 1. e4 c6 2. d4 d5 3. Nc3
dxe4 4. Nxe4 Nf6 5. Nxf6+ exf6 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Catalan System"]
[Black "?"]
[Result "*"]
[ECO "E01"]
[PlyCount "6"]
[EventDate "2002.08.08"]

{Katalanisch  Ouverture catalane Sistema Catalan} 1. d4 Nf6 2. c4 e6 3. g3 d5 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Centre Gambit"]
[Black "?"]
[Result "*"]
[ECO "C21"]
[PlyCount "3"]
[EventDate "2002.08.08"]

{Mittelgambit  Gambit du centre Gambito del Centro} 1. e4 e5 2. d4 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Dutch Defence"]
[Black "?"]
[Result "*"]
[ECO "A80"]
[PlyCount "2"]
[EventDate "2002.08.08"]

{Holländische Verteidigung  Défense hollandaise Defensa Holandesa} 1. d4 f5 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Dutch Defence"]
[Black "Iljin Genevsky System"]
[Result "*"]
[ECO "A84"]
[PlyCount "8"]
[EventDate "2002.08.08"]

{Holländische Verteidigung Iljin-Genevsky-System  Défense hollandaise Variante
Ilyin Genevsky Defensa Holandesa Sistema Iljin Genevsky} 1. d4 f5 2. Nf3 Nf6 3.
c4 e6 4. g3 d6 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Dutch Defence"]
[Black "Leningrad System"]
[Result "*"]
[ECO "A84"]
[PlyCount "6"]
[EventDate "2002.08.08"]

{Holländische Verteidigung Leningrader System  Défense hollandaise Variante de
Leningrad Defensa Holandesa Sistema Leningrado} 1. d4 f5 2. Nf3 Nf6 3. c4 g6 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Dutch Defence"]
[Black "Staunton Gambit"]
[Result "*"]
[ECO "A82"]
[PlyCount "3"]
[EventDate "2002.08.08"]

{Holländische Verteidigung Staunton-Gambit  Défense hollandaise Gambit
Staunton Defensa Holandesa Gambito Staunton} 1. d4 f5 2. e4 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Dutch Defence"]
[Black "Stonewall Variation"]
[Result "*"]
[ECO "A84"]
[PlyCount "10"]
[EventDate "2002.08.08"]

{Holländische Verteidigung Stonewall-System  Défense hollandaise Variante
Stonewall Defensa Holandesa Variante Muro de Piedra} 1. d4 f5 2. Nf3 Nf6 3. c4
e6 4. g3 d5 5. Bg2 c6 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "English Opening"]
[Black "?"]
[Result "*"]
[ECO "A10"]
[PlyCount "1"]
[EventDate "2002.08.08"]

{Englische Eröffnung  Ouverture Anglaise Apertura Inglesa} 1. c4 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "English Opening"]
[Black "Symmetrical Variation"]
[Result "*"]
[ECO "A30"]
[PlyCount "2"]
[EventDate "2002.08.08"]

{Englische Eröffnung Symmetrievariante  Ouverture Anglaise Variante symétrique
Apertura Inglesa Variante Simétrica} 1. c4 c5 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Four Knights' Game"]
[Black "?"]
[Result "*"]
[ECO "C47"]
[PlyCount "6"]
[EventDate "2002.08.08"]

{Vierspringerspiel  Partie des quatre Cavaliers Partida de los 4 Caballos} 1.
e4 e5 2. Nf3 Nc6 3. Nc3 Nf6 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Four Knights' Game"]
[Black "Scotch Variation"]
[Result "*"]
[ECO "C47"]
[PlyCount "7"]
[EventDate "2002.08.08"]

{Vierspringerspiel Schottisches Vierspringerspiel  Partie des quatre Cavaliers
Variante écossaise Partida de los 4 Caballos Variante Escocesa} 1. e4 e5 2. Nf3
Nc6 3. Nc3 Nf6 4. d4 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Four Knights' Game"]
[Black "Spanish Variation"]
[Result "*"]
[ECO "C48"]
[PlyCount "7"]
[EventDate "2002.08.08"]

{Vierspringerspiel Spanisches Vierspringerspiel  Partie des quatre Cavaliers
Variante espagnole Partida de los 4 Caballos Variante Española} 1. e4 e5 2. Nf3
Nc6 3. Nc3 Nf6 4. Bb5 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "French Defence"]
[Black "?"]
[Result "*"]
[ECO "C00"]
[PlyCount "2"]
[EventDate "2002.08.08"]

{Französische Verteidigung  Défense française Defensa Francesa} 1. e4 e6 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "French Defence"]
[Black "Advance Variation"]
[Result "*"]
[ECO "C02"]
[PlyCount "5"]
[EventDate "2002.08.08"]

{Französische Verteidigung Vorstoß-Variante  Défense française Variante
d'avance Defensa Francesa Variante del Avance} 1. e4 e6 2. d4 d5 3. e5 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "French Defence"]
[Black "Classical Variation"]
[Result "*"]
[ECO "C11"]
[PlyCount "6"]
[EventDate "2002.08.08"]

{Französische Verteidigung Klassisches System  Défense française Variante
classique Defensa Francesa Variante Clásica} 1. e4 e6 2. d4 d5 3. Nc3 Nf6 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "French Defence"]
[Black "Exchange Variation"]
[Result "*"]
[ECO "C01"]
[PlyCount "6"]
[EventDate "2002.08.08"]

{Französische Verteidigung Abtausch-Variante  Défense française Variante
d'échange Defensa Francesa Variante del Cambio} 1. e4 e6 2. d4 d5 3. exd5 exd5
*

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "French Defence"]
[Black "Rubinstein Variation"]
[Result "*"]
[ECO "C10"]
[PlyCount "6"]
[EventDate "2002.08.08"]

{Französische Verteidigung Rubinstein-Variante  Défense française Variante
Rubinstein Defensa Francesa Variante Rubinstein} 1. e4 e6 2. d4 d5 3. Nc3 dxe4
*

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "French Defence"]
[Black "Tarrasch Variation"]
[Result "*"]
[ECO "C03"]
[PlyCount "5"]
[EventDate "2002.08.08"]

{Französische Verteidigung Tarrasch-Variante  Défense française Variante
Tarrasch Defensa Francesa Variante Tarrasch} 1. e4 e6 2. d4 d5 3. Nd2 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "French Defence"]
[Black "Winawer Variation"]
[Result "*"]
[ECO "C15"]
[PlyCount "6"]
[EventDate "2002.08.08"]

{Französische Verteidigung Nimzowitsch-Variante  Défense française Variante
Winawer Defensa Francesa Variante Winawer} 1. e4 e6 2. d4 d5 3. Nc3 Bb4 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Giucco Piano"]
[Black "?"]
[Result "*"]
[ECO "C50"]
[PlyCount "6"]
[EventDate "2002.08.08"]

{Italienische Partie  Partie italienne Apertura Italiana} 1. e4 e5 2. Nf3 Nc6
3. Bc4 Bc5 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Giucco Piano"]
[Black "Blackburne-Bird Variation"]
[Result "*"]
[ECO "C54"]
[PlyCount "11"]
[EventDate "2002.08.08"]

{Italienische Partie Blackburne-Bird-Variante  Partie italienne Variante
Blackburne-Bird Apertura Italiana Variante Blackburne-Bird} 1. e4 e5 2. Nf3 Nc6
3. Bc4 Bc5 4. d3 Nf6 5. c3 d6 6. b4 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Giucco Piano"]
[Black "Canal Variation"]
[Result "*"]
[ECO "C50"]
[PlyCount "11"]
[EventDate "2002.08.08"]

{Italienische Partie Canal-Variante  Partie italienne Variante du canal
Apertura Italiana Variante Canal} 1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. Nc3 Nf6 5.
d3 d6 6. Bg5 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Giucco Piano"]
[Black "Evans Gambit"]
[Result "*"]
[ECO "C51"]
[PlyCount "7"]
[EventDate "2002.08.08"]

{Italienische Partie Evans-Gambit  Partie italienne Gambit Evans Apertura
Italiana Gambito Evans} 1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. b4 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Giucco Piano"]
[Black "Giucco Pianissimo"]
[Result "*"]
[ECO "C50"]
[PlyCount "9"]
[EventDate "2002.08.08"]

{Italienische Partie Ruhige Variante  Partie italienne Guiocco Pianissimo
Apertura Italiana Giuocco Pianissimo} 1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. Nc3 Nf6
5. d3 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Giucco Piano"]
[Black "Greco's Attack"]
[Result "*"]
[ECO "C54"]
[PlyCount "13"]
[EventDate "2002.08.08"]

{Italienische Partie Greco-Angriff  Partie italienne Attaque de Greco Apertura
Italiana Ataque Greco} 1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d4 exd4 6.
cxd4 Bb4+ 7. Nc3 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Giucco Piano"]
[Black "Möller's Attack"]
[Result "*"]
[ECO "C54"]
[PlyCount "17"]
[EventDate "2002.08.08"]

{Italienische Partie Möller-Angriff  Partie italienne Attaque de Möller
Apertura Italiana Ataque Möller} 1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d4
exd4 6. cxd4 Bb4+ 7. Nc3 Nxe4 8. O-O Bxc3 9. d5 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Grünfeld Defence"]
[Black "?"]
[Result "*"]
[ECO "D80"]
[PlyCount "6"]
[EventDate "2002.08.08"]

{Grünfeld-Indische Verteidigung  Défense Grünfeld Defensa Grünfeld} 1. d4 Nf6
2. c4 g6 3. Nc3 d5 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Grünfeld Defence"]
[Black "Classical Exchange Variation"]
[Result "*"]
[ECO "D86"]
[PlyCount "15"]
[EventDate "2002.08.08"]

{Grünfeld-Indische Verteidigung Klassische Abtauschvariante  Défense Grünfeld
Variante d'échange classique Defensa Grünfeld Variante Clásica del Cambio} 1.
d4 Nf6 2. c4 g6 3. Nc3 d5 4. cxd5 Nxd5 5. e4 Nxc3 6. bxc3 Bg7 7. Bc4 c5 8. Ne2
*

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Grünfeld Defence"]
[Black "Exchange Variation"]
[Result "*"]
[ECO "D80"]
[PlyCount "7"]
[EventDate "2002.08.08"]

{Grünfeld-Indische Verteidigung Abtauschvariante  Défense Grünfeld Variante
d'échange Defensa Grünfeld Variante del Cambio} 1. d4 Nf6 2. c4 g6 3. Nc3 d5 4.
cxd5 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Grünfeld Defence"]
[Black "Modern Exchange Variation"]
[Result "*"]
[ECO "D85"]
[PlyCount "13"]
[EventDate "2002.08.08"]

{Grünfeld-Indische Verteidigung Moderne Abtauschvariante  Défense Grünfeld
Variante d'échange moderne Defensa Grünfeld Variante del Cambio Moderna} 1. d4
Nf6 2. c4 g6 3. Nc3 d5 4. cxd5 Nxd5 5. e4 Nxc3 6. bxc3 Bg7 7. Nf3 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Hungarian Defence"]
[Black "?"]
[Result "*"]
[ECO "C50"]
[PlyCount "6"]
[EventDate "2002.08.08"]

{Ungarische Verteidigung  Partie italienne Défense hongroise Defensa Húngara} 
1. e4 e5 2. Nf3 Nc6 3. Bc4 Be7 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "King's Gambit"]
[Black "?"]
[Result "*"]
[ECO "C30"]
[PlyCount "3"]
[EventDate "2002.08.08"]

{Königsgambit  Gambit du Roi Gambito de Rey} 1. e4 e5 2. f4 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "King's Indian Defence"]
[Black "?"]
[Result "*"]
[ECO "E61"]
[PlyCount "6"]
[EventDate "2002.08.08"]

{Königsindische Verteidigung  Défense est-indienne Defensa India de Rey} 1. d4
Nf6 2. c4 g6 3. Nc3 Bg7 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "King's Indian Defence"]
[Black "Averbach Variation"]
[Result "*"]
[ECO "E73"]
[PlyCount "11"]
[EventDate "2002.08.08"]

{Königsindische Verteidigung Averbach-Variante  Défense est-indienne Variante
Averbach Defensa India de Rey Variante Averbach} 1. d4 Nf6 2. c4 g6 3. Nc3 Bg7
4. e4 d6 5. Be2 O-O 6. Bg5 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "King's Indian Defence"]
[Black "Classical System"]
[Result "*"]
[ECO "E91"]
[PlyCount "11"]
[EventDate "2002.08.08"]

{Königsindische Verteidigung Klassisches System  Défense est-indienne Variante
classique Defensa India de Rey Sistema Clásico} 1. d4 Nf6 2. c4 g6 3. Nc3 Bg7
4. e4 d6 5. Nf3 O-O 6. Be2 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "King's Indian Defence"]
[Black "Fianchetto Variation"]
[Result "*"]
[ECO "E62"]
[PlyCount "9"]
[EventDate "2002.08.08"]

{Königsindische Verteidigung Fianchetto-Variante  Défense est-indienne
Variante du fianchetto Defensa India de Rey Variante del Fianchetto} 1. d4 Nf6
2. c4 g6 3. Nc3 Bg7 4. Nf3 d6 5. g3 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "King's Indian Defence"]
[Black "Four Pawns Attack"]
[Result "*"]
[ECO "E76"]
[PlyCount "9"]
[EventDate "2002.08.08"]

{Königsindische Verteidigung Vierbauern-Angriff  Défense est-indienne Attaque
des quatre Pions Defensa India de Rey Ataque de los 4 Peones} 1. d4 Nf6 2. c4
g6 3. Nc3 Bg7 4. e4 d6 5. f4 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "King's Indian Defence"]
[Black "Panno Variation"]
[Result "*"]
[ECO "E63"]
[PlyCount "14"]
[EventDate "2002.08.08"]

{Königsindische Verteidigung Panno-Variante  Défense est-indienne Variante
Panno Defensa India de Rey Variante Panno} 1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. Nf3
d6 5. g3 O-O 6. Bg2 Nc6 7. O-O a6 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "King's Indian Defence"]
[Black "Petrosian's System"]
[Result "*"]
[ECO "E92"]
[PlyCount "13"]
[EventDate "2002.08.08"]

{Königsindische Verteidigung Petrosian-System  Défense est-indienne Variante
Petrossian Defensa India de Rey Sistema Petrosian} 1. d4 Nf6 2. c4 g6 3. Nc3
Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. d5 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "King's Indian Defence"]
[Black "Smyslov Variation"]
[Result "*"]
[ECO "E61"]
[PlyCount "9"]
[EventDate "2002.08.08"]

{Königsindische Verteidigung Smyslov-Variante  Défense est-indienne Variante
Smyslov Defensa India de Rey Variante Smyslov} 1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4.
Nf3 d6 5. Bg5 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "King's Indian Defence"]
[Black "Sämisch Variation"]
[Result "*"]
[ECO "E80"]
[PlyCount "9"]
[EventDate "2002.08.08"]

{Königsindische Verteidigung Sämisch-Variante  Défense est-indienne Variante
Sämisch Defensa India de Rey Variante Sämisch} 1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4.
e4 d6 5. f3 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Latvian Gambit"]
[Black "?"]
[Result "*"]
[ECO "C40"]
[PlyCount "4"]
[EventDate "2002.08.08"]

{Lettisches Gambit  Gambit letton Gambito Letón} 1. e4 e5 2. Nf3 f5 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Nimzo Indian Defence"]
[Black "?"]
[Result "*"]
[ECO "E20"]
[PlyCount "6"]
[EventDate "2002.08.08"]

{Nimzo-Indische Verteidigung  Défense Nimzo-indienne Defensa Nimzoindia} 1. d4
Nf6 2. c4 e6 3. Nc3 Bb4 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Nimzo Indian Defence"]
[Black "Hübner's System"]
[Result "*"]
[ECO "E41"]
[PlyCount "8"]
[EventDate "2002.08.08"]

{Nimzo-Indische Verteidigung Hübner-System  Défense Nimzo-indienne Système
Hübner Defensa Nimzoindia Sistema Hübner} 1. d4 Nf6 2. c4 e6 3. Nc3 Bb4 4. e3
c5 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Nimzo Indian Defence"]
[Black "Leningrad System"]
[Result "*"]
[ECO "E30"]
[PlyCount "7"]
[EventDate "2002.08.08"]

{Nimzo-Indische Verteidigung Leningrader System  Défense Nimzo-indienne
Système Leningrad Defensa Nimzoindia Sistema Leningrado} 1. d4 Nf6 2. c4 e6 3.
Nc3 Bb4 4. Bg5 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Nimzo Indian Defence"]
[Black "Rubinstein Variation"]
[Result "*"]
[ECO "E40"]
[PlyCount "7"]
[EventDate "2002.08.08"]

{Nimzo-Indische Verteidigung Rubinstein-Variante  Défense Nimzo-indienne
Système Rubinstein Defensa Nimzoindia Variante Rubinstein} 1. d4 Nf6 2. c4 e6
3. Nc3 Bb4 4. e3 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Nimzo Indian Defence"]
[Black "Sämisch Variation"]
[Result "*"]
[ECO "E20"]
[PlyCount "7"]
[EventDate "2002.08.08"]

{Nimzo-Indische Verteidigung Sämisch-Variante  Défense Nimzo-indienne Variante
Sämisch Defensa Nimzoindia Variante Sämisch} 1. d4 Nf6 2. c4 e6 3. Nc3 Bb4 4.
a3 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Nimzo Indian Defence"]
[Black "Taimanov Variation"]
[Result "*"]
[ECO "E40"]
[PlyCount "8"]
[EventDate "2002.08.08"]

{Nimzo-Indische Verteidigung Taimanov-Variante  Défense Nimzo-indienne
Variante Taïmanov Defensa Nimzoindia Variante Taimanov} 1. d4 Nf6 2. c4 e6 3.
Nc3 Bb4 4. e3 Nc6 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Old Indian Defence"]
[Black "?"]
[Result "*"]
[ECO "A53"]
[PlyCount "4"]
[EventDate "2002.08.08"]

{Altindische Verteidigung  Défense vieille indienne Defensa India Antigua} 1.
d4 Nf6 2. c4 d6 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Old Indian Defence"]
[Black "Janowski Variation"]
[Result "*"]
[ECO "A53"]
[PlyCount "6"]
[EventDate "2002.08.08"]

{Altindische Verteidigung Janowski-Variante  Défense vieille indienne Variante
Janowski Defensa India Antigua Variante Janowski} 1. d4 Nf6 2. c4 d6 3. Nc3 Bf5
*

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Old Indian Defence"]
[Black "Main Variation"]
[Result "*"]
[ECO "A54"]
[PlyCount "8"]
[EventDate "2002.08.08"]

{Altindische Verteidigung Hauptvariante  Défense vieille indienne Variante
principale Defensa India Antigua Variante Principal} 1. d4 Nf6 2. c4 d6 3. Nc3
Nbd7 4. Nf3 e5 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Philidor's Defence"]
[Black "?"]
[Result "*"]
[ECO "C41"]
[PlyCount "4"]
[EventDate "2002.08.08"]

{Philidor-Verteidigung  Défense Philidor Defensa Philidor} 1. e4 e5 2. Nf3 d6 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Pirc Robatsch Defence"]
[Black "?"]
[Result "*"]
[ECO "B07"]
[PlyCount "2"]
[EventDate "2002.08.08"]

{Pirc-Ufimzew Verteidigung  Défense Pirc Defensa Pirc Robatsch} 1. e4 d6 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Pirc Robatsch Defence"]
[Black "Classical Variation"]
[Result "*"]
[ECO "B08"]
[PlyCount "7"]
[EventDate "2002.08.08"]

{Pirc-Ufimzew Verteidigung Klassische Variante  Défense Pirc Variante
classique Defensa Pirc Robatsch Variante Clásica} 1. e4 d6 2. d4 Nf6 3. Nc3 g6
4. Nf3 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Pirc Robatsch Defence"]
[Black "Three Pawns Attack"]
[Result "*"]
[ECO "B09"]
[PlyCount "7"]
[EventDate "2002.08.08"]

{Pirc-Ufimzew Verteidigung Dreibauernangriff  Défense Pirc Attaque
autrichienne Defensa Pirc Robatsch Ataque de los 3 Peones} 1. e4 d6 2. d4 Nf6
3. Nc3 g6 4. f4 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Ponziani's Opening"]
[Black "?"]
[Result "*"]
[ECO "C44"]
[PlyCount "5"]
[EventDate "2002.08.08"]

{Ponziani-Eröffnung  Début Ponziani Apertura Ponziani} 1. e4 e5 2. Nf3 Nc6 3.
c3 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Queen's Gambit"]
[Black "?"]
[Result "*"]
[ECO "D06"]
[PlyCount "3"]
[EventDate "2002.08.08"]

{Damengambit  Gambit Dame Gambito de Dama} 1. d4 d5 2. c4 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Queen's Gambit"]
[Black "Accepted"]
[Result "*"]
[ECO "D20"]
[PlyCount "4"]
[EventDate "2002.08.08"]

{Damengambit Angenommenes Damengambit  Gambit Dame Accepté Gambito de Dama
Aceptado} 1. d4 d5 2. c4 dxc4 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Queen's Gambit"]
[Black "Albin Counter Gambit"]
[Result "*"]
[ECO "D08"]
[PlyCount "4"]
[EventDate "2002.08.08"]

{Damengambit Albins Gegengambit  Gambit Dame Contre-gambit Albin Gambito de
Dama Contragambito Albin} 1. d4 d5 2. c4 e5 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Queen's Gambit"]
[Black "Exchange Variation"]
[Result "*"]
[ECO "D35"]
[PlyCount "8"]
[EventDate "2002.08.08"]

{Damengambit Abtauschvariante  Gambit Dame Variante d'échange Gambito de Dama
Variante del Cambio} 1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. cxd5 exd5 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Queen's Gambit"]
[Black "Orthodox Defence"]
[Result "*"]
[ECO "D60"]
[PlyCount "12"]
[EventDate "2002.08.08"]

{Damengambit Orthodoxe Verteidigung  Gambit Dame Défense orthodoxe Gambito de
Dama Defensa Ortodoxa} 1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 Be7 5. e3 O-O 6. Nf3
Nbd7 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Queen's Gambit"]
[Black "Semi-Slav Defence"]
[Result "*"]
[ECO "D43"]
[PlyCount "8"]
[EventDate "2002.08.08"]

{Damengambit Halbslawische Verteidigung  Gambit Dame Défense semi-slave
Gambito de Dama Defensa Semieslava} 1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 e6 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Queen's Gambit"]
[Black "Slav Defence"]
[Result "*"]
[ECO "D10"]
[PlyCount "4"]
[EventDate "2002.08.08"]

{Damengambit Slawische Verteidigung  Gambit Dame Défense slave Gambito de Dama
Defensa Eslava} 1. d4 d5 2. c4 c6 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Queen's Gambit"]
[Black "Tarrasch Defence"]
[Result "*"]
[ECO "D32"]
[PlyCount "6"]
[EventDate "2002.08.08"]

{Damengambit Tarrasch-Verteidigung  Gambit Dame Défense Tarrasch Gambito de
Dama Defensa Tarrasch} 1. d4 d5 2. c4 e6 3. Nc3 c5 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Queen's Gambit"]
[Black "Tchigorin Variation"]
[Result "*"]
[ECO "D07"]
[PlyCount "4"]
[EventDate "2002.08.08"]

{Damengambit Tschigorin-Variante  Gambit Dame Défense Tchigorine Gambito de
Dama Variante Chigorin} 1. d4 d5 2. c4 Nc6 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Queen's Indian Defence"]
[Black "?"]
[Result "*"]
[ECO "E12"]
[PlyCount "6"]
[EventDate "2002.08.08"]

{Damenindische Verteidigung  Défense ouest-indienne Defensa India de Dama} 1.
d4 Nf6 2. c4 e6 3. Nf3 b6 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Queen's Indian Defence"]
[Black "Petrosian's System"]
[Result "*"]
[ECO "E12"]
[PlyCount "7"]
[EventDate "2002.08.08"]

{Damenindische Verteidigung Petrosian-System  Défense ouest-indienne Système
Petrossian Defensa India de Dama Sistema Petrosian} 1. d4 Nf6 2. c4 e6 3. Nf3
b6 4. a3 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Reti Opening"]
[Black "?"]
[Result "*"]
[ECO "A09"]
[PlyCount "3"]
[EventDate "2002.08.08"]

{Reti-Eröffnung  Début Reti Apertura Reti} 1. Nf3 d5 2. c4 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Russian Defence"]
[Black "?"]
[Result "*"]
[ECO "C42"]
[PlyCount "4"]
[EventDate "2002.08.08"]

{Russische Verteidigung  Défense russe Defensa Petrov} 1. e4 e5 2. Nf3 Nf6 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Ruy Lopez"]
[Black "?"]
[Result "*"]
[ECO "C60"]
[PlyCount "5"]
[EventDate "2002.08.08"]

{Spanische Partie  Partie espagnole Ruy Lopez} 1. e4 e5 2. Nf3 Nc6 3. Bb5 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Ruy Lopez"]
[Black "Alapin Variation"]
[Result "*"]
[ECO "C60"]
[PlyCount "6"]
[EventDate "2002.08.08"]

{Spanische Partie Alapin-Variante  Partie espagnole Variante Alapine Ruy Lopez
Variante Alapin} 1. e4 e5 2. Nf3 Nc6 3. Bb5 Bb4 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Ruy Lopez"]
[Black "Berlin Defence"]
[Result "*"]
[ECO "C65"]
[PlyCount "6"]
[EventDate "2002.08.08"]

{Spanische Partie Berliner Verteidigung  Partie espagnole Défense berlinoise
Ruy Lopez Defensa Berlinesa} 1. e4 e5 2. Nf3 Nc6 3. Bb5 Nf6 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Ruy Lopez"]
[Black "Bird's Defence"]
[Result "*"]
[ECO "C61"]
[PlyCount "6"]
[EventDate "2002.08.08"]

{Spanische Partie Bird-Verteidigung  Partie espagnole Défense Bird Ruy Lopez
Defensa Bird} 1. e4 e5 2. Nf3 Nc6 3. Bb5 Nd4 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Ruy Lopez"]
[Black "Brentano Variation"]
[Result "*"]
[ECO "C60"]
[PlyCount "6"]
[EventDate "2002.08.08"]

{Spanische Partie Brentano-Variante  Partie espagnole Variante Brentano Ruy
Lopez Variante Brentano} 1. e4 e5 2. Nf3 Nc6 3. Bb5 g5 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Ruy Lopez"]
[Black "Breyer Variation"]
[Result "*"]
[ECO "C94"]
[PlyCount "18"]
[EventDate "2002.08.08"]

{Spanische Partie Breyer-Variante  Partie espagnole Défense Breyer Ruy Lopez
Variante Breyer} 1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5
7. Bb3 d6 8. c3 O-O 9. h3 Nb8 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Ruy Lopez"]
[Black "Classical Defence"]
[Result "*"]
[ECO "C64"]
[PlyCount "6"]
[EventDate "2002.08.08"]

{Spanische Partie Klassische Verteidigung  Partie espagnole Variante Cordel
Ruy Lopez Defensa Clásica} 1. e4 e5 2. Nf3 Nc6 3. Bb5 Bc5 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Ruy Lopez"]
[Black "Cozio's Defence"]
[Result "*"]
[ECO "C60"]
[PlyCount "6"]
[EventDate "2002.08.08"]

{Spanische Partie Cozio-Verteidigung  Partie espagnole Défense Cozio Ruy Lopez
Defensa Cozio} 1. e4 e5 2. Nf3 Nc6 3. Bb5 Nge7 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Ruy Lopez"]
[Black "Delayed Exchange Variation"]
[Result "*"]
[ECO "C77"]
[PlyCount "9"]
[EventDate "2002.08.08"]

{Spanische Partie Verzögerte Abtauschvariante  Partie espagnole Variante
Treybal Ruy Lopez Variante del Cambio Diferida} 1. e4 e5 2. Nf3 Nc6 3. Bb5 a6
4. Ba4 Nf6 5. Bxc6 (5. O-O Be7 6. Bxc6) *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Ruy Lopez"]
[Black "Exchange Variation"]
[Result "*"]
[ECO "C68"]
[PlyCount "7"]
[EventDate "2002.08.08"]

{Spanische Partie Abtauschvariante  Partie espagnole Variante d'échange Ruy
Lopez Variante del Cambio} 1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Bxc6 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Ruy Lopez"]
[Black "Marshall Attack"]
[Result "*"]
[ECO "C89"]
[PlyCount "16"]
[EventDate "2002.08.08"]

{Spanische Partie Marshall-Angriff  Partie espagnole Gambit Marshall Ruy Lopez
Ataque Marshall} 1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5
7. Bb3 O-O 8. c3 d5 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Ruy Lopez"]
[Black "Modern Steinitz Defence"]
[Result "*"]
[ECO "C71"]
[PlyCount "8"]
[EventDate "2002.08.08"]

{Spanische Partie Moderne Steinitz-Verteidigung  Partie espagnole Défense
Steinitz moderne Ruy Lopez Defensa Steinitz Moderna} 1. e4 e5 2. Nf3 Nc6 3. Bb5
a6 4. Ba4 d6 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Ruy Lopez"]
[Black "Old Steinitz Defence"]
[Result "*"]
[ECO "C62"]
[PlyCount "6"]
[EventDate "2002.08.08"]

{Spanische Partie Alte Steinitz-Verteidigung  Partie espagnole Défense
Steinitz Ruy Lopez Defensa Steinitz Antigua} 1. e4 e5 2. Nf3 Nc6 3. Bb5 d6 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Ruy Lopez"]
[Black "Open Defence"]
[Result "*"]
[ECO "C80"]
[PlyCount "10"]
[EventDate "2002.08.08"]

{Spanische Partie Offene Verteidigung  Partie espagnole Défense ouverte Ruy
Lopez Defensa Abierta} 1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Nxe4 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Ruy Lopez"]
[Black "Saitzev Variation"]
[Result "*"]
[ECO "C92"]
[PlyCount "20"]
[EventDate "2002.08.08"]

{Spanische Partie Saitzev-Variante  Partie espagnole Variante Zaïtsev Ruy
Lopez Variante Saitzev} 1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6.
Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Bb7 10. d4 Re8 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Ruy Lopez"]
[Black "Schliemann Defence"]
[Result "*"]
[ECO "C63"]
[PlyCount "6"]
[EventDate "2002.08.08"]

{Spanische Partie Jänisch-Gambit  Partie espagnole Gambit Jänisch Ruy Lopez
Defensa Schliemann} 1. e4 e5 2. Nf3 Nc6 3. Bb5 f5 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Ruy Lopez"]
[Black "Smyslov Variation"]
[Result "*"]
[ECO "C93"]
[PlyCount "18"]
[EventDate "2002.08.08"]

{Spanische Partie Smyslov-Variante  Partie espagnole Variante Smyslov Ruy
Lopez Variante Smyslov} 1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6.
Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 h6 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Ruy Lopez"]
[Black "Symslov Variation"]
[Result "*"]
[ECO "C60"]
[PlyCount "6"]
[EventDate "2002.08.08"]

{Spanische Partie Smyslov-Variante  Partie espagnole Défense du fianchetto Ruy
Lopez Variante Symslov} 1. e4 e5 2. Nf3 Nc6 3. Bb5 g6 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Ruy Lopez"]
[Black "Tchigorin Defence"]
[Result "*"]
[ECO "C92"]
[PlyCount "18"]
[EventDate "2002.08.08"]

{Spanische Partie Tschigorin-Verteidigung  Partie espagnole Variante
Tchigorine Ruy Lopez Defensa Chigorin} 1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6
5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Na5 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Scandinavian Defence"]
[Black "?"]
[Result "*"]
[ECO "B01"]
[PlyCount "2"]
[EventDate "2002.08.08"]

{Skandinavische Verteidigung  Défense scandinave Defensa Escandinava} 1. e4 d5
*

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Scotch Game"]
[Black "?"]
[Result "*"]
[ECO "C44"]
[PlyCount "5"]
[EventDate "2002.08.08"]

{Schottische Partie  Partie écossaise Partida Escocesa} 1. e4 e5 2. Nf3 Nc6 3.
d4 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Scotch Game"]
[Black "Mieses Variation"]
[Result "*"]
[ECO "C45"]
[PlyCount "11"]
[EventDate "2002.08.08"]

{Schottische Partie Mieses-Variante  Partie écossaise Variante Mieses Partida
Escocesa Variante Mieses} 1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Nxd4 Nf6 5. Nxc6
bxc6 6. e5 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Scotch Game"]
[Black "Scotch Gambit"]
[Result "*"]
[ECO "C55"]
[PlyCount "9"]
[EventDate "2002.08.08"]

{Schottische Partie Schottisches Gambit  Partie écossaise Gambit écossais
Partida Escocesa Gambito Escocés} 1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Bc4 Nf6 5.
O-O *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Scotch Game"]
[Black "Steinitz Variation"]
[Result "*"]
[ECO "C45"]
[PlyCount "8"]
[EventDate "2002.08.08"]

{Schottische Partie Steinitz-Variante  Partie écossaise Variante Steinitz
Partida Escocesa Variante Steinitz} 1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Nxd4 Qh4
*

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Sicilian Defence"]
[Black "?"]
[Result "*"]
[ECO "B20"]
[PlyCount "2"]
[EventDate "2002.08.08"]

{Sizilianische Verteidigung  Défense sicilienne Defensa Siciliana} 1. e4 c5 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Sicilian Defence"]
[Black "Accelerated Dragon Variation"]
[Result "*"]
[ECO "B34"]
[PlyCount "8"]
[EventDate "2002.08.08"]

{Sizilianische Verteidigung Beschleunigte Drachen-Variante  Défense sicilienne
Dragon accéléré Defensa Siciliana Variante del Dragón Acelerada} 1. e4 c5 2.
Nf3 Nc6 3. d4 cxd4 4. Nxd4 g6 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Sicilian Defence"]
[Black "Alapin Variation"]
[Result "*"]
[ECO "B22"]
[PlyCount "3"]
[EventDate "2002.08.08"]

{Sizilianische Verteidigung Alapin-Variante  Défense sicilienne Variante
Alapine Defensa Siciliana Variante Alapin} 1. e4 c5 2. c3 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Sicilian Defence"]
[Black "Classical Variation"]
[Result "*"]
[ECO "B56"]
[PlyCount "10"]
[EventDate "2002.08.08"]

{Sizilianische Verteidigung Klassische Variante  Défense sicilienne Variante
des quatre Cavaliers Defensa Siciliana Variante Clásica} 1. e4 c5 2. Nf3 d6 3.
d4 cxd4 4. Nxd4 Nf6 5. Nc3 Nc6 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Sicilian Defence"]
[Black "Closed Variation"]
[Result "*"]
[ECO "B23"]
[PlyCount "3"]
[EventDate "2002.08.08"]

{Sizilianische Verteidigung Geschlossene Variante  Défense sicilienne Variante
fermée Defensa Siciliana Variante Cerrada} 1. e4 c5 2. Nc3 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Sicilian Defence"]
[Black "Dragon Variation"]
[Result "*"]
[ECO "B70"]
[PlyCount "10"]
[EventDate "2002.08.08"]

{Sizilianische Verteidigung Drachen-Variante  Défense sicilienne Variante du
dragon Defensa Siciliana Variante del Dragón} 1. e4 c5 2. Nf3 d6 3. d4 cxd4 4.
Nxd4 Nf6 5. Nc3 g6 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Sicilian Defence"]
[Black "Four Knights Variation"]
[Result "*"]
[ECO "B40"]
[PlyCount "9"]
[EventDate "2002.08.08"]

{Sizilianische Verteidigung Vierspringer-Variante  Défense sicilienne Attaque
Richter-Rauzer Defensa Siciliana Variante de los 4 Caballos} 1. e4 c5 2. Nf3 e6
3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Sicilian Defence"]
[Black "Kalashnikov Variation"]
[Result "*"]
[ECO "B32"]
[PlyCount "10"]
[EventDate "2002.08.08"]

{Sizilianische Verteidigung Kalaschnikov-Variante  Défense sicilienne Variante
Kalashnikov Defensa Siciliana Variante Kalashnikov} 1. e4 c5 2. Nf3 Nc6 3. d4
cxd4 4. Nxd4 e5 5. Nb5 d6 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Sicilian Defence"]
[Black "Löwenthal Variation"]
[Result "*"]
[ECO "B32"]
[PlyCount "10"]
[EventDate "2002.08.08"]

{Sizilianische Verteidigung Löwenthal-Variante  Défense sicilienne Variante
Löwenthal Defensa Siciliana Variante Löwenthal} 1. e4 c5 2. Nf3 Nc6 3. d4 cxd4
4. Nxd4 e5 5. Nb5 a6 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Sicilian Defence"]
[Black "Morra-Gambit"]
[Result "*"]
[ECO "B21"]
[PlyCount "3"]
[EventDate "2002.08.08"]

{Sizilianische Verteidigung Morra-Gambit  Défense sicilienne Gambit Morra
Defensa Siciliana Gambito Morra} 1. e4 c5 2. d4 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Sicilian Defence"]
[Black "Najdorf Variation"]
[Result "*"]
[ECO "B90"]
[PlyCount "10"]
[EventDate "2002.08.08"]

{Sizilianische Verteidigung Najdorf-Variante  Défense sicilienne Variante
Najdorf Defensa Siciliana Variante Najdorf} 1. e4 c5 2. Nf3 d6 3. d4 cxd4 4.
Nxd4 Nf6 5. Nc3 a6 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Sicilian Defence"]
[Black "Paulsen Variation"]
[Result "*"]
[ECO "B41"]
[PlyCount "8"]
[EventDate "2002.08.08"]

{Sizilianische Verteidigung Paulsen-Variante  Défense sicilienne Variante
Paulsen Defensa Siciliana Variante Paulsen} 1. e4 c5 2. Nf3 e6 3. d4 cxd4 4.
Nxd4 a6 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Sicilian Defence"]
[Black "Scheveningen Variation"]
[Result "*"]
[ECO "B80"]
[PlyCount "10"]
[EventDate "2002.08.08"]

{Sizilianische Verteidigung Scheveninger Variante  Défense sicilienne Variante
Scheveningue Defensa Siciliana Variante Scheveningen} 1. e4 c5 2. Nf3 d6 3. d4
cxd4 4. Nxd4 Nf6 5. Nc3 e6 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Sicilian Defence"]
[Black "Sveshnikov Variation"]
[Result "*"]
[ECO "B33"]
[PlyCount "10"]
[EventDate "2002.08.08"]

{Sizilianische Verteidigung Sveschnikov-Variante  Défense sicilienne Variante
Svechnikov Defensa Siciliana Variante Sveshnikov} 1. e4 c5 2. Nf3 Nc6 3. d4
cxd4 4. Nxd4 Nf6 5. Nc3 e5 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Sicilian Defence"]
[Black "Taimanov Variation"]
[Result "*"]
[ECO "B44"]
[PlyCount "8"]
[EventDate "2002.08.08"]

{Sizilianische Verteidigung Taimanov-Variante  Défense sicilienne Variante
Taïmanov Defensa Siciliana Variante Taimanov} 1. e4 c5 2. Nf3 e6 3. d4 cxd4 4.
Nxd4 Nc6 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Three Knights' Game"]
[Black "?"]
[Result "*"]
[ECO "C46"]
[PlyCount "5"]
[EventDate "2002.08.08"]

{Dreispringerspiel  Partie des trois Cavaliers Partida de los 3 Caballos} 1. e4
e5 2. Nf3 Nc6 3. Nc3 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Trompovski's Opening"]
[Black "?"]
[Result "*"]
[ECO "A45"]
[PlyCount "3"]
[EventDate "2002.08.08"]

{Trompowski-Eröffnung  Partie du Pion Dame Attaque Trompovsky Apertura
Trompovski} 1. d4 Nf6 2. Bg5 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Two Knights' Defence"]
[Black "?"]
[Result "*"]
[ECO "C55"]
[PlyCount "6"]
[EventDate "2002.08.08"]

{Zweispringerspiel im Nachzuge  Défense des deux Cavaliers Defensa de los 2
Caballos} 1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Two Knights' Defence"]
[Black "Polerio Variation"]
[Result "*"]
[ECO "C58"]
[PlyCount "11"]
[EventDate "2002.08.08"]

{Zweispringerspiel im Nachzuge Polerio-Variante  Défense des deux Cavaliers
Variante Fritz Defensa de los 2 Caballos Variante Polerio} 1. e4 e5 2. Nf3 Nc6
3. Bc4 Nf6 4. Ng5 d5 5. exd5 Na5 6. Bb5+ *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Two Knights' Defence"]
[Black "Traxler's Counter Gambit"]
[Result "*"]
[ECO "C57"]
[PlyCount "8"]
[EventDate "2002.08.08"]

{Zweispringerspiel im Nachzuge Traxler-Gegenangriff  Défense des deux
Cavaliers Variante Traxler Defensa de los 2 Caballos Contragambito Traxler} 1.
e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. Ng5 Bc5 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Vienna Game"]
[Black "?"]
[Result "*"]
[ECO "C25"]
[PlyCount "3"]
[EventDate "2002.08.08"]

{Wiener Partie  Partie viennoise Partida Vienesa} 1. e4 e5 2. Nc3 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Vienna Game"]
[Black "Steinitz Gambit"]
[Result "*"]
[ECO "C25"]
[PlyCount "7"]
[EventDate "2002.08.08"]

{Wiener Partie Steinitz-Gamibit  Partie viennoise Gambit Steinitz Partida
Vienesa Gambito Steinitz} 1. e4 e5 2. Nc3 Nc6 3. f4 exf4 4. d4 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Volga Gambit"]
[Black "?"]
[Result "*"]
[ECO "A57"]
[PlyCount "6"]
[EventDate "2002.08.08"]

{Wolga.Gambit  Gambit Benko Gambito Volga} 1. d4 Nf6 2. c4 c5 3. d5 b5 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Volga Gambit"]
[Black "Accepted"]
[Result "*"]
[ECO "A58"]
[PlyCount "9"]
[EventDate "2002.08.08"]

{Wolga-Gambit Angenommen  Gambit Benko Accepté Gambito Volga Aceptado} 1. d4
Nf6 2. c4 c5 3. d5 b5 4. cxb5 a6 5. bxa6 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Volga Gambit"]
[Black "Main Variation"]
[Result "*"]
[ECO "A59"]
[PlyCount "21"]
[EventDate "2002.08.08"]

{Wolga-Gambit Hauptvariante  Gambit Benko Variante principale Gambito Volga
Variante Principal} 1. d4 Nf6 2. c4 c5 3. d5 b5 4. cxb5 a6 5. bxa6 Bxa6 6. Nc3
d6 7. e4 Bxf1 8. Kxf1 g6 9. g3 Bg7 10. Kg2 O-O 11. Nf3 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Volga Gambit"]
[Black "Saitzev System"]
[Result "*"]
[ECO "A57"]
[PlyCount "9"]
[EventDate "2002.08.08"]

{Wolga-Gambit Saitzev-System  Gambit Benko Système Zaïtsev Gambito Volga
Sistema Saitzev} 1. d4 Nf6 2. c4 c5 3. d5 b5 4. cxb5 a6 5. Nc3 *

[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Vulture"]
[Black "?"]
[Result "*"]
[ECO "A56"]
[PlyCount "6"]
[EventDate "2002.08.08"]

{Geier  Défense Benoni Défense Vulture Apertura del Buitre} 1. d4 Nf6 2. c4 c5
3. d5 Ne4 *
`;
