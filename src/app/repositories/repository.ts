import { firestore } from 'firebase-admin';
import _firestore from 'firebase-admin/firestore';
import { CollectionHeaderType, OptionalIDRegistryEntryType, PartialDataRegistryEntryType, RegistryEntryType } from '../base';

export interface CollectionHandler {
  collection: firestore.CollectionReference;

  doc(id?: string): firestore.DocumentReference;
}

export interface TransactionExecuter {
  runTransaction<T = unknown>(
    updateFunction: (transaction: firestore.Transaction) => Promise<T>,
    transactionOptions:
      | _firestore.ReadWriteTransactionOptions
      | _firestore.ReadOnlyTransactionOptions
  ): Promise<T>
}

export interface RepositoryParser<T = unknown> {
  parseQuerySnapshot(querySnapshot: firestore.QuerySnapshot): RegistryEntryType<T>[];
  parseQueryDocSnapshot(docSnapshot: firestore.QueryDocumentSnapshot): RegistryEntryType<T>;
  parseDocSnapshot(docSnapshot: firestore.DocumentSnapshot): RegistryEntryType<T> | null;
}

export interface RepositoryWriter<T = unknown> {
  create(registry: OptionalIDRegistryEntryType<T>): Promise<RegistryEntryType<T>>;
  update(registry: PartialDataRegistryEntryType<T>): Promise<firestore.WriteResult>;
  delete(id: string): Promise<firestore.WriteResult>;
  releaseNewVersion(): Promise<CollectionHeaderType>;
}

export interface RepositoryReader<T = unknown> {
  require(id: string): Promise<RegistryEntryType<T> | null>;
  getFromDoc(docRef: firestore.DocumentReference): Promise<RegistryEntryType<T> | null>;
  getFromQuery(query: firestore.Query): Promise<RegistryEntryType<T>[]>;
  getHeader(): Promise<CollectionHeaderType>;
}

export interface Repository<T = unknown> extends RepositoryReader<T>, RepositoryWriter<T>, RepositoryParser<T>, CollectionHandler, TransactionExecuter { }