export type PartialExcept<T, K extends keyof T = never> = Partial<T> & Pick<T, K>;
export type DefaultConfig<C, K extends keyof C> = Omit<C, K>;

export type Config<C = {}, MandatoryField extends keyof C = never> = {
  config: C;
  partial: PartialExcept<C, MandatoryField>;
  defaults: DefaultConfig<C, MandatoryField>;
};

export namespace Config {
  export type Any = Config<any, any>;
  export type From<C extends Config.Any> = C['config'];
  export type Partial<C extends Config.Any> = C['partial'];
  export type PartialWithOut<C extends Config.Any, Except extends keyof From<C> = never> = Omit<Partial<C>, Except>;
  export type Defaults<C extends Config> = C['defaults'];

  function keysOf<O extends Config>(o: Partial<O> | Defaults<O>): (keyof From<O>)[] {
    return [...Object.getOwnPropertyNames(o), ...Object.getOwnPropertySymbols(o)] as (keyof From<O>)[];
  }

  function keysSetFrom<O extends Config>(o: Array<Partial<O> | Defaults<O>>): Set<keyof From<O>> {
    const keys = o.map(keysOf).flat(1);

    return new Set(keys);
  }

  export function from<C extends Config>(partial: Partial<C>, defaults: Defaults<C>): From<C> {
    const config: From<C> = {};

    const keys = new Set([
      ...keysOf(partial),
      ...keysOf(defaults),
    ]);

    for (const key of keys) {
      config[key] = partial[key] ?? defaults[key];
    }

    return config;
  }

  function partialHasThisKey<C extends Config>(this: string | symbol | number, partial: Partial<C>): boolean {
    return this in partial;
  }

  export function partial<C extends Config>(...partials: Partial<C>[]): Partial<C> {
    const partial: Partial<C> = {};

    const keys = keysSetFrom(partials);

    for (const key of keys) {
      const partialThatContainsKey = partials.find(partialHasThisKey, key);
      if (!partialThatContainsKey) continue;

      partial[key] = partialThatContainsKey[key];
    }

    return partial;
  }

  export type Intersection<C extends Config, Divergence extends keyof From<C> = never> = {
    partial: Partial<C>;
    divergence: Divergence;
    half: Omit<Partial<C>, Divergence>;
    rest: Pick<Partial<C>, Divergence>;
  };

  export namespace Intersection {
    export type Any = Intersection<Config.Any, any>;
    export type Partial<I extends Intersection.Any> = I['partial'];
    export type Divergence<I extends Intersection.Any> = I['divergence'];
    export type Half<I extends Intersection.Any> = I['half'];
    export type Rest<I extends Intersection.Any> = I['rest'];
  }

  export function intersection<I extends Intersection.Any>(
    half: Intersection.Half<I>,
    rest: Intersection.Rest<I>,
  ): Intersection.Partial<I> {
    return Config.partial(half, rest);
  }
}
