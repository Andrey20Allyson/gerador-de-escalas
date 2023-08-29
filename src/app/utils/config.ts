export type PartialExcept<T, K extends keyof T = never> = Partial<T> & Pick<T, K>;
export type DefaultConfig<C, K extends keyof C> = Omit<C, K>;

export type Config<C = {}, MandatoryField extends keyof C = never> = {
  config: C;
  partial: PartialExcept<C, MandatoryField>;
  defaults: DefaultConfig<C, MandatoryField>;
};

export namespace Config {

  export type From<C extends Config<any, any>> = C['config'];
  export type Partial<C extends Config<any, any>> = C['partial'];
  export type Defaults<C extends Config> = C['defaults'];

  function keysOf<O extends Config>(o: Partial<O> | Defaults<O>): (keyof From<O>)[] {
    return [...Object.getOwnPropertyNames(o), ...Object.getOwnPropertySymbols(o)] as (keyof From<O>)[];
  }

  export function create<C extends Config>(partial: Partial<C>, defaults: Defaults<C>): From<C> {
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

  export type StaticConfigFactory<C extends Config> = (partial: Config.Partial<C>) => Config.From<C>;

  export function createStaticFactory<C extends Config<any, any>>(defaults: Defaults<C>): StaticConfigFactory<C> {
    return partial => create(partial, defaults);
  }
}
