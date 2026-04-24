<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (! Schema::hasTable('notifications')) {
            return;
        }

        if (Schema::hasColumn('notifications', 'viewed_at')) {
            return;
        }

        Schema::table('notifications', function (Blueprint $table) {
            $table->dateTime('viewed_at')->nullable()->after('read_at');
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('notifications')) {
            return;
        }

        if (! Schema::hasColumn('notifications', 'viewed_at')) {
            return;
        }

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropColumn('viewed_at');
        });
    }
};
