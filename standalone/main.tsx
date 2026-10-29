import React,{useEffect,useState} from "react";
import {createRoot} from "react-dom/client";
import Home from "../app/page";
import {RuntimeContext} from "../app/runtime";
import "../app/globals.css";
import "./style.css";
type Session={authenticated:boolean;configured:boolean;publicDemo:boolean;uploadsEnabled:boolean};
function App(){
 const [session,setSession]=useState<Session|null>(null),[error,setError]=useState(""),[password,setPassword]=useState(""),[login,setLogin]=useState(false),[busy,setBusy]=useState(false);
 async function refresh(){const r=await fetch('/auth/session');if(!r.ok)throw new Error('Server tidak dapat dihubungi.');setSession(await r.json() as Session);}
 useEffect(()=>{refresh().catch(e=>setError(e.message));},[]);
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setError('');try{const r=await fetch('/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})});const data=await r.json() as {error?:string};if(!r.ok)throw new Error(data.error);setPassword('');await refresh();setLogin(false);}catch(e:any){setError(e.message);}finally{setBusy(false);}}
 const canView=session&&(session.authenticated||session.publicDemo);
 return <>{canView&&<><div className="account-bar"><span>{session.authenticated?'Admin workspace':'PORTFOLIO DEMO · Data fiktif · Hanya-baca'}</span><button onClick={async()=>{if(!session.authenticated){setLogin(true);return;}setBusy(true);try{const r=await fetch('/auth/logout',{method:'POST'});if(!r.ok)throw new Error('Logout gagal.');await refresh();}catch(e:any){setError(e.message);}finally{setBusy(false);}}} disabled={busy}>{session.authenticated?'Logout':'Login admin'}</button></div><RuntimeContext.Provider value={{readOnly:!session.authenticated,uploadsEnabled:session.uploadsEnabled}}><Home key={String(session.authenticated)}/></RuntimeContext.Provider></>}{(!canView||login)&&<div className="login-screen"><form className="login-card" onSubmit={submit}><span className="eyebrow">DIGITAL PLATFORM TICKET PORTAL</span><h1>{!session?'Memuat portal...':'Login admin'}</h1><p>Akses pengelolaan tiket dengan password admin. Demo portofolio menggunakan data contoh dan tidak membuka tiket asli.</p>{error&&<div className="error" role="alert">{error}</div>}{session&&!session.configured&&<div className="info-box">Admin belum diaktifkan. Atur secret ADMIN_PASSWORD (minimal 16 karakter) dan SESSION_SECRET (minimal 32 karakter) pada Worker.</div>}{session?.configured&&<><label className="field">Password admin<input type="password" autoComplete="current-password" value={password} maxLength={256} required onChange={e=>setPassword(e.target.value)}/></label><button className="primary" disabled={busy}>{busy?'Memeriksa...':'Masuk'}</button></>}{session?.publicDemo&&<button className="text-button" type="button" onClick={()=>{setLogin(false);setError('');}}>Kembali ke demo</button>}</form></div>}</>;
}
createRoot(document.getElementById('root')!).render(<App/>);
