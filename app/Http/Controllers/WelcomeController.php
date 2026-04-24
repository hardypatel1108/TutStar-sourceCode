<?php

namespace App\Http\Controllers;

use App\Models\Board;
use Inertia\Inertia;

class WelcomeController extends Controller
{
    public function index()
    {
        // Fetch active boards (assuming `status` = 1 means active)
        $boards = Board::where('status', 1)
            ->select('id', 'name', 'description', 'logo', 'slug')
            ->get();

        return Inertia::render('welcome', [
            'boards' => $boards
        ]);
    }
}
