<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('meetings')) {
            return;
        }

        DB::statement(<<<'SQL'
CREATE TABLE `meetings` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `created_by` bigint(20) unsigned NOT NULL,
  `topic` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `zoom_meeting_id` text DEFAULT NULL,
  `zoom_uuid` varchar(255) DEFAULT NULL,
  `zoom_host_email` varchar(255) DEFAULT NULL,
  `start_time` datetime NOT NULL,
  `duration` int(11) NOT NULL DEFAULT 60,
  `status` enum('scheduled','started','ended','cancelled') NOT NULL DEFAULT 'scheduled',
  `start_url` text DEFAULT NULL,
  `join_url` text DEFAULT NULL,
  `recording_status` enum('none','processing','available','failed') NOT NULL DEFAULT 'none',
  `recording_url` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `meeting_type` enum('single','recurring') NOT NULL DEFAULT 'single',
  `recurrence` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`recurrence`)),
  `timezone` varchar(50) DEFAULT 'Asia/Kolkata',
  PRIMARY KEY (`id`),
  KEY `meetings_created_by_foreign` (`created_by`),
  KEY `zoom_meeting_id` (`zoom_meeting_id`(768)),
  KEY `zoom_uuid` (`zoom_uuid`),
  KEY `status` (`status`),
  CONSTRAINT `meetings_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
SQL);
    }

    public function down(): void
    {
        Schema::dropIfExists('meetings');
    }
};
