import { firestore } from ".";
import admin from 'firebase-admin';
import zod from "zod";
import clone from 'clone';

export const updateInfoSchema = zod.object({
  lastUpdate: zod.number(),
  version: zod.number(),
});

export type UpdateInfoType = zod.infer<typeof updateInfoSchema>;

export class UpdateInfoHandler {
  static readonly UPDATE_INFO_DOC_NAME = '@updates';

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

  static fromDoc(doc: admin.firestore.DocumentSnapshot): UpdateInfoHandler {
    return this.parse(doc.data());
  }

  static async fromCollectionRef(collection: admin.firestore.CollectionReference) {
    const docRef = collection.doc(this.UPDATE_INFO_DOC_NAME);

    return await firestore.runTransaction(async transaction => {
      const doc = await transaction.get(docRef);
      if (!doc.exists) return this.createUpdateInfoDoc(transaction, docRef);

      return this.fromDoc(doc);
    });
  }

  static async releaseNewVersionTo(collection: admin.firestore.CollectionReference) {
    const docRef = collection.doc(this.UPDATE_INFO_DOC_NAME);

    return firestore.runTransaction(async transaction => {
      const doc = await transaction.get(docRef);
      if (!doc.exists) return this.createUpdateInfoDoc(transaction, docRef);

      const updateInfo = this.fromDoc(doc);
      updateInfo.releaseNewVersion();

      transaction.update(docRef, updateInfo.getJson());

      return updateInfo;
    });
  }

  private static createUpdateInfoDoc(transaction: admin.firestore.Transaction, docRef: admin.firestore.DocumentReference) {
    const updateInfo = this.create();

    transaction.create(docRef, updateInfo.getJson());

    return updateInfo;
  }

  static create(): UpdateInfoHandler {
    return new this({ lastUpdate: Date.now(), version: 0 });
  }
}