<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('pending_enrollments')) {
            return;
        }

        DB::statement(<<<'SQL'
CREATE TABLE `pending_enrollments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `student_id` bigint(20) unsigned NOT NULL,
  `payment_id` bigint(20) unsigned NOT NULL,
  `plan_id` bigint(20) unsigned NOT NULL,
  `checkout_plan_id` bigint(20) unsigned DEFAULT NULL,
  `resolved` tinyint(1) NOT NULL DEFAULT 0,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `pending_enrollments_payment_id_foreign` (`payment_id`),
  KEY `pending_enrollments_plan_id_foreign` (`plan_id`),
  KEY `pending_enrollments_checkout_plan_id_foreign` (`checkout_plan_id`),
  KEY `idx_pending_enrollments_student_id` (`student_id`),
  KEY `idx_pending_enrollments_resolved` (`resolved`),
  CONSTRAINT `pending_enrollments_checkout_plan_id_foreign` FOREIGN KEY (`checkout_plan_id`) REFERENCES `checkout_plans` (`id`) ON DELETE SET NULL,
  CONSTRAINT `pending_enrollments_payment_id_foreign` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pending_enrollments_plan_id_foreign` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pending_enrollments_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
SQL);
    }

    public function down(): void
    {
        Schema::dropIfExists('pending_enrollments');
    }
};
