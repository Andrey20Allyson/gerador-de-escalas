export type ClassLike<T, Params extends Array<any> = []> = new (
  ...params: Params
) => T;
