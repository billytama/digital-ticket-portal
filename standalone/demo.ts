// Synthetic portfolio data only. Never expose production tickets through demo mode.
export function demoTickets(now=Date.now()) {
 const H=3600000;
 return {serverNow:now,tickets:[
 {id:1,title:"Request worksheet untuk Client APM",description:"Contoh permintaan worksheet operasional. Seluruh data pada demo ini fiktif.",reporter:"Tim Operations",priority:"Medium",status:"Not started",created_at:now-H,changed_at:now-H,version:0,attachments:[],events:[]},
 {id:2,title:"Perbaikan dashboard monitoring",description:"Menambahkan ringkasan performa pada dashboard internal.",reporter:"Tim Platform",priority:"High",status:"In progress",created_at:now-3*H,changed_at:now-2.5*H,version:1,attachments:[],events:[{id:"demo-2",ticket_id:2,from_status:"Not started",to_status:"In progress",started_at:now-3*H,ended_at:now-2.5*H,note:"Analisis selesai, mulai pengerjaan."}]},
 {id:3,title:"Rapikan database recruiter",description:"Normalisasi dan validasi format data recruiter.",reporter:"Tim Data",priority:"Low",status:"Completed",created_at:now-24*H,changed_at:now-20*H,version:2,attachments:[],events:[{id:"demo-3a",ticket_id:3,from_status:"Not started",to_status:"In progress",started_at:now-24*H,ended_at:now-23*H,note:"Mulai validasi."},{id:"demo-3b",ticket_id:3,from_status:"In progress",to_status:"Completed",started_at:now-23*H,ended_at:now-20*H,note:"Data sudah diverifikasi."}]},
 {id:4,title:"Request akses sistem lama",description:"Permintaan dibatalkan karena akses sudah tidak diperlukan.",reporter:"Tim Support",priority:"Low",status:"CANCEL",created_at:now-12*H,changed_at:now-11*H,version:1,attachments:[],events:[{id:"demo-4",ticket_id:4,from_status:"Not started",to_status:"CANCEL",started_at:now-12*H,ended_at:now-11*H,note:"Kebutuhan dibatalkan oleh pelapor."}]}
 ]};
}
