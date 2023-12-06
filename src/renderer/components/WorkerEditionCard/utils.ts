import { enumerate, iterReverse } from "../../utils";

export function formatWorkerID(id: number, endSize = 1) {
  const str = id.toString();
  const endSlice = str.slice(-endSize);
  let output = '-' + endSlice;

  for (const [i, char] of enumerate(iterReverse(str.slice(0, -endSize)))) {
    const separator = i > 0 && i % 3 === 0 ? '.' : '';
    output = char + separator + output;
  }

  return output;
}