import { Board } from './board';
import { KingAttackMap, RookAttackMap, KnightAttackMap, BishopAttackMap, WhitePawnAttackMap, BlackPawnAttackMap } from './attack_maps';

export class CheckChecker {
  static isInCheck(board: Board, forWhite: boolean): boolean {
    let kingPosition: number;
    let PawnAttackMap: Map<number, number[]>;
    let enemyBishop: string, enemyQueen: string, enemyRook: string, enemyKnight: string, enemyPawn: string, enemyKing: string;
    if (!forWhite) {
      kingPosition = board.blackKingPosition;
      PawnAttackMap = WhitePawnAttackMap;
      enemyBishop = 'B';
      enemyQueen = 'Q';
      enemyRook = 'R';
      enemyKnight = 'N';
      enemyPawn = 'P';
      enemyKing = 'K';
    } else {
      kingPosition = board.whiteKingPosition;
      PawnAttackMap = BlackPawnAttackMap;
      enemyBishop = 'b';
      enemyQueen = 'q';
      enemyRook = 'r';
      enemyKnight = 'n';
      enemyPawn = 'p';
      enemyKing = 'k';
    }
    if (this.isInCheckBySlider(board, RookAttackMap, kingPosition, enemyRook, enemyQueen)) return true;
    if (this.isInCheckBySlider(board, BishopAttackMap, kingPosition, enemyBishop, enemyQueen)) return true;
    for (const knightLocation of KnightAttackMap.get(kingPosition)) {
      if (board.at(knightLocation) === enemyKnight) return true;
    }
    for (const pawnLocation of PawnAttackMap.get(kingPosition)) {
      if (board.at(pawnLocation) === enemyPawn) return true;
    }
    for (const enemyKingPosition of KingAttackMap.get(kingPosition)) {
      if (board.at(enemyKingPosition) === enemyKing) return true;
    }
    return false;
  }

  private static isInCheckBySlider(
    board: Board,
    AttackMap: Map<number, number[][]>,
    kingPosition: number,
    enemySlider: string,
    enemyQueen: string,
  ): boolean {
    for (const ray of AttackMap.get(kingPosition)) {
      for (let i = 0; i < ray.length; ++i) {
        const piece = board.at(ray[i]);
        if (piece !== '_') {
          if (piece === enemySlider || piece === enemyQueen) return true;

          break;
        }
      }
    }
    return false;
  }
}
