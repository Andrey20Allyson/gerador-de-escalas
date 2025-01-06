import { Graduation } from "../../../../extra-duty-lib";

export function randomGrad(): Graduation {
  const choice = Math.random();

  if (choice < 0.5) return "gcm";
  if (choice < 0.8) return "sub-insp";

  return "insp";
}
