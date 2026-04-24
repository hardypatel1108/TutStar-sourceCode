<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('classes_sessions')) {
            return;
        }

        DB::statement(<<<'SQL'
CREATE TABLE `classes_sessions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `batch_id` bigint(20) unsigned DEFAULT NULL,
  `class_date` datetime NOT NULL,
  `subject_id` bigint(20) unsigned DEFAULT NULL,
  `teacher_id` bigint(20) unsigned DEFAULT NULL,
  `meeting_id` bigint(20) unsigned DEFAULT NULL,
  `occurrence_id` varchar(255) DEFAULT NULL,
  `topic` varchar(255) DEFAULT NULL,
  `status` enum('scheduled','completed','cancelled','rescheduled') DEFAULT 'scheduled',
  `zoom_meeting_id` varchar(255) DEFAULT NULL,
  `zoom_join_url` text DEFAULT NULL,
  `zoom_start_url` text DEFAULT NULL,
  `recording_link` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `batch_id` (`batch_id`),
  KEY `subject_id` (`subject_id`),
  KEY `teacher_id` (`teacher_id`),
  KEY `idx_session_date` (`class_date`),
  KEY `idx_session_status` (`status`),
  KEY `idx_deleted_at` (`deleted_at`),
  KEY `classes_sessions_meeting_id_foreign` (`meeting_id`),
  KEY `idx_classes_sessions_occurrence_id` (`occurrence_id`),
  CONSTRAINT `classes_sessions_ibfk_1` FOREIGN KEY (`batch_id`) REFERENCES `batches` (`id`) ON DELETE SET NULL,
  CONSTRAINT `classes_sessions_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE SET NULL,
  CONSTRAINT `classes_sessions_ibfk_3` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `classes_sessions_meeting_id_foreign` FOREIGN KEY (`meeting_id`) REFERENCES `meetings` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=868 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
SQL);
    }

    public function down(): void
    {
        Schema::dropIfExists('classes_sessions');
    }
};
