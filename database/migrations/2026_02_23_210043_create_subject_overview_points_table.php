<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('subject_overview_points')) {
            return;
        }

        DB::statement(<<<'SQL'
CREATE TABLE `subject_overview_points` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `subject_overview_id` bigint(20) unsigned NOT NULL,
  `content` text NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_overview_points_overview` (`subject_overview_id`),
  CONSTRAINT `fk_overview_points_overview` FOREIGN KEY (`subject_overview_id`) REFERENCES `subject_overviews` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
SQL);
    }

    public function down(): void
    {
        Schema::dropIfExists('subject_overview_points');
    }
};
