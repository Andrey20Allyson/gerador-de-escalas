import admin from "firebase-admin";
import type {
  CollectionReference,
  DocumentReference,
  Firestore,
  Transaction,
} from "firebase-admin/firestore";

const app = admin.initializeApp({ projectId: "demo-project" }, "demo-project");

const db = app.firestore();

db.settings({
  host: "localhost:8080",
  ssl: false,
});

const app2 = admin.initializeApp(
  { projectId: "test-project-2" },
  "test-project-2",
);

const db2 = app2.firestore();

db2.settings({
  host: "localhost:8081",
  ssl: false,
});

async function main() {
  await db.terminate();

  console.log("start");

  await dropAllDocuments(db, { verbose: true });

  await logCollections();

  const doc = db.collection("ab").doc("bc");

  listenSnapshots(doc);

  await doc.create({ hello: "world", name: "k" });

  await doc.update({ hello: "mundo" });

  await doc.collection("e").doc("f").create({});

  await logCollections();
}

function listenSnapshots(doc: DocumentReference) {
  let unsub: Function | null = null;
  const createUnsubTimeout = () => setTimeout(() => unsub?.(), 1000);
  let timeout = createUnsubTimeout();

  unsub = doc.onSnapshot((s) => {
    console.log("snapshot event");
    if (s.exists) {
      console.log(s.updateTime);
      console.log(s.data());
    } else {
      console.log("shapshot don't exists");
    }
    console.log("snapshot event end");

    clearTimeout(timeout);
    timeout = createUnsubTimeout();
  });
}

async function logCollections() {
  const collections = await db.listCollections();

  console.log("retrived collections");
  console.log(collections.map((c) => c.id));
}

interface DropOptions {
  verbose?: boolean;
}

async function dropAllDocuments(db: Firestore, options: DropOptions = {}) {
  const { verbose = false } = options;

  return db.runTransaction(async (t) => {
    const collections = await db.listCollections();

    await Promise.all(
      collections.map(async (collection) => {
        await dropAllDocumentsOfCollection(t, collection);
      }),
    );
  });

  async function dropAllDocumentsOfCollection(
    t: Transaction,
    collection: CollectionReference,
  ) {
    const docs = await collection.listDocuments();

    await Promise.all(
      docs.map(async (doc) => {
        await dropAllCollectionsOfDocument(t, doc);

        if (verbose) {
          console.log(`document '${doc.id}' has deleted`);
        }

        t.delete(doc);
      }),
    );
  }

  async function dropAllCollectionsOfDocument(
    t: Transaction,
    document: DocumentReference,
  ) {
    const collections = await document.listCollections();

    await Promise.all(
      collections.map(async (collection) => {
        await dropAllDocumentsOfCollection(t, collection);
      }),
    );
  }
}

console.log("initialization");
main();
