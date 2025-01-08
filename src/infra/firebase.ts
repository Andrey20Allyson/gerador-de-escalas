import admin from "firebase-admin";
import pfs from "node:fs/promises";
import path from "node:path";
import CryptorWithPassword from "src/utils/cryptor-with-password";

export const DEFAULT_FIREBASE_KEY_PATH = path.resolve(
  "./keys/firebase-key.aes",
);
export const DEFAULT_APP_NAME = "main-app";

export interface FirestoreInitializerConfig {
  password: string;
  appName?: string;
  firebaseKeyPath?: string;
}

export class FirestoreInitializer {
  readonly cryptor: CryptorWithPassword;
  readonly appName: string;
  readonly firebaseKeyPath: string;

  constructor(config: FirestoreInitializerConfig) {
    const {
      password,
      appName = DEFAULT_APP_NAME,
      firebaseKeyPath = DEFAULT_FIREBASE_KEY_PATH,
    } = config;

    this.cryptor = new CryptorWithPassword({ password });
    this.appName = appName;
    this.firebaseKeyPath = firebaseKeyPath;
  }

  async getCredentials(): Promise<admin.credential.Credential> {
    const inputBuffer = await pfs.readFile(this.firebaseKeyPath);
    const decryptedBuffer = await this.cryptor.decrypt(inputBuffer);

    const credentialJSON = JSON.parse(decryptedBuffer.toString("utf-8"));

    return admin.credential.cert(credentialJSON);
  }

  async initializeApp() {
    const app = admin.initializeApp(
      {
        credential: await this.getCredentials(),
      },
      this.appName,
    );

    return app;
  }

  /**@throws If `password` is incorrect or if service account is invalid*/
  async getApp(): Promise<admin.app.App> {
    try {
      return admin.app(this.appName);
    } catch {
      return this.initializeApp();
    }
  }

  /**@throws If `password` is incorrect or if service account is invalid*/
  async getFirestore(): Promise<admin.firestore.Firestore> {
    const app = await this.getApp();
    const firestore = app.firestore();

    return firestore;
  }
}
