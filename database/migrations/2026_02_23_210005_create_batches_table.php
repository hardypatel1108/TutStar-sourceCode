<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('batches')) {
            return;
        }

        DB::statement(<<<'SQL'
CREATE TABLE `batches` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `batch_code` varchar(150) NOT NULL,
  `plan_id` bigint(20) unsigned DEFAULT NULL,
  `class_id` bigint(20) unsigned DEFAULT NULL,
  `subject_id` bigint(20) unsigned DEFAULT NULL,
  `teacher_id` bigint(20) unsigned DEFAULT NULL,
  `time_slot` varchar(30) DEFAULT NULL,
  `students_limit` int(11) DEFAULT 100,
  `status` enum('upcoming','active','inactive','completed') DEFAULT 'upcoming',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `plan_id` (`plan_id`),
  KEY `subject_id` (`subject_id`),
  KEY `idx_batch_teacher` (`teacher_id`),
  KEY `idx_batch_class` (`class_id`),
  KEY `idx_deleted_at` (`deleted_at`),
  KEY `batches_time_slot_index` (`time_slot`),
  CONSTRAINT `batches_ibfk_1` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE SET NULL,
  CONSTRAINT `batches_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `batches_ibfk_3` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE SET NULL,
  CONSTRAINT `batches_ibfk_4` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=97 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
SQL);
    }

    public function down(): void
    {
        Schema::dropIfExists('batches');
    }
};
