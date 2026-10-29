import { env } from "cloudflare:workers";
export async function GET(request: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!/^[0-9a-f-]{36}$/.test(key)) return new Response("Tidak ditemukan", { status: 404 });
  const file = await env.BUCKET!.get(key);
  if (!file) return new Response("Tidak ditemukan", { status: 404 });
  return new Response(file.body, { headers: { "Content-Type": "application/octet-stream", "Content-Disposition": `attachment; filename="file-${key}"`, "X-Content-Type-Options": "nosniff", "Cache-Control": "private, no-store" } });
}
