import { FirestoreInitializer } from "../../../firebase/app";
import { WorkerRegistryInit } from "../../../persistence/entities/worker-registry";
import { FirestoreWorkerRegistryRepository } from "../../../persistence/repositories/firestore-worker-registry-repository";
import { env } from "../../../utils/env";

const FIREBASE_KEY_PASSWORD = env('KEY_DECRYPT_PASSWORD');

export async function publishWorkerRegistries(registries: WorkerRegistryInit[]): Promise<void> {
  const initializer = new FirestoreInitializer({ password: FIREBASE_KEY_PASSWORD });
  const firestore = await initializer.getFirestore();

  const repository = new FirestoreWorkerRegistryRepository({ firestore });

  for (const registry of registries) {
    repository.create(registry);
  }
}