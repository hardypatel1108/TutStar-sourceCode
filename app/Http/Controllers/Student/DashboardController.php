<?php
namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\ClassSession;

class DashboardController extends Controller
{
    

    public function index()
    {
        $student = Auth::user();
        $upcomingClasses = ClassSession::whereHas('batch.students', fn($q) => $q->where('student_id', $student->id))
            ->where('date', '>=', now())
            ->orderBy('date')
            ->take(10)
            ->get();

        return Inertia::render('Student/Dashboard/Index', [
            'student' => $student,
            'upcomingClasses' => $upcomingClasses,
        ]);
    }
}
