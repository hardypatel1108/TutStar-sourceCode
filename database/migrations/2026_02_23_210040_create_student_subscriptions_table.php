<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('student_subscriptions')) {
            return;
        }

        DB::statement(<<<'SQL'
CREATE TABLE `student_subscriptions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `student_id` bigint(20) unsigned NOT NULL,
  `plan_id` bigint(20) unsigned NOT NULL,
  `start_at` datetime NOT NULL,
  `end_at` datetime NOT NULL,
  `status` enum('active','expired','cancelled') DEFAULT 'active',
  `auto_renew` tinyint(1) DEFAULT 0,
  `price_paid` decimal(10,2) DEFAULT 0.00,
  `phonepe_order_id` varchar(255) DEFAULT NULL,
  `reminder_5_sent` tinyint(1) NOT NULL DEFAULT 0,
  `reminder_3_sent` tinyint(1) NOT NULL DEFAULT 0,
  `reminder_1_sent` tinyint(1) NOT NULL DEFAULT 0,
  `last_in_app_reminder_at` timestamp NULL DEFAULT NULL,
  `last_email_reminder_at` timestamp NULL DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `plan_id` (`plan_id`),
  KEY `idx_sub_student` (`student_id`),
  KEY `idx_sub_status` (`status`),
  KEY `idx_deleted_at` (`deleted_at`),
  CONSTRAINT `student_subscriptions_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_subscriptions_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=144 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
SQL);
    }

    public function down(): void
    {
        Schema::dropIfExists('student_subscriptions');
    }
};
