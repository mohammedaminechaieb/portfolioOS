// mongosh --file scripts/dump.js "<connection string>" > dump.txt
// Prints every collection with all documents. Secrets are redacted.
const SECRET = /pass|hash|secret|token|key/i;
function redact(v) {
  if (Array.isArray(v)) return v.map(redact);
  if (v && typeof v === "object" && !(v instanceof ObjectId) && !(v instanceof Date)) {
    const o = {};
    for (const [k, val] of Object.entries(v)) o[k] = SECRET.test(k) ? "[REDACTED]" : redact(val);
    return o;
  }
  return v;
}
print("DATABASE: " + db.getName());
db.getCollectionNames().sort().forEach((name) => {
  const docs = db.getCollection(name).find().toArray();
  print("\n===== " + name + " (" + docs.length + " documents) =====");
  docs.forEach((d) => print(JSON.stringify(redact(d))));
});
