/** "2024-10-01T00:00:00.000Z" -> "Oct 2024". Returns "" for empty / invalid values. */
export function formatDate(v?: string | null): string {
  if (!v) return "";
  const d = new Date(v);
  if (isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
}

export function capitalize(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

const CATEGORY_LABELS: Record<string, string> = {
  language: "Languages",
  frontend: "Frontend",
  backend: "Backend",
  database: "Databases",
  devops: "DevOps",
  ai: "AI / ML",
  embedded: "Embedded / IoT",
  tools: "Tools",
  design: "Design",
};
export function categoryLabel(cat: string): string {
  return CATEGORY_LABELS[cat] || capitalize(cat);
}

/** "2026-06" -> "Jun 2026"; anything else (e.g. "2024") is returned unchanged. */
export function formatYM(v?: string | null): string {
  if (!v) return "";
  const m = /^(\d{4})-(\d{2})$/.exec(v);
  if (!m) return v;
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${names[Number(m[2]) - 1] || m[2]} ${m[1]}`;
}
