export const statuses = ["Not started", "In progress", "Completed", "CANCEL"] as const;
export type Status = typeof statuses[number];
export type Priority = "High" | "Medium" | "Low";
export type History = { id: string; ticket_id: number; from_status: Status; to_status: Status; started_at: number; ended_at: number; note: string };
export type Attachment = { key: string; name: string; kind: string; size: number };
export type Ticket = { id: number; title: string; description: string; reporter: string; priority: Priority; status: Status; created_at: number; changed_at: number; version: number; attachments: Attachment[]; events: History[] };
export const targets: Record<Priority, Record<string, number>> = { High: { "Not started": 1, "In progress": 4 }, Medium: { "Not started": 4, "In progress": 24 }, Low: { "Not started": 8, "In progress": 48 } };
export const tid = (id: number) => `TID-${String(id).padStart(4, "0")}`;
export function durations(ticket: Ticket, now: number) {
  const result: Record<Status, number> = { "Not started": 0, "In progress": 0, Completed: 0, CANCEL: 0 };
  for (const e of ticket.events) result[e.from_status] += Math.max(0, e.ended_at - e.started_at);
  result[ticket.status] += Math.max(0, now - ticket.changed_at);
  return result;
}
export const isClosed = (status: string) => status === "Completed" || status === "CANCEL";
export function sla(ticket: Ticket, now: number) {
  const times = durations(ticket, now);
  const breached = (["Not started", "In progress"] as Status[]).some(s => times[s] > targets[ticket.priority][s] * 3600000);
  const elapsed = isClosed(ticket.status) ? times["Not started"] + times["In progress"] : times[ticket.status];
  const limit = (targets[ticket.priority][ticket.status] || 0) * 3600000;
  return { times, breached, elapsed, limit, percent: limit ? Math.min(100, elapsed / limit * 100) : 100 };
}
export function duration(ms: number) {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(seconds / 3600), m = Math.floor(seconds % 3600 / 60), s = seconds % 60;
  return `${h.toString().padStart(2,"0")}:${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;
}
