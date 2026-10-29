const encoder = new TextEncoder();
const COOKIE = "ticket_session";
async function key(secret: string) { return crypto.subtle.importKey("raw",encoder.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign","verify"]); }
const hex=(bytes:ArrayBuffer)=>Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,"0")).join("");
export async function signSession(secret:string, now=Date.now()) {
  const payload=String(now+8*3600000);
  return payload+"."+hex(await crypto.subtle.sign("HMAC",await key(secret),encoder.encode(payload)));
}
export async function verifySession(value:string,secret:string,now=Date.now()) {
  const [payload,signature,...rest]=value.split(".");
  if(rest.length || !/^\d+$/.test(payload) || !/^[a-f0-9]{64}$/.test(signature || "") || Number(payload)<=now || Number(payload)>now+8*3600000) return false;
  return crypto.subtle.verify("HMAC",await key(secret),Uint8Array.from(signature.match(/../g)!,b=>parseInt(b,16)),encoder.encode(payload));
}
export async function checkPassword(input:string,expected:string) {
  const digest=await crypto.subtle.digest("SHA-256",encoder.encode(expected));
  // WebCrypto verification compares fixed-length MACs without string equality timing.
  const k=await key(hex(digest));
  const signature=await crypto.subtle.sign("HMAC",k,encoder.encode(expected));
  return crypto.subtle.verify("HMAC",k,signature,encoder.encode(input));
}
export function cookie(request:Request) { return (request.headers.get("Cookie")||"").split(";").map(x=>x.trim()).find(x=>x.startsWith(COOKIE+"="))?.slice(COOKIE.length+1)||""; }
export function sessionCookie(value:string,secure:boolean) { return `${COOKIE}=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${value?28800:0}${secure?"; Secure":""}`; }
