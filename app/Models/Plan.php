<?php

namespace App\Models;

use App\Enums\PlanType;
use App\Enums\PlanStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Subscription plans
 */
class Plan extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'board_id',
        'class_id',
        'title',
        'type',
        'duration_days',
        'ongoing_batches',
        'price',
        'description',
        'status'
    ];

    protected $casts = [
        'type' => PlanType::class,
        'status' => PlanStatus::class,
        'duration_days' => 'integer',
        'ongoing_batches' => 'integer',
        'price' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    public function board(): BelongsTo
    {
        return $this->belongsTo(Board::class);
    }

    public function clazz(): BelongsTo
    {
        return $this->belongsTo(Clazz::class, 'class_id');
    }

    public function subjects(): BelongsToMany
    {
        return $this->belongsToMany(Subject::class, 'plan_subjects', 'plan_id', 'subject_id');
    }

    public function offers(): HasMany
    {
        return $this->hasMany(PlanOffer::class);
    }

    public function batches(): HasMany
    {
        return $this->hasMany(Batch::class);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(StudentSubscription::class);
    }

    public function checkoutPlans(): HasMany
    {
        return $this->hasMany(CheckoutPlan::class);
    }
}
