import * as tickets from "../app/api/tickets/route";
import { GET as file } from "../app/api/files/[key]/route";

type Env = { DB: D1Database; BUCKET?: R2Bucket; ASSETS: Fetcher };
const json = (data: unknown, status = 200) => Response.json(data, {
  status, headers: { "Cache-Control": "no-store" },
});

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    // Retired auth URLs must not fall back to the SPA or accept old credentials.
    if (path.startsWith("/auth/")) return json({ error: "Login telah dihapus. Portal dapat diakses tanpa akun." }, 410);
    if (!path.startsWith("/api/")) return env.ASSETS.fetch(request);

    try {
      if (!["GET", "HEAD"].includes(request.method) && request.headers.get("Origin") !== url.origin) {
        return json({ error: "Origin tidak diizinkan." }, 403);
      }
      if (path === "/api/config" && request.method === "GET") {
        return json({ uploadsEnabled: !!env.BUCKET, access: "public" });
      }
      if (path === "/api/tickets") {
        if (request.method === "GET") return tickets.GET();
        if (request.method === "POST") {
          if (Number(request.headers.get("Content-Length")) > 11 * 1024 * 1024) {
            return json({ error: "Total upload maksimal 10 MB." }, 413);
          }
          if (!env.BUCKET) {
            const data = await request.clone().formData();
            if (["attachment", "evidence"].some(key => {
              const value = data.get(key);
              return value instanceof File && value.size > 0;
            })) return json({ error: "Lampiran belum diaktifkan. Konfigurasi R2 terlebih dahulu." }, 400);
          }
          return tickets.POST(request);
        }
        if (request.method === "PATCH") return tickets.PATCH(request);
        return json({ error: "Method tidak didukung." }, 405);
      }
      const match = path.match(/^\/api\/files\/([a-f0-9-]{36})$/);
      if (match && request.method === "GET") {
        return env.BUCKET
          ? file(request, { params: Promise.resolve({ key: match[1] }) })
          : json({ error: "R2 belum diaktifkan." }, 404);
      }
      return json({ error: "Tidak ditemukan." }, 404);
    } catch (error) {
      console.error("API request failed", error instanceof Error ? error.message : "Unknown error");
      return json({ error: "Permintaan gagal. Coba lagi atau periksa konfigurasi server." }, 500);
    }
  },
};
