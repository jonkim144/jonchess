const isValidCoordinate = (coordinate: number) => coordinate > -1 && coordinate < 8;

export const KingAttackMap = (() => {
  const map = new Map<number, number[]>();
  [...Array(64).keys()].forEach((from) => {
    const x = from % 8;
    const y = Math.floor(from / 8);
    [
      [0, 1],
      [1, 1],
      [1, -1],
      [1, 0],
    ].forEach(([dx, dy]) => {
      [-1, 1].forEach((sign) => {
        const newX = x + dx * sign;
        const newY = y + dy * sign;
        if (!isValidCoordinate(newX)) return;
        if (!isValidCoordinate(newY)) return;

        if (!map.has(from)) map.set(from, []);
        map.get(from).push(newX + 8 * newY);
      });
    });
  });
  return map;
})();

export const RookAttackMap = (() => {
  const map = new Map<number, number[][]>();
  [...Array(64).keys()].forEach((from) => {
    map.set(from, []);
    const x = from % 8;
    const y = Math.floor(from / 8);
    [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ].forEach(([dx, dy]) => {
      let newX = x + dx;
      let newY = y + dy;
      const nextRayIndex = map.get(from).length;
      while (isValidCoordinate(newX) && isValidCoordinate(newY)) {
        if (!map.get(from)[nextRayIndex]) map.get(from).push([]);

        map.get(from)[nextRayIndex].push(newX + 8 * newY);
        newX += dx;
        newY += dy;
      }
    });
  });
  return map;
})();

export const BishopAttackMap = (() => {
  const map = new Map<number, number[][]>();
  [...Array(64).keys()].forEach((from) => {
    map.set(from, []);
    const x = from % 8;
    const y = Math.floor(from / 8);
    [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ].forEach(([dx, dy]) => {
      let newX = x + dx;
      let newY = y + dy;
      const nextRayIndex = map.get(from).length;
      while (isValidCoordinate(newX) && isValidCoordinate(newY)) {
        if (!map.get(from)[nextRayIndex]) map.get(from).push([]);

        map.get(from)[nextRayIndex].push(newX + 8 * newY);
        newX += dx;
        newY += dy;
      }
    });
  });
  return map;
})();

export const KnightAttackMap = (() => {
  const map = new Map<number, number[]>();
  [...Array(64).keys()].forEach((from) => {
    if (!map.has(from)) map.set(from, []);
    const x = from % 8;
    const y = Math.floor(from / 8);
    [
      [1, 2],
      [1, -2],
      [2, 1],
      [2, -1],
    ].forEach(([dx, dy]) => {
      [-1, 1].forEach((sign) => {
        const newX = x + dx * sign;
        const newY = y + dy * sign;
        if (!isValidCoordinate(newX)) return;
        if (!isValidCoordinate(newY)) return;

        map.get(from).push(newX + 8 * newY);
      });
    });
  });
  return map;
})();

export const WhitePawnAttackMap = (() => {
  const map = new Map<number, number[]>();
  [...Array(64).keys()].forEach((from) => {
    if (!map.has(from)) map.set(from, []);
    const x = from % 8;
    const y = Math.floor(from / 8);
    [
      [1, -1],
      [-1, -1],
    ].forEach(([dx, dy]) => {
      const newX = x + dx;
      const newY = y + dy;
      if (!isValidCoordinate(newX)) return;
      if (!isValidCoordinate(newY)) return;

      map.get(from).push(newX + 8 * newY);
    });
  });
  return map;
})();

export const BlackPawnAttackMap = (() => {
  const map = new Map<number, number[]>();
  [...Array(64).keys()].forEach((from) => {
    if (!map.has(from)) map.set(from, []);
    const x = from % 8;
    const y = Math.floor(from / 8);
    [
      [1, 1],
      [-1, 1],
    ].forEach(([dx, dy]) => {
      const newX = x + dx;
      const newY = y + dy;
      if (!isValidCoordinate(newX)) return;
      if (!isValidCoordinate(newY)) return;

      map.get(from).push(newX + 8 * newY);
    });
  });
  return map;
})();
