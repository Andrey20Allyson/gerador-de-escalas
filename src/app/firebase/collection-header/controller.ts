import admin from 'firebase-admin';
import { CollectionHeader } from './header';

export const DEFAULT_COLLECTION_HEADER_DOC_NAME = '@updates';

export interface CollectionHeaderControllerConfig {
  firestore: admin.firestore.Firestore
  collectionName: string;
  headerDocName?: string;
}

export class CollectionHeaderController {
  readonly firestore: admin.firestore.Firestore;
  readonly collection: admin.firestore.CollectionReference;
  readonly header: admin.firestore.DocumentReference;

  constructor(config: CollectionHeaderControllerConfig) {
    const {
      firestore,
      collectionName,
      headerDocName = DEFAULT_COLLECTION_HEADER_DOC_NAME,
    } = config;

    this.firestore = firestore;
    this.collection = this.firestore.collection(collectionName);
    this.header = this.collection.doc(headerDocName);
  }

  getCollectionName() {
    return this.collection.id;
  }

  async getJSON() {
    const header = await this.get();

    return header.getJSON();
  }

  async get() {
    return await this.firestore.runTransaction(async transaction => {
      const doc = await transaction.get(this.header);
      if (!doc.exists) return this.create(transaction);

      return CollectionHeader.fromDoc(doc);
    });
  }

  async releaseNewVersion() {
    return this.firestore.runTransaction(async transaction => {
      const doc = await transaction.get(this.header);
      if (!doc.exists) return this.create(transaction);

      const updateInfo = CollectionHeader.fromDoc(doc);
      updateInfo.releaseNewVersion();

      transaction.update(this.header, updateInfo.getJSON());

      return updateInfo;
    });
  }

  private create(transaction: admin.firestore.Transaction) {
    const updateInfo = CollectionHeader.create(this.getCollectionName());

    transaction.create(this.header, updateInfo.getJSON());

    return updateInfo;
  }
}