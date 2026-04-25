<?php

use App\Http\Controllers\Admin\BatchController;
use App\Http\Controllers\Admin\BatchScheduleController;
use App\Http\Controllers\Admin\BatchStudentController;
use App\Http\Controllers\Admin\BoardController;
use App\Http\Controllers\Admin\CheckoutOfferController;
use App\Http\Controllers\Admin\CheckoutPlanController;
use App\Http\Controllers\Admin\ClassSessionController;
use App\Http\Controllers\Admin\ClazzController as AdminClazzController;
use App\Http\Controllers\Admin\DoubtController;
use App\Http\Controllers\Admin\EventController;
use App\Http\Controllers\Admin\FeedbackController;
use App\Http\Controllers\Admin\HomeworkController;
use App\Http\Controllers\Admin\PaymentController;
use App\Http\Controllers\Admin\PendingEnrollmentController;
use App\Http\Controllers\Admin\PlanController as AdminPlanController;
use App\Http\Controllers\Admin\PlanOfferController;
use App\Http\Controllers\Admin\PracticeTestController;
use App\Http\Controllers\Admin\Settings\PasswordController as SettingsPasswordController;
use App\Http\Controllers\Admin\Settings\ProfileController as SettingsProfileController;
use App\Http\Controllers\Admin\StudentController;
use App\Http\Controllers\Admin\StudentSubscriptionController;
use App\Http\Controllers\Admin\SubjectController;
use App\Http\Controllers\Admin\SubjectFeatureController;
use App\Http\Controllers\Admin\SubjectOverviewController;
use App\Http\Controllers\Admin\SubjectSyllabusController;
use App\Http\Controllers\Admin\TeacherController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\Auth\AdminLoginController;
use App\Http\Controllers\RoleController;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Auth\TeacherLoginController;
use App\Http\Controllers\ClazzController;
use App\Http\Controllers\PhonePePaymentController;
use App\Http\Controllers\PhonePeWebhookController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\PlanSubjectController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\StudentClazzController;
use App\Http\Controllers\Teacher\DashboardController as TeacherDashboardController;
use App\Http\Controllers\WelcomeController;
use Illuminate\Support\Facades\Auth;

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Student\DoubtController as StudentDoubtController;
use App\Http\Controllers\Student\HomeworkController as StudentHomeworkController;
use App\Http\Controllers\Student\NotificationsController as StudentNotificationsController;
use App\Http\Controllers\Student\PracticeTestController as StudentPracticeTestController;
use App\Http\Controllers\Student\SubscriptionController as StudentSelfSubscriptionController;
use App\Http\Controllers\Teacher\BatchController as TeacherBatchController;
use App\Http\Controllers\Teacher\ClassSessionController as TeacherClassSessionController;
use App\Http\Controllers\Teacher\DoubtController as TeacherDoubtController;
use App\Http\Controllers\Teacher\HomeworkController as TeacherHomeworkController;
use App\Http\Controllers\Teacher\NotificationController as TeacherNotificationController;
use App\Http\Controllers\Teacher\Settings\PasswordController as TeacherSettingsPasswordController;
use App\Http\Controllers\Teacher\Settings\ProfileController as TeacherSettingsProfileController;
use App\Models\Clazz;
use App\Http\Controllers\MeetingController;
use App\Http\Controllers\Teacher\PracticeTestController as TeacherPracticeTestController;
use App\Models\Homework;
use App\Models\User;
use App\Enums\NotificationType;
use App\Services\NotificationService;


Route::get('/', [WelcomeController::class, 'index'])->name('home');

Route::get('/csrf-refresh', function () {
    $token = csrf_token();
    $cookie = cookie(
        'XSRF-TOKEN',
        $token,
        config('session.lifetime'),
        '/',
        config('session.domain'),
        (bool) config('session.secure'),
        false,
        false,
        config('session.same_site') ?? 'lax'
    );

    return response()->noContent()->withCookie($cookie);
});

Route::get('/csrf-token', function () {
    return response()->json([
        'token' => csrf_token(),
    ]);
});

Route::get('/about-us', function () {
    return Inertia::render('about');
})->name('about');

