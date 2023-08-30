import { ZodType } from "zod";
import { DiskCache } from ".";
import { colletionHeaderSchema, createRegistryEntrySchema, RegistryEntryType } from "../base";
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
      entries: {
        contains: 'default-cache-io',
        content: {
          namespace: prefix + entriesSufix,
          parser: createCacheEntriesParser(schema),
        }
      },
      header: {
        contains: 'default-cache-io',
        content: {
          parser: cacheHeaderParser,
          namespace: prefix + headerSufix,
        }
      }
    });

    this.typedConfig = _config;
  }
}