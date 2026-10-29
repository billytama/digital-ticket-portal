CREATE TABLE login_attempts (
  ip_hash TEXT PRIMARY KEY NOT NULL,
  window INTEGER NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX events_ticket_id_idx ON events(ticket_id);
