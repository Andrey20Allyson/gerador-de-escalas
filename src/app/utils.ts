export function* keys<O extends {}>(object: O): Iterable<keyof O> {
  for (const k in object) {
    yield k;
  }
}

export function createConfig<T extends object>(partialConfig: Partial<T>, defaultConfig: T): T {
  const newConfig: Partial<T> = {};

  const rawKeys = [
    ...Object.getOwnPropertyNames(partialConfig),
    ...Object.getOwnPropertySymbols(partialConfig),
    ...Object.getOwnPropertyNames(defaultConfig),
    ...Object.getOwnPropertySymbols(defaultConfig),
  ] as Array<keyof T>;

  const keys = new Set(rawKeys);

  for (const key of keys) {
    const value = partialConfig[key] ?? defaultConfig[key];
    
    newConfig[key] = value;
  }

  return newConfig as T;
}

export type StaticConfigFactory<T> = (partialConfig: Partial<T>) => T;

export function createStaticConfigFactory<T extends object>(defaultConfig: T): StaticConfigFactory<T> {
  return partial => createConfig(partial, defaultConfig);
}