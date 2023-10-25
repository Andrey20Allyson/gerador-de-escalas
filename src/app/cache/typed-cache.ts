import { ZodType } from "zod";
import { DefaultCacheIO, DiskCache } from ".";
import { colletionHeaderSchema, createRegistryEntrySchema, RegistryEntryType } from "../base";

function cacheHeaderParser(data: Buffer) {
  const str = data.toString('utf-8');
  const json = JSON.parse(str);

  return colletionHeaderSchema.parse(json);
}

function createCacheEntriesParser<T>(documentEntryDataSchema: ZodType<T>) {
  const entriesSchema = createRegistryEntrySchema(documentEntryDataSchema).array();

  return (data: Buffer): RegistryEntryType<T>[] => {
    const str = data.toString('utf-8');
    const json = JSON.parse(str);

    return entriesSchema.parse(json);
  }
}

export interface TypedDiskCacheConfig<T> {
  prefix: string,
  schema: ZodType<T>,
  entriesSufix?: string,
  headerSufix?: string,
}

export class TypedDiskCache<T> extends DiskCache<T> {
  constructor(config: TypedDiskCacheConfig<T>) {
    const {
      prefix,
      schema,
      entriesSufix = '.entries',
      headerSufix = '.header',
    } = config;

    super({
      entries: new DefaultCacheIO({
        namespace: prefix + entriesSufix,
        parser: createCacheEntriesParser(schema),
      }),
      header: new DefaultCacheIO({
        namespace: prefix + headerSufix,
        parser: cacheHeaderParser,
      })
    });
  }
}