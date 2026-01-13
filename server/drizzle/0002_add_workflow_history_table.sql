CREATE TABLE IF NOT EXISTS `workflow_history` (
  `id` int AUTO_INCREMENT NOT NULL,
  `submission_id` int NOT NULL,
  `workflow_definition_id` int,
  `workflow_name` varchar(255) NOT NULL,
  `current_stage` varchar(255) NOT NULL,
  `status` varchar(50) NOT NULL,
  `stages` json NOT NULL,
  `created_at` timestamp DEFAULT (now()),
  `updated_at` timestamp DEFAULT (now()),
  CONSTRAINT `workflow_history_id` PRIMARY KEY(`id`)
);
