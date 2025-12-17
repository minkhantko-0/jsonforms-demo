CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` varchar(500) NOT NULL,
	`is_read` boolean NOT NULL DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`data` json NOT NULL,
	`form_schema` json NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `submissions_id` PRIMARY KEY(`id`)
);
