import admin from 'firebase-admin';
import firestoreModule from 'firebase-admin/firestore';
import { ZodType } from "zod";
import {
  CollectionHeaderType,
  OptionalIDRegistryEntryType,
  PartialDataRegistryEntryType,
  RegistryEntryType
} from "../base";
import { CollectionHeaderController } from '../firebase';
import { Repository } from "./repository";

export interface TypedRepositoryConfig<T> {
  firestore: admin.firestore.Firestore;
  collectionName: string;
  schema: ZodType<T>;
}

export class TypedRepository<T = unknown> implements Repository<T> {
  schema: ZodType<T>;
  collection: admin.firestore.CollectionReference;
  firestore: admin.firestore.Firestore;
  headerController: CollectionHeaderController;

  constructor(config: TypedRepositoryConfig<T>) {
    const {
      collectionName,
      schema,
      firestore,
    } = config;

    this.schema = schema;
    this.firestore = firestore;
    this.collection = this.firestore.collection(collectionName);

    this.headerController = new CollectionHeaderController({
      collectionName,
      firestore,
    });
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

  getHeader(): Promise<CollectionHeaderType> {
    return this.headerController.getJSON();
  }

  async releaseNewVersion(): Promise<CollectionHeaderType> {
    const header = await this.headerController.releaseNewVersion();
  
    return header.getJSON();
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
      | firestoreModule.ReadWriteTransactionOptions
      | firestoreModule.ReadOnlyTransactionOptions
  ): Promise<TR> {
    return this.firestore.runTransaction(updateFunction, transactionOptions);
  }
}