import clone from 'clone';
import admin from 'firebase-admin';
import { CollectionHeaderType, colletionHeaderSchema } from "../../base";

export class CollectionHeader {
  constructor(private readonly data: CollectionHeaderType) { }

  get collectionName() {
    return this.data.collectionName;    
  }

  get lastUpdate() {
    return this.data.lastUpdate;
  }

  get version() {
    return this.data.version;
  }

  getJSON(): CollectionHeaderType {
    return clone(this.data);
  }

  releaseNewVersion(): void {
    this.data.lastUpdate = Date.now();
    this.data.version++;
  }

  static parse(data: unknown): CollectionHeader {
    return new this(colletionHeaderSchema.parse(data));
  }

  static fromDoc(doc: admin.firestore.DocumentSnapshot): CollectionHeader {
    return this.parse(doc.data());
  }

  static create(collectionName: string): CollectionHeader {
    return new this({ collectionName, lastUpdate: Date.now(), version: 0 });
  }
}