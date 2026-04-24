<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('events')) {
            return;
        }

        DB::statement(<<<'SQL'
CREATE TABLE `events` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `event_image` varchar(255) DEFAULT NULL,
  `meeting_id` bigint(20) unsigned DEFAULT NULL,
  `meeting_type` enum('single','recurring') NOT NULL DEFAULT 'single',
  `recurrence` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`recurrence`)),
  `zoom_meeting_id` varchar(255) DEFAULT NULL,
  `zoom_join_url` text DEFAULT NULL,
  `zoom_start_url` text DEFAULT NULL,
  `zoom_recording_link` text DEFAULT NULL,
  `zoom_status` enum('scheduled','started','ended','cancelled') DEFAULT 'scheduled',
  `starts_at` datetime NOT NULL,
  `ends_at` datetime DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_event_time` (`starts_at`),
  KEY `idx_zoom_status` (`zoom_status`),
  KEY `idx_deleted_at` (`deleted_at`),
  KEY `events_meeting_id_index` (`meeting_id`),
  KEY `events_meeting_type_index` (`meeting_type`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
SQL);
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
