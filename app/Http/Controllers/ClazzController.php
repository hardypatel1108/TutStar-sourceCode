<?php

namespace App\Http\Controllers;

use App\Models\Board;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClazzController extends Controller
{
    /**
     * Display a listing of classes for the selected board.
     */
    public function index(Request $request)
    {
        // Get the ?board=cbse from the query string
        $boardSlug = $request->query('board');

        // Convert the slug into normal case (cbse → CBSE)
        $boardName = ucwords(str_replace('-', ' ', $boardSlug));

        // Fetch board with its related classes
        $board = Board::whereRaw('LOWER(name) = ?', [strtolower($boardName)])
            ->with(['classes' => function ($q) {
                $q->select('id', 'board_id', 'name', 'slug', 'description', 'ordinal', 'status')
                    ->orderBy('ordinal', 'asc');
            }])
            ->first();

        if (!$board) {
            abort(404, 'Board not found');
        }

        return Inertia::render('ClassList', [
            'board' => $board->only(['id', 'name', 'description', 'slug']),
            'classes' => $board->classes,
        ]);
    }

     public function show(Request $request)
    {
        return Inertia::render('Student/lasses_detail');
    }
}
