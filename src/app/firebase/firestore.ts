import { app } from "./app";

export const firestore = app.firestore();

export namespace Collection {
  export const workerRegistries = firestore.collection('worker-registries');
  export const holidays = firestore.collection('holidays');
}