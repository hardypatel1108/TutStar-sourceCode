<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('homeworks')) {
            return;
        }

        DB::statement(<<<'SQL'
CREATE TABLE `homeworks` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `classes_session_id` bigint(20) unsigned DEFAULT NULL,
  `teacher_id` bigint(20) unsigned DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `attachment` varchar(255) DEFAULT NULL,
  `due_date` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_homework_per_session` (`classes_session_id`),
  KEY `idx_classes_session_id` (`classes_session_id`),
  KEY `idx_teacher_id` (`teacher_id`),
  KEY `idx_deleted_at` (`deleted_at`),
  CONSTRAINT `homeworks_ibfk_1` FOREIGN KEY (`classes_session_id`) REFERENCES `classes_sessions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `homeworks_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=85 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
SQL);
    }

    public function down(): void
    {
        Schema::dropIfExists('homeworks');
    }
};
