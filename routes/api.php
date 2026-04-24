<?php

// routes/api.php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ZoomWebhookController;
use App\Http\Controllers\PhonePeController;
use App\Http\Controllers\PhonePePaymentController;
use App\Http\Controllers\PhonePeWebhookController;

Route::post('/zoom/webhook', [ZoomWebhookController::class, 'handle']);
 
Route::post('phonepe/webhook', [PhonePeWebhookController::class, 'handle'])
    ->name('phonepe.webhook');


    Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/phonepe/create', [PhonePePaymentController::class, 'create'])
    ->name('api.phonepe.create');
  
    Route::get('/phonepe/status/{merchantOrderId}', [PhonePePaymentController::class, 'status'])
        ->name('api.phonepe.status');
});

// Create New Webhook
// https://tutstar.cytnest.com/phonepe/webhook
// tutstar
// Nature123
