CREATE TABLE `analytics_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_type` text NOT NULL,
	`user_id` text NOT NULL,
	`metadata` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `api_keys` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key_name` text NOT NULL,
	`encrypted_value` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`created_by` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `api_keys_key_name_unique` ON `api_keys` (`key_name`);--> statement-breakpoint
CREATE TABLE `badges` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`badge_name` text NOT NULL,
	`badge_description` text NOT NULL,
	`badge_icon` text NOT NULL,
	`requirement_type` text NOT NULL,
	`requirement_value` integer NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `badges_badge_name_unique` ON `badges` (`badge_name`);--> statement-breakpoint
CREATE TABLE `chat_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`chat_id` text NOT NULL,
	`message_role` text NOT NULL,
	`message_content` text NOT NULL,
	`model_used` text,
	`tokens_in` integer,
	`tokens_out` integer,
	`routing_reason` text,
	`latency` real,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `code_execution_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`language` text NOT NULL,
	`code` text NOT NULL,
	`output` text,
	`error` text,
	`cpu_usage` real,
	`memory_usage` real,
	`execution_time` real,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `global_config` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `global_config_key_unique` ON `global_config` (`key`);--> statement-breakpoint
CREATE TABLE `model_routing_rules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`rule_name` text NOT NULL,
	`trigger_type` text NOT NULL,
	`trigger_value` text NOT NULL,
	`target_model` text NOT NULL,
	`priority` integer DEFAULT 0,
	`is_enabled` integer DEFAULT true,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `plugins` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`plugin_name` text NOT NULL,
	`plugin_type` text NOT NULL,
	`is_enabled` integer DEFAULT true,
	`config` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `plugins_plugin_name_unique` ON `plugins` (`plugin_name`);--> statement-breakpoint
CREATE TABLE `rag_files` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`file_name` text NOT NULL,
	`file_type` text NOT NULL,
	`file_size` integer NOT NULL,
	`chunk_count` integer DEFAULT 0,
	`extracted_text` text,
	`indexed_at` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `splash_config` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`video_url` text,
	`background_image` text,
	`glow_color` text,
	`duration` integer DEFAULT 3,
	`title` text,
	`subtitle` text,
	`screen_shake` integer DEFAULT true,
	`fire_particles` integer DEFAULT true,
	`fog_layer` integer DEFAULT true,
	`loading_messages` text,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `system_notes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`note_type` text NOT NULL,
	`is_active` integer DEFAULT true,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	`expires_at` text
);
--> statement-breakpoint
CREATE TABLE `themes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`primary_color` text NOT NULL,
	`accent_color` text NOT NULL,
	`background_color` text NOT NULL,
	`glow_intensity` integer DEFAULT 5,
	`animation_speed` text DEFAULT 'normal',
	`chat_bubble_style` text NOT NULL,
	`font_family` text NOT NULL,
	`devil_accents` integer DEFAULT true,
	`smoke_density` integer DEFAULT 5,
	`gradient_mode` text NOT NULL,
	`icon_set` text NOT NULL,
	`is_enabled` integer DEFAULT true,
	`is_default` integer DEFAULT false,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `themes_name_unique` ON `themes` (`name`);--> statement-breakpoint
CREATE TABLE `ui_texts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`category` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ui_texts_key_unique` ON `ui_texts` (`key`);--> statement-breakpoint
CREATE TABLE `user_stats` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`xp` integer DEFAULT 0,
	`level` integer DEFAULT 1,
	`streak` integer DEFAULT 0,
	`last_login` text NOT NULL,
	`badges` text,
	`total_messages` integer DEFAULT 0,
	`total_files_uploaded` integer DEFAULT 0,
	`total_code_runs` integer DEFAULT 0,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_stats_user_id_unique` ON `user_stats` (`user_id`);--> statement-breakpoint
CREATE TABLE `user_themes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`theme_id` integer NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`theme_id`) REFERENCES `themes`(`id`) ON UPDATE no action ON DELETE no action
);
