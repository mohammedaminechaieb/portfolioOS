// ─────────────────────────────────────────────────────────────────────────
//  Duplicate cleanup for the portfolio database  (run with mongosh)
//
//  1) DRY RUN (default, changes nothing):
//       mongosh "<connection string>/test" --file scripts/dedupe.js
//  2) Read the plan it prints. If it looks right, set DRY_RUN = false below
//     and run it again. Before deleting anything it copies every touched
//     collection to  bak_<collection>_<date>  so you can undo it.
//
//  What it does
//   - removes the near-duplicate projects / certificates / events that came
//     from running the old seed on top of your original data
//   - when it removes a duplicate it first copies over githubUrl / liveUrl /
//     image / longDesc / slug / category if the document it keeps has none
//   - removes exact duplicates (same title/name once case and punctuation
//     are ignored) in every collection the app uses
//   - optionally drops the empty leftover collections (Admin, Project, ...)
//   Users, settings and messages are NEVER touched.
// ─────────────────────────────────────────────────────────────────────────
const DRY_RUN = true;
const DROP_EMPTY_LEFTOVERS = false; // only drops collections that have 0 documents

const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
const FILL = ["githubUrl", "liveUrl", "image", "longDesc", "slug", "category", "description"];
const isEmpty = (v) => v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0);
const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "");

// Known near-duplicates:  keep = the document that stays, drop = the ones removed
const KNOWN = {
  projects: [
    { keep: /^GOB — Multilingual Voice Assistant$/, drop: [/^GOB — AI Multi-Agent Voice Assistant$/] },
    { keep: /^Avatar-ID — ID Card Detection App$/, drop: [/^ID Detection & Auto-Capture$/] },
    { keep: /^Verbal Aggression Detection$/, drop: [/^Verbal Aggression Detection in Smart Cities$/] },
    { keep: /^AESAT Association Website$/, drop: [/^AESAT Website$/] },
    { keep: /^Task Tracker$/, drop: [/^Task Tracker App$/] },
    { keep: /^The System — Personal Habit & Wellness Tracker$/, drop: [/^The System$/] },
  ],
  certificates: [
    { keep: /^Python Programming$/, drop: [/^Programming Hero: Python$/] },
  ],
  events: [
    { keep: /^Code & Conquer — 2nd Edition$/, drop: [/^Code & Conquer 2nd ed\.$/] },
    { keep: /^ENSI Programming Contest 4\.0 \(EPC\)$/, drop: [/^ENSI Programming Contest 4\.0$/] },
  ],
};
// Natural key used to detect exact duplicates
const KEYS = {
  projects: (d) => norm(d.title),
  skills: (d) => norm(d.name) + "|" + norm(d.category),
  certificates: (d) => norm(d.title),
  events: (d) => norm(d.title),
  clubs: (d) => norm(d.name),
  designs: (d) => norm(d.title) + "|" + norm(d.image),
  Experience: (d) => norm(d.company) + "|" + norm(d.role),
  Education: (d) => norm(d.school) + "|" + norm(d.degree),
};
const TITLE_FIELD = { skills: "name", clubs: "name", Experience: "role", Education: "degree" };
const label = (coll, d) => (d[TITLE_FIELD[coll] || "title"] || d._id) + "  (" + d._id + ")";
const richness = (d) => Object.values(d).filter((v) => !isEmpty(v)).length;

const plan = []; // { coll, drop: doc, keep: doc, fill: {} }
const planned = new Set();

for (const coll of Object.keys(KEYS)) {
  const docs = db.getCollection(coll).find().toArray();
  const titleField = TITLE_FIELD[coll] || "title";

  // 1) known near-duplicates
  for (const g of KNOWN[coll] || []) {
    const keep = docs.find((d) => g.keep.test(d[titleField] || ""));
    if (!keep) continue;
    for (const rx of g.drop) {
      for (const dup of docs.filter((d) => rx.test(d[titleField] || ""))) {
        if (String(dup._id) === String(keep._id) || planned.has(String(dup._id))) continue;
        const fill = {};
        for (const f of FILL) if (isEmpty(keep[f]) && !isEmpty(dup[f])) fill[f] = dup[f];
        plan.push({ coll, keep, drop: dup, fill, why: "known duplicate" });
        planned.add(String(dup._id));
      }
    }
  }

  // 2) exact duplicates by natural key
  const groups = {};
  docs.filter((d) => !planned.has(String(d._id))).forEach((d) => {
    const k = KEYS[coll](d);
    (groups[k] ||= []).push(d);
  });
  for (const list of Object.values(groups)) {
    if (list.length < 2) continue;
    list.sort((a, b) => richness(b) - richness(a)); // keep the richest one
    const keep = list[0];
    for (const dup of list.slice(1)) {
      const fill = {};
      for (const f of FILL) if (isEmpty(keep[f]) && !isEmpty(dup[f])) fill[f] = dup[f];
      plan.push({ coll, keep, drop: dup, fill, why: "exact duplicate" });
      planned.add(String(dup._id));
    }
  }
}

print("\n" + (DRY_RUN ? "DRY RUN — nothing will be changed" : "LIVE RUN") + "  (database: " + db.getName() + ")\n");
if (plan.length === 0) print("No duplicates found.");
plan.forEach((p) => {
  print("[" + p.coll + "] " + p.why);
  print("   KEEP   " + label(p.coll, p.keep));
  print("   DELETE " + label(p.coll, p.drop));
  if (Object.keys(p.fill).length) print("   copy to kept doc: " + Object.keys(p.fill).join(", "));
});

const leftovers = ["Admin", "Certification", "Competition", "Message", "Project", "Skill", "achievements"]
  .filter((c) => db.getCollectionNames().includes(c) && db.getCollection(c).countDocuments() === 0);
if (leftovers.length) print("\nEmpty leftover collections: " + leftovers.join(", ") + (DROP_EMPTY_LEFTOVERS ? "  → will be dropped" : "  (set DROP_EMPTY_LEFTOVERS = true to drop them)"));

print("\nSummary: " + plan.length + " document(s) to delete.");

if (!DRY_RUN) {
  const touched = [...new Set(plan.map((p) => p.coll))];
  touched.forEach((c) => {
    const name = "bak_" + c + "_" + stamp;
    db.getCollection(c).aggregate([{ $match: {} }, { $out: name }]).toArray();
    print("backup → " + name);
  });
  plan.forEach((p) => {
    if (Object.keys(p.fill).length) db.getCollection(p.coll).updateOne({ _id: p.keep._id }, { $set: p.fill });
    db.getCollection(p.coll).deleteOne({ _id: p.drop._id });
  });
  if (DROP_EMPTY_LEFTOVERS) leftovers.forEach((c) => db.getCollection(c).drop());
  print("\nDone. " + plan.length + " duplicate(s) removed.");
} else {
  print("\nIf this looks right: set DRY_RUN = false and run again.");
}
