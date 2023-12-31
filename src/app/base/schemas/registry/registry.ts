import zod, { ZodType } from 'zod';

export function createRegistryEntrySchema<T>(schema: ZodType<T>) {
  return zod.object({
    id: zod.string(),
    data: schema,
  });
}

export type RegistryEntrySchemaType<T> = ReturnType<typeof createRegistryEntrySchema<T>>;
export type RegistryEntryType<T> = zod.infer<RegistryEntrySchemaType<T>>;

export type OptionalIDRegistryEntryType<T> = {
  id?: string;
  data: T;
}

export type PartialDataRegistryEntryType<T> = {
  id: string;
  data: Partial<T>;
};