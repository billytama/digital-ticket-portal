import * as tickets from "../app/api/tickets/route";
import { GET as file } from "../app/api/files/[key]/route";
import { cookie, sessionCookie, signSession, verifySession, checkPassword } from "./auth";
import { demoTickets } from "./demo";
type Env = { DB:D1Database; BUCKET?:R2Bucket; ASSETS:Fetcher; ADMIN_PASSWORD?:string; SESSION_SECRET?:string; PUBLIC_DEMO?:string };
const json=(data:unknown,status=200,headers:Record<string,string>={})=>Response.json(data,{status,headers:{"Cache-Control":"no-store",...headers}});
export default {async fetch(request:Request,env:Env):Promise<Response>{
 const url=new URL(request.url),path=url.pathname;
 if(!path.startsWith("/api/")&&!path.startsWith("/auth/")) return env.ASSETS.fetch(request);
 try {
 const configured=!!env.ADMIN_PASSWORD&&env.ADMIN_PASSWORD.length>=16&&!!env.SESSION_SECRET&&env.SESSION_SECRET.length>=32;
 const authenticated=configured&&await verifySession(cookie(request),env.SESSION_SECRET!);
 if(!["GET","HEAD"].includes(request.method)&&request.headers.get("Origin")!==url.origin) return json({error:"Origin tidak diizinkan."},403);
 if(path==="/auth/session"&&request.method==="GET")return json({authenticated,configured,publicDemo:env.PUBLIC_DEMO==="true",uploadsEnabled:!!env.BUCKET});
 if(path==="/auth/logout"&&request.method==="POST")return json({ok:true},200,{"Set-Cookie":sessionCookie("",url.protocol==="https:")});
 if(path==="/auth/login"&&request.method==="POST") {
  if(!configured) return json({error:"Admin belum dikonfigurasi. Isi ADMIN_PASSWORD dan SESSION_SECRET di Cloudflare."},503);
  if(Number(request.headers.get("Content-Length"))>4096)return json({error:"Request terlalu besar."},413);
  const data=await request.json() as {password?:unknown};
  if(typeof data.password!=="string"||data.password.length>256)return json({error:"Password tidak valid."},400);
  const ip=request.headers.get("CF-Connecting-IP")||"local";
  const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(ip));
  const id=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,"0")).join("");
  const window=Math.floor(Date.now()/900000);
  const row=await env.DB.prepare("INSERT INTO login_attempts (ip_hash,window,attempts) VALUES (?,?,1) ON CONFLICT(ip_hash) DO UPDATE SET window=excluded.window, attempts=CASE WHEN login_attempts.window=excluded.window THEN login_attempts.attempts+1 ELSE 1 END RETURNING attempts").bind(id,window).first<{attempts:number}>();
  if(row!.attempts>10)return json({error:"Terlalu banyak percobaan. Coba lagi dalam 15 menit."},429,{"Retry-After":"900"});
  if(!await checkPassword(data.password,env.ADMIN_PASSWORD!))return json({error:"Password salah."},401);
  return json({ok:true},200,{"Set-Cookie":sessionCookie(await signSession(env.SESSION_SECRET!),url.protocol==="https:")});
 }
 if(!authenticated){
  if(path==="/api/tickets"&&request.method==="GET"&&env.PUBLIC_DEMO==="true")return json(demoTickets());
  return json({error:"Login admin diperlukan untuk mengakses data dan mengubah tiket."},401);
 }
 if(path==="/api/tickets") {
  if(request.method==="GET")return tickets.GET();
  if(request.method==="POST") {
   const max=11*1024*1024;
   if(Number(request.headers.get("Content-Length"))>max)return json({error:"Total upload maksimal 10 MB."},413);
   if(!env.BUCKET){const data=await request.clone().formData();if(["attachment","evidence"].some(k=>{const f=data.get(k);return f instanceof File&&f.size>0;}))return json({error:"Lampiran belum diaktifkan. Konfigurasi R2 terlebih dahulu."},400);}
   return tickets.POST(request);
  }
  if(request.method==="PATCH")return tickets.PATCH(request);
  return json({error:"Method tidak didukung."},405);
 }
 const match=path.match(/^\/api\/files\/([a-f0-9-]{36})$/);
 if(match&&request.method==="GET")return env.BUCKET?file(request,{params:Promise.resolve({key:match[1]})}):json({error:"R2 belum diaktifkan."},404);
 return json({error:"Tidak ditemukan."},404);
 }catch(error){console.error("API request failed",error instanceof Error?error.message:"Unknown error");return json({error:"Permintaan gagal. Coba lagi atau periksa konfigurasi server."},500);}
}};
