CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`ticket_id` integer NOT NULL,
	`from_status` text NOT NULL,
	`to_status` text NOT NULL,
	`started_at` integer NOT NULL,
	`ended_at` integer NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`ticket_id`) REFERENCES `tickets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tickets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`reporter` text NOT NULL,
	`priority` text NOT NULL,
	`status` text NOT NULL,
	`created_at` integer NOT NULL,
	`changed_at` integer NOT NULL,
	`version` integer DEFAULT 0 NOT NULL,
	`attachments` text DEFAULT '[]' NOT NULL
);
