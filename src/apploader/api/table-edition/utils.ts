export class IndexError extends Error {
  constructor(index: number, size: number) {
    super(`Index out of bounds, tried access element #${index} from Array with ${size} elements!`);
  }
}

export function normalizeIndex(index: number, size: number) {
  if (index < 0) index = size + index;
  if (index >= size) throw new IndexError(size, index);

  return index;
}