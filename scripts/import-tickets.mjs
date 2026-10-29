// Convert a private /api/tickets JSON export to SQL for an EMPTY target DB.
// Run: node scripts/import-tickets.mjs migration-data/tickets.json > migration-data/import.sql
import {readFile} from 'node:fs/promises';
if(!process.argv[2])throw new Error('Pass a private tickets.json export path.');
const data=JSON.parse(await readFile(process.argv[2],'utf8'));
if(!Array.isArray(data.tickets))throw new Error('Expected {tickets:[...]}.');
const text=v=>"'"+String(v).replaceAll("'","''")+"'";
const integer=v=>{if(!Number.isSafeInteger(v)||v<0)throw new Error('Invalid numeric field');return String(v);};
const statuses=['Not started','In progress','Completed','CANCEL'];
let sql='PRAGMA foreign_keys=ON;\n';
// No destructive commands or conflict replacements: collisions stop import.
for(const t of [...data.tickets].sort((a,b)=>a.id-b.id)){
 if(!statuses.includes(t.status)||!['High','Medium','Low'].includes(t.priority)||!Array.isArray(t.attachments)||!Array.isArray(t.events))throw new Error('Invalid ticket');
 sql+='INSERT INTO tickets (id,title,description,reporter,priority,status,created_at,changed_at,version,attachments) VALUES ('+[integer(t.id),text(t.title),text(t.description),text(t.reporter),text(t.priority),text(t.status),integer(t.created_at),integer(t.changed_at),integer(t.version),text(JSON.stringify(t.attachments))].join(',')+');\n';
}
for(const t of data.tickets)for(const e of t.events){if(e.ticket_id!==t.id||!statuses.includes(e.from_status)||!statuses.includes(e.to_status)||e.ended_at<e.started_at)throw new Error('Invalid event');sql+='INSERT INTO events (id,ticket_id,from_status,to_status,started_at,ended_at,note) VALUES ('+[text(e.id),integer(t.id),text(e.from_status),text(e.to_status),integer(e.started_at),integer(e.ended_at),text(e.note)].join(',')+');\n';}
process.stdout.write(sql);
