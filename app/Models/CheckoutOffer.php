<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Offers applied at checkout (global)
 */
class CheckoutOffer extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [ 'checkout_plan_id','title','type','value','starts_at','ends_at','active'];
    protected $casts = ['starts_at'=>'datetime','ends_at'=>'datetime','active'=>'boolean','created_at'=>'datetime','updated_at'=>'datetime'];
     public function checkoutPlan()
    {
        return $this->belongsTo(CheckoutPlan::class);
    }
}
