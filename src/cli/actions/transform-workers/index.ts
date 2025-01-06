import { z } from "zod";
import { FirestoreInitializer } from "../../../firebase/app";
import { FirestoreWorkerRegistryRepository } from "../../../persistence/repositories/firestore-worker-registry-repository";
import { env } from "../../../../utils/env";
import { WorkerRegistry } from "../../../persistence/entities/worker-registry";
import path from "path";

export const transformWorkersOptionsSchema = z.object({
  source: z.string(),
});

export const transformerSchema = z.object({
  only: z.string().array().optional(),
  fn: z.function(),
});

const FIREBASE_KEY_PASSWORD = env('KEY_DECRYPT_PASSWORD');

export type TransformWorkersOptions = z.infer<typeof transformWorkersOptionsSchema>;

export type Transformer = z.infer<typeof transformerSchema>;

export async function transformWorkers(options: TransformWorkersOptions) {
  const modulePath = path.resolve(process.cwd(), options.source);

  const module = require(modulePath);

  const transformer: Transformer = transformerSchema.parse(module);

  await transform(transformer);

  console.log('modificações salvas com sucesso!');
}

async function transform(transformer: Transformer) {
  const storage = await getChunkStorage();

  const chunk = await storage.get(0);

  for (const worker of chunk.registries()) {
    if (transformer.only != null && transformer.only.includes(worker.workerId) === false) {
      continue;
    }

    const mutWorker = structuredClone(worker);

    const transformedWorker = transformer.fn(mutWorker) as WorkerRegistry;

    chunk.update(transformedWorker);
  }

  await chunk.persist();
}

async function getChunkStorage() {
  const initializer = new FirestoreInitializer({ password: FIREBASE_KEY_PASSWORD });
  const firestore = await initializer.getFirestore();

  const repository = new FirestoreWorkerRegistryRepository({ firestore });

  return repository.storage;
}