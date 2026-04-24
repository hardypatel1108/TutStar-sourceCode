<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Board;
use App\Models\Clazz;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlanController extends Controller
{
    /**
     * Display the specified resource.
     */
    public function show($boardSlug, $classSlug)
    {
        // Fetch board by slug
        $board = Board::where('slug', $boardSlug)->firstOrFail();

        // Fetch class by slug (and verify it belongs to the same board if linked)
        $Clazz = Clazz::where('slug', $classSlug)
            ->where('board_id', $board->id)
            ->firstOrFail();
        // Example: fetch all plans related to this board + class (if you have a plans table)
       $plans = [
            [
                'id' => 1,
                'name' => 'Smart Subject Plan',
                'tag' => 'Necessary',
                'type' => 'single',
                'price' => 4999,
                'description' => 'Everything covered in single subject plan, and;',
                'features' => [
                    'Subject focus — In depth syllabus',
                    'Doubt Support — Fixed slot + 24/7 post a doubt feature',
                    'Practice & Tests — Daily homework, weekly practice sheets, periodic tests',
                    'Progress Report — Monthly',
                    'Recording — On request',
                    'Savings/Discount — Limited',
                ],
            ],
            [
                'id' => 2,
                'name' => 'Combo Advantage Plan',
                'tag' => 'Most Popular',
                'type' => 'combo',
                'price' => 7999,
                'description' => 'Everything covered in single subject plan, and;',
                'features' => [
                    'Subject focus — In depth syllabus',
                    'Doubt Support — Fixed slot + 24/7 post a doubt feature',
                    'Practice & Tests — Daily homework, weekly practice sheets, periodic tests',
                    'Progress Report — Monthly',
                    'Recording — On request',
                    'Savings/Discount — Extra',
                    'Parent Teacher Connect — Twice a month',
                ],
            ],
            [
                'id' => 3,
                'name' => 'Star Achiever Plan',
                'tag' => 'Recommended',
                'type' => 'all',
                'price' => 10999,
                'description' => 'Everything covered in single subject and combo plan, and;',
                'features' => [
                    'Subject focus — In depth all subjects',
                    'Doubt Support — 24/7 doubts on priority',
                    'Practice & Tests — More tests, more sheets, daily homework',
                    'Progress Report — Weekly',
                    'Recording — Anytime access + longer validity',
                    'Savings/Discount — Maximum',
                    'Parent Teacher Connect — Regular',
                    'Personal Student Counselling — One-on-one session',
                    'Exclusive Masterclass — Guest & top educators',
                    'Topper’s Student Community — Connect, discuss & compete',
                ],
            ],
        ];

        return Inertia::render('Plan', [
            'board' => $board,
            'clazz' => $Clazz,
            'plans' => $plans,
        ]);
    }
}
