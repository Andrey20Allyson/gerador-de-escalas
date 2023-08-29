export function* keys<O extends {}>(object: O): Iterable<keyof O> {
  for (const k in object) {
    yield k;
  }
}