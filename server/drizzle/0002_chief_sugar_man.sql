CREATE TABLE `form_workflow_mappings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`form_key` varchar(255) NOT NULL,
	`workflow_key` varchar(255) NOT NULL,
	`status` varchar(32) NOT NULL DEFAULT 'active',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `form_workflow_mappings_id` PRIMARY KEY(`id`),
	CONSTRAINT `form_workflow_unique` UNIQUE(`form_key`,`workflow_key`)
);
--> statement-breakpoint
CREATE TABLE `forms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`key` varchar(255) NOT NULL,
	`schema` json NOT NULL,
	`ui_schema` json,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `forms_id` PRIMARY KEY(`id`),
	CONSTRAINT `forms_key_unique` UNIQUE(`key`)
);
