import { ZodType } from "zod";
import { colletionHeaderSchema, createRegistryEntrySchema, RegistryEntryType } from "../base";
import { DefaultCacheIO, DiskCache } from ".";
import { Config } from "../utils/config";

function cacheHeaderParser(data: string) {
  const json = JSON.parse(data);

  return colletionHeaderSchema.parse(json);
}

function createCacheEntriesParser<T>(documentEntryDataSchema: ZodType<T>) {
  const entriesSchema = createRegistryEntrySchema(documentEntryDataSchema).array();

  return (data: string): RegistryEntryType<T>[] => {
    const json = JSON.parse(data);

    return entriesSchema.parse(json);
  }
}

export type TypedDiskCacheConfig<T> = Config<{
  prefix: string,
  schema: ZodType<T>,
  entriesSufix: string,
  headerSufix: string,
},
  | 'prefix'
  | 'schema'
>;

export class TypedDiskCache<T> extends DiskCache<T> {
  typedConfig: Config.From<TypedDiskCacheConfig<T>>;

  constructor(config: Config.Partial<TypedDiskCacheConfig<T>>) {
    const _config = Config.from<TypedDiskCacheConfig<T>>(config, {
      entriesSufix: '.entries',
      headerSufix: '.header',
    });

    const { entriesSufix, headerSufix, prefix, schema } = _config;

    super({
      entries: new DefaultCacheIO({
        namespace: prefix + entriesSufix,
        parser: createCacheEntriesParser(schema),
      }),
      header: new DefaultCacheIO({
        namespace: prefix + headerSufix,
        parser: cacheHeaderParser,
      }),
    });

    this.typedConfig = _config;
  }
}