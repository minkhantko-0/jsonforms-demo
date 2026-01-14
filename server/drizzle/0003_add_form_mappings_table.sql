CREATE TABLE IF NOT EXISTS `form_mappings` (
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
