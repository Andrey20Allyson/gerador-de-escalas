import zod from 'zod';

export const colletionHeaderSchema = zod.object({
  collectionName: zod.string(),
  lastUpdate: zod.number(),
  version: zod.number(),
});

export type CollectionHeaderSchemaType = typeof colletionHeaderSchema;
export type CollectionHeaderType = zod.infer<CollectionHeaderSchemaType>;