import { requireAuth } from "@/lib/auth";
import dbConnect       from "@/lib/mongodb";
import Article         from "@/lib/models/Article";

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function parseCSV(text) {
  const lines  = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map(line => {
    const cols = [];
    let cur = "", inQ = false;
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; continue; }
      if (ch === "," && !inQ) { cols.push(cur.trim()); cur = ""; continue; }
      cur += ch;
    }
    cols.push(cur.trim());
    const obj = {};
    headers.forEach((h, i) => { obj[h] = cols[i] || ""; });
    return obj;
  }).filter(r => r.title);
}

export async function POST(request) {
  const auth = await requireAuth();
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  const formData = await request.formData();
  const file     = formData.get("file");
  if (!file) return Response.json({ error: "No file uploaded" }, { status: 400 });

  const text = await file.text();
  const rows = parseCSV(text);
  if (!rows.length) return Response.json({ error: "No valid rows found in CSV" }, { status: 400 });

  await dbConnect();

  const results = { created: 0, skipped: 0, errors: [] };

  for (const row of rows) {
    try {
      const title    = row.title?.trim();
      const content  = row.content?.trim();
      const excerpt  = row.excerpt?.trim() || title.slice(0, 150);
      const image    = row.image?.trim() || "";
      const category = ["cars","bikes","commercial","charging"].includes(row.category?.trim())
                       ? row.category.trim() : "cars";

      if (!title || !content) { results.skipped++; continue; }

      const baseSlug = slugify(row.slug?.trim() || title);
      let slug  = baseSlug, attempt = 0;
      while (await Article.exists({ slug })) {
        attempt++;
        slug = `${baseSlug}-${attempt}`;
      }

      await Article.create({
        title,
        slug,
        excerpt,
        content,
        image:    image || "https://via.placeholder.com/1200x630",
        imageAlt: row.imageAlt?.trim() || title,
        category,
        author:   row.author?.trim() || "EV Radar Team",
        tags:     row.tags ? row.tags.split("|").map(t => t.trim()).filter(Boolean) : [],
        readTime: row.readTime?.trim() || "5 min",
        featured: row.featured === "true" || row.featured === "1",
        status:   row.status === "published" ? "published" : "draft",
        metaTitle:       row.metaTitle?.trim()       || title,
        metaDescription: row.metaDescription?.trim() || excerpt,
      });
      results.created++;
    } catch (err) {
      results.errors.push({ title: row.title, error: err.message });
      results.skipped++;
    }
  }

  return Response.json({ success: true, ...results, total: rows.length });
}
