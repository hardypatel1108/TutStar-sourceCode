<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CheckoutPlan extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'plan_id',
        'title',
        'months',
    ];

    protected $casts = [
        'months' => 'integer',
    ];

    protected $dates = [
        'deleted_at',
    ];

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function offers()
    {
        return $this->hasMany(CheckoutOffer::class);
    }
}
