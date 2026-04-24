<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PendingEnrollment extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'payment_id',
        'plan_id',
        'checkout_plan_id',
        'resolved',
        'resolved_at',
    ];

    public function student() { return $this->belongsTo(Student::class); }
    public function payment() { return $this->belongsTo(Payment::class); }
    public function plan() { return $this->belongsTo(Plan::class); }
    public function checkoutPlan() { return $this->belongsTo(CheckoutPlan::class); }
}



// Create entry after successful payment

// Wherever payment is marked SUCCESS (PhonePe callback / payment verify controller), add:

// if ($payment->status === PaymentStatus::SUCCESS) {

//     // avoid duplicate pending enrollment
//     $alreadyPending = PendingEnrollment::where('student_id', $payment->student_id)
//         ->where('resolved', false)
//         ->exists();

//     if (!$alreadyPending) {
//         PendingEnrollment::create([
//             'student_id' => $payment->student_id,
//             'payment_id' => $payment->id,
//             'plan_id' => $payment->checkoutPlan->plan_id, // main plan -> from checkout plan
//             'checkout_plan_id' => $payment->checkout_plan_id,
//         ]);
//     }
// }

// 🛑 Prevent adding duplicate if student already assigned to a batch

// Before inserting PendingEnrollment, also check:

// $alreadyInBatch = BatchStudent::where('student_id', $payment->student_id)->exists();

// if ($alreadyInBatch) {
//     // student already allocated to batch → don't create pending entry
//     return;
// }

// Final combined logic
// if ($payment->status === PaymentStatus::SUCCESS) {

//     // Skip if already allocated
//     if (BatchStudent::where('student_id', $payment->student_id)->exists()) {
//         return;
//     }

//     // Skip duplicated pending enrollement
//     if (PendingEnrollment::where('student_id', $payment->student_id)->where('resolved', false)->exists()) {
//         return;
//     }

//     PendingEnrollment::create([
//         'student_id' => $payment->student_id,
//         'payment_id' => $payment->id,
//         'plan_id' => $payment->checkoutPlan->plan_id,
//         'checkout_plan_id' => $payment->checkout_plan_id,
//     ]);
// }
