export class Algebraic {
  static to(location: number): string {
    const file = location % 8;
    const rank = Math.floor(location / 8);
    return `${String.fromCharCode('a'.charCodeAt(0) + file)}${rank + 1}`;
  }

  static from(alg: string): number {
    const file = alg.charCodeAt(0) - 'a'.charCodeAt(0);
    const rank = parseInt(alg[1]) - 1;
    return file + 8 * rank;
  }
}
