CREATE TABLE `form_mappings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`form_schema` json NOT NULL,
	`ui_schema` json,
	`workflow_id` varchar(255) NOT NULL,
	`description` varchar(500),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `form_mappings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sla_timer_definitions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`data` json NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `sla_timer_definitions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workflow_definitions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`data` json NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `workflow_definitions_id` PRIMARY KEY(`id`)
);
