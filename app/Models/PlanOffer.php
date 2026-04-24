<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Offers specific to a plan
 */
class PlanOffer extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'plan_id','title','type','value','starts_at','ends_at','active'
    ];

    protected $casts = [
        'starts_at'=>'datetime','ends_at'=>'datetime','active'=>'boolean','created_at'=>'datetime','updated_at'=>'datetime'
    ];

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }
}
