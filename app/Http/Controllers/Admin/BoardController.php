<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Board;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class BoardController extends Controller
{
    /**
     * Display a listing of the boards.
     */
    public function index(Request $request)
    {
        $boards = Board::query()->when(
            $request->status && $request->status !== 'all',
            fn($q) =>
            $q->where('status', $request->status)
        )
            ->when($request->search, fn($q) => $q->where('name', 'like', "%{$request->search}%")->orWhere('description', 'like', "%{$request->search}%"))
            ->withCount(['classes', 'plans'])
            ->latest()
            ->paginate(config('app.paginate'))
            ->withQueryString();

        return Inertia::render('Admin/Boards/index', [
            'boards' => $boards,
            'filters' => $request->only('status', 'search'),
        ]);
    }

    /**
     * Show the form for creating a new board.
     */
    public function create()
    {
        return Inertia::render('Admin/Boards/create');
    }

    /**
     * Store a newly created board in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255|unique:boards,name',
            'description' => 'nullable|string|max:500',
            'logo'        => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('logo')) {
            $validated['logo'] = $request->file('logo')->store('boards/logos', 'public');
        }

        $validated['slug'] = str()->slug($validated['name']);

        Board::create($validated);

        return redirect()->route('admin.boards.index')->with('success', 'Board created successfully.');
    }

    /**
     * Show the form for editing the specified board.
     */
    public function edit(Board $board)
    {
        return Inertia::render('Admin/Boards/edit', [
            'board' => $board,
        ]);
    }

    /**
     * Update the specified board in storage.
     */
    public function update(Request $request, Board $board)
    {
        $validated = $request->validate([
            'name'        => "required|string|max:255|unique:boards,name,{$board->id}",
            'description' => 'nullable|string|max:500',
            'status'      => 'required|in:active,inactive',
            'logo'        => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('logo')) {
            // Delete old
            if ($board->logo) {
                Storage::disk('public')->delete($board->logo);
            }

            $validated['logo'] = $request->file('logo')->store('boards/logos', 'public');
        }

        $validated['slug'] = str()->slug($validated['name']);

        $board->update($validated);
        return redirect()->route('admin.boards.index')->with('success', 'Board updated successfully.');
    }


    /**
     * Remove the specified board from storage (soft delete).
     */
    public function destroy(Board $board)
    {
        $board->delete();
        return back()->with('success', 'Board deleted successfully.');
    }
}
// Route::resource('boards', BoardController::class);