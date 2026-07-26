import { MongoClient, Db } from "mongodb";

const DB_NAME = "invisible-color";

declare global {
  // eslint-disable-next-line no-var
  var __mongoClient: Promise<MongoClient> | undefined;
}

function getUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI env var is not set");
  return uri;
}

function connect(): Promise<MongoClient> {
  return MongoClient.connect(getUri(), {
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: 4,
  });
}

export async function getDb(): Promise<Db> {
  if (!global.__mongoClient) {
    global.__mongoClient = connect();
  }
  const client = await global.__mongoClient;
  return client.db(DB_NAME);
}
