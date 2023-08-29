import admin from 'firebase-admin';

export const PATH_TO_SERVICE_ACCOUNT = './assets/gerador-de-escalas-baas-firebase-adminsdk.json';

export const app = admin.initializeApp({
  credential: admin.credential.cert(PATH_TO_SERVICE_ACCOUNT),
});

export const firestore = app.firestore();

export namespace Collection {
  export const workerRegistries = firestore.collection('worker-registries');
  export const holidays = firestore.collection('holidays');
}

export * from './update-info';
export * from './holidays.repository';