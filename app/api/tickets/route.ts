import { env } from "cloudflare:workers";
import { statuses } from "../../sla";
const json = (value: unknown, status = 200) => Response.json(value, { status, headers: { "Cache-Control": "no-store" } });
export async function GET() {
  const [tickets, events] = await env.DB!.batch([env.DB!.prepare("SELECT * FROM tickets ORDER BY id DESC"), env.DB!.prepare("SELECT * FROM events ORDER BY ended_at ASC")]);
  return json({ tickets: tickets.results.map((t: any) => ({ ...t, attachments: JSON.parse(t.attachments), events: events.results.filter((e: any) => e.ticket_id === t.id) })), serverNow: Date.now() });
}
export async function POST(request: Request) {
  const form = await request.formData();
  const title = String(form.get("title") || "").trim(), description = String(form.get("description") || "").trim(), reporter = String(form.get("reporter") || "").trim(), priority = String(form.get("priority") || "Medium");
  if (!title || !description || !reporter || title.length > 180 || description.length > 10000 || reporter.length > 100 || !["High","Medium","Low"].includes(priority)) return json({ error: "Periksa judul, deskripsi, reporter, dan prioritas." }, 400);
  const files = ["attachment", "evidence"].map(kind => ({ kind, file: form.get(kind) })).filter((x): x is { kind: string; file: File } => x.file instanceof File && x.file.size > 0);
  if (files.some(x => x.file.size > 5 * 1024 * 1024)) return json({ error: "Ukuran maksimal setiap file adalah 5 MB." }, 400);
  if (files.some(x => x.kind === "evidence" && !["image/png","image/jpeg","image/webp"].includes(x.file.type))) return json({ error: "Foto evidence harus PNG, JPG, atau WebP." }, 400);
  const attachments: any[] = [];
  try {
    for (const { kind, file } of files) {
      const key = crypto.randomUUID();
      await env.BUCKET!.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: "application/octet-stream" } });
      attachments.push({ key, kind, name: file.name.slice(0,200), size: file.size });
    }
    const now = Date.now();
    const row = await env.DB!.prepare("INSERT INTO tickets (title,description,reporter,priority,status,created_at,changed_at,version,attachments) VALUES (?,?,?,?,?,?,?,0,?) RETURNING id").bind(title,description,reporter,priority,statuses[0],now,now,JSON.stringify(attachments)).first();
    return json(row, 201);
  } catch (error) {
    await Promise.all(attachments.map(a => env.BUCKET!.delete(a.key)));
    throw error;
  }
}
export async function PATCH(request: Request) {
  const { id, status, version, note = "" } = await request.json() as any;
  if (!Number.isInteger(id) || !Number.isInteger(version) || version < 0 || !statuses.includes(status) || typeof note !== "string" || note.length > 1000) return json({ error: "Perubahan status tidak valid." }, 400);
  const t: any = await env.DB!.prepare("SELECT * FROM tickets WHERE id=?").bind(id).first();
  if (!t) return json({ error: "Tiket tidak ditemukan." }, 404);
  if (t.version !== version) return json({ error: "Tiket diperbarui di sesi lain. Data sudah dimuat ulang, silakan coba lagi." }, 409);
  if (t.status === status) return json({ ok: true });
  const now = Math.max(Date.now(), t.changed_at + 1);
  const results = await env.DB!.batch([
    env.DB!.prepare("INSERT INTO events (id,ticket_id,from_status,to_status,started_at,ended_at,note) SELECT ?,id,status,?,changed_at,?,? FROM tickets WHERE id=? AND version=?").bind(crypto.randomUUID(),status,now,note.trim(),id,version),
    env.DB!.prepare("UPDATE tickets SET status=?,changed_at=?,version=version+1 WHERE id=? AND version=?").bind(status,now,id,version),
  ]);
  return results[1].meta.changes ? json({ ok: true }) : json({ error: "Perubahan bersamaan terdeteksi. Silakan coba lagi." },409);
}
