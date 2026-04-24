<?php

namespace App\Models;

use App\Enums\PaymentGateway;
use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Payment record (PhonePe / manual)
 */
class Payment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'student_id','subscription_id','checkout_plan_id','amount','gateway','gateway_txn_id','gateway_response','gateway_verified','status','note','created_by'
    ];

    protected $casts = [
        'gateway' => PaymentGateway::class,
        'gateway_response' => 'array',
        'gateway_verified' => 'boolean',
        'status' => PaymentStatus::class,
        'amount' => 'decimal:2',
        'created_at' => 'datetime','updated_at' => 'datetime'
    ];

    public function student(): BelongsTo { return $this->belongsTo(Student::class); }
    public function subscription(): BelongsTo { return $this->belongsTo(StudentSubscription::class,'subscription_id'); }
    public function creator(): BelongsTo { return $this->belongsTo(User::class,'created_by'); }
    public function checkoutPlan(): BelongsTo { return $this->belongsTo(CheckoutPlan::class); }
}
