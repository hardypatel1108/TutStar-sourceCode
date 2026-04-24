<?php

namespace App\Models;

use App\Enums\SubscriptionStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Student subscription record
 */
class StudentSubscription extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'student_id',
        'plan_id',
        'start_at',
        'end_at',
        'status',
        'auto_renew',
        'price_paid',
        'phonepe_order_id',
        'reminder_5_sent',
        'reminder_3_sent',
        'reminder_1_sent',
        'last_in_app_reminder_at',
        'last_email_reminder_at',
    ];
    protected $casts = [
          'start_at' => 'datetime',
    'end_at' => 'datetime',
    'auto_renew' => 'boolean',
    'price_paid' => 'decimal:2',
    'status' => SubscriptionStatus::class,
    'reminder_5_sent' => 'boolean',
    'reminder_3_sent' => 'boolean',
    'reminder_1_sent' => 'boolean',
    'last_in_app_reminder_at' => 'datetime',
    'last_email_reminder_at' => 'datetime',
    'created_at' => 'datetime',
    'updated_at' => 'datetime',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'subscription_id');
    }
}
