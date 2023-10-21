import admin from 'firebase-admin';
import _firestore from 'firebase-admin/firestore';
import { ZodType } from "zod";
import {
  CollectionHeaderType,
  OptionalIDRegistryEntryType,
  PartialDataRegistryEntryType,
  RegistryEntryType
} from "../base";
import { UpdateInfoHandler } from '../firebase';
import { firestore } from "../firebase/firestore";
import { Config } from "../utils/config";
import { Repository } from "./repository";

export type TypedRepositoryConfig<T> = Config<{
  firestore: admin.firestore.Firestore;
  collection: admin.firestore.CollectionReference;
  schema: ZodType<T>;
},
  | 'collection'
  | 'schema'
>;

export class TypedRepository<T = unknown> implements Repository<T> {
  config: Config.From<TypedRepositoryConfig<T>>;

  constructor(config: Config.Partial<TypedRepositoryConfig<T>>) {
    this.config = Config.from<TypedRepositoryConfig<T>>(config, { firestore });
  }

  get schema() {
    return this.config.schema;
  }

  get collection() {
    return this.config.collection;
  }

  parseQuerySnapshot(querySnapshot: admin.firestore.QuerySnapshot): RegistryEntryType<T>[] {
    return querySnapshot
      .docs
      .filter(doc => !doc.id.startsWith('@'))
      .map(this.parseQueryDocSnapshot, this);
  }

  parseQueryDocSnapshot(docSnapshot: admin.firestore.QueryDocumentSnapshot): RegistryEntryType<T> {
    const data = docSnapshot.data();

    return {
      id: docSnapshot.id,
      data: this.schema.parse(data),
    };
  }

  parseDocSnapshot(docSnapshot: admin.firestore.DocumentSnapshot): RegistryEntryType<T> | null {
    const data = docSnapshot.data();
    if (!data) return null;

    return {
      id: docSnapshot.id,
      data: this.schema.parse(data),
    };
  }

  doc(id?: string): admin.firestore.DocumentReference {
    return id !== undefined ? this.collection.doc(id) : this.collection.doc();
  }

  async require(id: string): Promise<RegistryEntryType<T> | null> {
    const docRef = this.collection.doc(id);

    return this.getFromDoc(docRef);
  }

  private collectionHeaderFromUpdateInfo(info: UpdateInfoHandler): CollectionHeaderType {
    return {
      collectionName: this.collection.id,
      ...info.getJson(),
    };
  }

  async getHeader(): Promise<CollectionHeaderType> {
    const info = await UpdateInfoHandler.fromCollectionRef(this.collection);

    return this.collectionHeaderFromUpdateInfo(info);
  }

  async releaseNewVersion(): Promise<CollectionHeaderType> {
    const info = await UpdateInfoHandler.releaseNewVersionTo(this.collection);

    return this.collectionHeaderFromUpdateInfo(info);
  }

  async getFromDoc(docRef: admin.firestore.DocumentReference): Promise<RegistryEntryType<T> | null> {
    const doc = await docRef.get();

    return this.parseDocSnapshot(doc);
  }

  async getFromQuery(query: admin.firestore.Query): Promise<RegistryEntryType<T>[]> {
    const querySnapshot = await query.get()

    return this.parseQuerySnapshot(querySnapshot);
  }

  async update(registry: PartialDataRegistryEntryType<T>): Promise<admin.firestore.WriteResult> {
    const docRef = this.doc(registry.id);

    const [result] = await Promise.all([
      docRef.update(registry.data),
      this.releaseNewVersion(),
    ]);

    return result;
  }

  async create(registry: OptionalIDRegistryEntryType<T>): Promise<RegistryEntryType<T>> {
    const docRef = this.doc(registry.id);

    await Promise.all([
      docRef.create(registry.data ?? {}),
      this.releaseNewVersion(),
    ]);

    return {
      id: docRef.id,
      data: registry.data,
    };
  }

  async delete(id: string): Promise<admin.firestore.WriteResult> {
    const docRef = this.doc(id);

    const [result] = await Promise.all([
      docRef.delete(),
      this.releaseNewVersion(),
    ]);

    return result;
  }

  runTransaction<TR = unknown>(
    updateFunction: (transaction: admin.firestore.Transaction) => Promise<TR>,
    transactionOptions:
      | _firestore.ReadWriteTransactionOptions
      | _firestore.ReadOnlyTransactionOptions
  ): Promise<TR> {
    return this.config.firestore.runTransaction(updateFunction, transactionOptions);
  }
}