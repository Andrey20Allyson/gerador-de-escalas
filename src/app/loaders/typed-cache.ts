import { ZodType } from "zod";
import { colletionHeaderSchema, createRegistryEntrySchema, RegistryEntryType } from "../base";
import { DefaultCacheIO, DiskCache } from "../cache";

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

export class TypedDiskCache<T> extends DiskCache<T> {
  constructor(
    prefix: string,
    schema: ZodType<T>
  ) {
    const entriesSufix = '.entries';
    const headerSufix = '.header';

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
  }
}