Route::get('/contact', function () {
    return Inertia::render('contact');
})->name('contact');

Route::resource('/class', ClazzController::class)->names('clazz');
Route::get('/plan/{boardSlug}/{classSlug}', [PlanController::class, 'show'])->name('plan.show');
Route::get('/plans/{classId}/{type}', [PlanSubjectController::class, 'index'])->name('plans.index');
Route::get('/plans/{id}', [PlanSubjectController::class, 'show'])->name('plans.show');

Route::get('/test/payment-mail/{payment}', [PhonePeWebhookController::class, 'sendMail']);

// Teacher area
Route::prefix('teacher')->name('teacher.')->group(function () {
    Route::middleware('guest.teacher')->group(function () {
        Route::get('/', [TeacherLoginController::class, 'create'])->name('home');
        Route::get('/login', [TeacherLoginController::class, 'create'])->name('login');
        Route::post('/login', [TeacherLoginController::class, 'store'])->name('login.store');
    });

    Route::middleware('auth:teacher')->group(function () {
        Route::get('/dashboard', [TeacherDashboardController::class, 'index'])->name('dashboard');
        Route::resource('doubts', TeacherDoubtController::class)->names('doubts');
        Route::resource('homeworks', TeacherHomeworkController::class)->names('homeworks');
        Route::get('notifications', [TeacherNotificationController::class, 'index'])->name('notifications.index');
        Route::post('notifications/read', [TeacherNotificationController::class, 'markAllRead'])->name('notifications.markAllRead');
        Route::post('notifications/{notification}/read', [TeacherNotificationController::class, 'markRead'])->name('notifications.markRead');
        Route::resource('practice-tests', TeacherPracticeTestController::class)->names('practiceTests');
        Route::resource('upcoming-classes', TeacherClassSessionController::class);
        Route::get('today-classes', [TeacherClassSessionController::class, 'upcoming24Hours'])->name('today-classes');
        Route::resource('allotted-batches', TeacherBatchController::class);

        // settings
        Route::redirect('settings', 'settings/profile')->name('settings');
        Route::get('settings/profile', [TeacherSettingsProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('settings/profile', [TeacherSettingsProfileController::class, 'update'])->name('profile.update');
        Route::delete('settings/profile', [TeacherSettingsProfileController::class, 'destroy'])->name('profile.destroy');
        Route::get('settings/password', [TeacherSettingsPasswordController::class, 'edit'])->name('password.edit');
        Route::put('settings/password', [TeacherSettingsPasswordController::class, 'update'])->middleware('throttle:6,1')->name('password.update');
        Route::get('settings/appearance', function () {
            return Inertia::render('Teacher/settings/appearance');
        })->name('appearance');
        Route::post('/logout', [TeacherLoginController::class, 'destroy'])->name('logout');
    });
});

// Admin area
Route::prefix('admin')->name('admin.')->group(function () {
    Route::middleware('guest.admin')->group(function () {
        Route::get('/', [AdminLoginController::class, 'create'])->name('home');
        Route::get('/login', [AdminLoginController::class, 'create'])->name('login');
        Route::post('/login', [AdminLoginController::class, 'store'])->name('login.store');
    });
    Route::middleware('auth:admin')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
        Route::resource('roles', RoleController::class)->names('roles');
        Route::resource('boards', BoardController::class)->names('boards');
        Route::resource('batches', BatchController::class)->names('batches');
        Route::resource('batch-schedules', BatchScheduleController::class)->names('batchSchedules');
        Route::resource('batch-students', BatchStudentController::class)->names('batchStudents');
        Route::resource('checkout-plans', CheckoutPlanController::class)->names('checkoutPlans');
        Route::resource('checkout-offers', CheckoutOfferController::class)->names('checkoutOffers');
        Route::resource('class-sessions', ClassSessionController::class)->names('classSessions');
        Route::resource('classes', AdminClazzController::class)->names('classes');
        Route::resource('doubts', DoubtController::class)->names('doubts');
        Route::resource('events', EventController::class)->names('events');
        Route::resource('feedbacks', FeedbackController::class)->names('feedbacks');
        Route::resource('homeworks', HomeworkController::class)->names('homeworks');
        Route::resource('payments', PaymentController::class)->names('payments');
        Route::resource('plans', AdminPlanController::class)->names('plans');
        Route::resource('plan-offers', PlanOfferController::class)->names('planOffers');
        Route::resource('practice-tests', PracticeTestController::class)->names('practiceTests');
        Route::resource('students', StudentController::class)->names('students');
        Route::post('students/{id}/restore', [StudentController::class, 'restore'])->name('students.restore');
        Route::resource('student-subscriptions', StudentSubscriptionController::class)->names('studentSubscriptions');
        Route::get('subjects/{subject}/copy', [SubjectController::class, 'copy'])->name('subjects.copy');
        Route::resource('subjects', SubjectController::class)->names('subjects');
        // Route::resource('subject-overviews', SubjectOverviewController::class);
        Route::resource(
            'subjects.overviews',
            SubjectOverviewController::class
        )->only(['create', 'store']);
        Route::resource(
            'subjects.features',
            SubjectFeatureController::class
        )->only(['create', 'store']);
        Route::resource(
            'subjects.syllabus',
            SubjectSyllabusController::class
        )->only(['create', 'store']);

        // Route::get(
        //     'subject-overviews/{subject}/overviews/create',
        //     [SubjectOverviewController::class, 'create']
        // )->name('admin.subject-overviews.create');

        // Route::post(
        //     'subjects/{subject}/overviews',
        //     [SubjectOverviewController::class, 'store']
        // )->name('admin.subject-overviews.store');
        Route::resource('teachers', TeacherController::class)->names('teachers');
        Route::get('classes-by-plan/{planId}', [BatchController::class, 'classesByPlan'])->name('classesByPlan');
        Route::get('eligible-teachers', [BatchController::class, 'eligibleTeachers'])->name('batches.eligibleTeachers');
        Route::get('classes-by-board/{boardId}', [AdminPlanController::class, 'classesByBoard'])->name('classesByBoard');
        Route::get('subjects-by-class/{classId}', [AdminPlanController::class, 'subjectsByClass'])->name('subjectsByClass');
        Route::get(
            'class-sessions/batch/{batch}/data',
            [ClassSessionController::class, 'batchData']
        )->name('classSessions.batch.data');
        // settings
        Route::redirect('settings', 'settings/profile');
        Route::get('settings/profile', [SettingsProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('settings/profile', [SettingsProfileController::class, 'update'])->name('profile.update');
        Route::delete('settings/profile', [SettingsProfileController::class, 'destroy'])->name('profile.destroy');
        Route::get('settings/password', [SettingsPasswordController::class, 'edit'])->name('password.edit');
        Route::put('settings/password', [SettingsPasswordController::class, 'update'])
            ->middleware('throttle:6,1')
            ->name('password.update');
        Route::get('settings/appearance', function () {
            return Inertia::render('Admin/settings/appearance');
        })->name('appearance');
        //  settings end
        // meetings
        // Route::resource('meetings', MeetingController::class);
        Route::get('/meetings', [MeetingController::class, 'index'])->name('meetings.index');
        Route::get('/meetings/create', [MeetingController::class, 'create'])->name('meetings.create');
        Route::post('/meetings', [MeetingController::class, 'store'])->name('meetings.store');
        Route::get('/meetings/{meeting}/edit', [MeetingController::class, 'edit'])->name('meetings.edit');
        Route::put('/meetings/{meeting}', [MeetingController::class, 'update'])->name('meetings.update');
        Route::delete('/meetings/{meeting}', [MeetingController::class, 'destroy'])->name('meetings.destroy');
        Route::get('/meetings/{meeting}/join', [MeetingController::class, 'join'])->name('meetings.join');
        // meetings end 

        Route::get('/pending-enrollments', [PendingEnrollmentController::class, 'index'])->name('pendingEnrollments.index');
        Route::put('/pending-enrollments/{pending}/resolve', [PendingEnrollmentController::class, 'resolve'])->name('pendingEnrollments.resolve');
        Route::post('/pending-enrollments/{pending}/assign', [PendingEnrollmentController::class, 'assign'])->name('pendingEnrollments.assign');
        Route::post('logout', [AdminLoginController::class, 'destroy'])
            ->name('logout');
    });
});


Route::middleware(['auth:web', 'verified'])->group(function () {
    Route::get('checkout/{id}', [CheckoutController::class, 'index'])->name('checkout');
    Route::get('enroll/{id}', [CheckoutController::class, 'index'])->name('enroll');
    Route::redirect('dashboard', '/my-classes')->name('dashboard');
    Route::get('schedule', [ScheduleController::class, 'index'])->name('schedule');
    Route::get('my-classes', [StudentClazzController::class, 'index'])->name('myClasses');
    Route::get('notifications', [StudentNotificationsController::class, 'index'])->name('myNotifications');
    Route::get('other-notifications', [StudentNotificationsController::class, 'otherNotifications'])->name('otherNotifications');
    Route::get('home-work', [StudentHomeworkController::class, 'index'])->name('homeworks');
    Route::get('practice-test', [StudentPracticeTestController::class, 'index'])->name('practiceTest');
    Route::get('my-subscriptions', [StudentSelfSubscriptionController::class, 'index'])->name('student.subscriptions.index');
    Route::get('post-doubt', [StudentDoubtController::class, 'index'])->name('postDoubt');
    Route::post('phonepe/create', [PhonePePaymentController::class, 'create'])->name('phonepe.create');
    Route::post('phonepe/process', [PhonePePaymentController::class, 'process'])->name('phonepe.process');
    Route::get('phonepe/process', [PhonePePaymentController::class, 'process'])->name('phonepe.process.get');
    Route::post('notifications/read', [StudentNotificationsController::class, 'markAllRead'])->name('notifications.markAllRead');
    Route::post('other-notifications/read', [StudentNotificationsController::class, 'markAllOtherRead'])->name('otherNotifications.markAllRead');
    Route::post('notifications/{notification}/read', [StudentNotificationsController::class, 'markRead'])->name('notifications.markRead');
    Route::post('post-doubt/store', [StudentDoubtController::class, 'store'])->name('postDoubt.store');


    Route::get('homework/download/{homework}', function (Homework $homework) {
        if (!$homework->attachment) {
            abort(404);
        }

        $path = storage_path('app/public/' . $homework->attachment);
        if (!file_exists($path)) {
            abort(404);
        }

        return response()->download($path);
    })->name("homework");
});

Route::get('debug/zoom-token', function (\App\Services\ZoomService $zoom) {
    try {
        dd($zoom->listUsers());
    } catch (\Throwable $e) {
        dd($e->getMessage());
    }
});

Route::get('/clear-cache', function () {
    Artisan::call('cache:clear');
    Artisan::call('route:clear');
    Artisan::call('config:clear');
    Artisan::call('view:clear');
    return "All caches (application, route, config, view) cleared!";
});
require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

Route::fallback(function () {
    abort(404);
});

Route::get('404', function () {
    abort(404);
})->name('custom.404');


// Route::get('dashboard', [StudentDashboardController::class, 'index'])->name('dashboard');
// Route::get('feedback', [StudentFeedBackController::class, 'index'])->name('feedback');
    // $guards = ['admin', 'teacher', 'web'];

    // $activeGuards = [];

    // foreach ($guards as $guard) {
    //     $activeGuards[$guard] = Auth::guard($guard)->check();
    // }

    // dd([
    //     'guards_status' => $activeGuards,
    //     'current_user' => collect($guards)
    //         ->filter(fn($g) => Auth::guard($g)->check())
    //         ->mapWithKeys(fn($g) => [$g => Auth::guard($g)->user()])
    //         ->toArray(),
    // ]);
// Route::get('logout', [TeacherLoginController::class, 'destroy'])
        //     ->name('logoutget');
        // Route::resource('student', UserController::class)->names('users');
    // Route::get('logout', [AdminLoginController::class, 'destroy'])
        //     ->name('logoutget');
// Route::get('login', [AuthenticatedSessionController::class, 'showStudentLogin'])->name('login');
// Route::post('login', [AuthenticatedSessionController::class, 'loginStudent']);
