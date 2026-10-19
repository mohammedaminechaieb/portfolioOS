import "dotenv/config";
import { MongoClient } from "mongodb";

async function inspect() {
  const url = process.env.DATABASE_URL;
  if (!url) { console.error("No DATABASE_URL"); process.exit(1); }

  const client = new MongoClient(url);
  await client.connect();
  const db = client.db();

  const collections = ["projects", "skills", "certificates", "events", "designs", "settings", "clubs", "users"];

  for (const name of collections) {
    const coll = db.collection(name);
    const doc = await coll.findOne();
    console.log(`\n═══ ${name} (sample) ═══`);
    console.log(JSON.stringify(doc, null, 2));
  }

  await client.close();
}

inspect().catch(console.error);