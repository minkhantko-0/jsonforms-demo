CREATE TABLE IF NOT EXISTS `sla_timer_definitions` (
  `id` int AUTO_INCREMENT NOT NULL,
  `data` json NOT NULL,
  `created_at` timestamp DEFAULT (now()),
  CONSTRAINT `sla_timer_definitions_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `workflow_definitions` (
  `id` int AUTO_INCREMENT NOT NULL,
  `name` varchar(255) NOT NULL,
  `data` json NOT NULL,
  `created_at` timestamp DEFAULT (now()),
  `updated_at` timestamp DEFAULT (now()),
  CONSTRAINT `workflow_definitions_id` PRIMARY KEY(`id`)
);
