import admin from 'firebase-admin';
import zod from 'zod';
import clone from 'clone';

export const PATH_TO_SERVICE_ACCOUNT = './assets/gerador-de-escalas-baas-firebase-adminsdk.json';

export const app = admin.initializeApp({
  credential: admin.credential.cert(PATH_TO_SERVICE_ACCOUNT),
});

export const firestore = app.firestore();

export namespace Collection {
  export const workerRegistries = firestore.collection('worker-registries');
  export const holidays = firestore.collection('holidays');
}

export namespace Updates {
  export const updateTimeDocName = '@updates';

  export const updateInfoSchema = zod.object({
    lastUpdate: zod.number(),
    version: zod.number(),
  });

  export type UpdateInfoType = zod.infer<typeof updateInfoSchema>;

  export class UpdateInfoHandler {
    constructor(private readonly data: UpdateInfoType) { }

    get lastUpdate() {
      return this.data.lastUpdate;
    }

    get version() {
      return this.data.version;
    }

    getJson(): UpdateInfoType {
      return clone(this.data);
    }

    releaseNewVersion(): void {
      this.data.lastUpdate = Date.now();
      this.data.version++;
    }

    static parse(data: unknown): UpdateInfoHandler {
      return new this(updateInfoSchema.parse(data));
    }

    static from(doc: admin.firestore.DocumentSnapshot): UpdateInfoHandler {
      return this.parse(doc.data());
    }

    static create(): UpdateInfoHandler {
      return new this({ lastUpdate: Date.now(), version: 0 });
    }
  }

  function createUpdateInfoDoc(transaction: admin.firestore.Transaction, docRef: admin.firestore.DocumentReference) {
    const updateInfo = UpdateInfoHandler.create();

    transaction.create(docRef, updateInfo.getJson());

    return updateInfo;
  }

  export async function getLastUpdateFrom(collection: admin.firestore.CollectionReference): Promise<UpdateInfoHandler> {
    const docRef = collection.doc(updateTimeDocName);

    return await firestore.runTransaction(async transaction => {
      const doc = await transaction.get(docRef);
      if (!doc.exists) return createUpdateInfoDoc(transaction, docRef);

      return UpdateInfoHandler.from(doc);
    });
  }

  export async function updateCollection(collection: admin.firestore.CollectionReference): Promise<UpdateInfoHandler> {
    const docRef = collection.doc(updateTimeDocName);

    return firestore.runTransaction(async transaction => {
      const doc = await transaction.get(docRef);

      if (!doc.exists) return createUpdateInfoDoc(transaction, docRef);

      const updateInfo = UpdateInfoHandler.from(doc);
      updateInfo.releaseNewVersion();

      transaction.update(docRef, updateInfo.getJson());

      return updateInfo;
    });
  }
}