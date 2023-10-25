import admin from 'firebase-admin';

export const PATH_TO_SERVICE_ACCOUNT = './assets/gerador-de-escalas-baas-firebase-adminsdk.json';

export const app = admin.initializeApp({
  credential: admin.credential.cert(PATH_TO_SERVICE_ACCOUNT),
});