<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Clazz;
use App\Models\Board;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class ClazzController extends Controller
{
    /**
     * Display a listing of the classes.
     */
    public function index(Request $request)
    {
        $query = Clazz::query()
            ->with('board') // eager-load board
            ->when($request->status, function ($q) use ($request) {
                if (in_array($request->status, ['active', 'inactive'])) {
                    $q->where('status', $request->status);
                }
            })
            ->when(
                $request->filled('board'),
                fn($q) =>
                $q->where('board_id', $request->board)
            )
            ->when(
                $request->filled('search'),
                fn($q) =>
                $q->where(function ($inner) use ($request) {
                    $inner->where('name', 'like', "%{$request->search}%")
                        ->orWhere('description', 'like', "%{$request->search}%");
                })
            )
            ->orderBy('ordinal')
            ->paginate(config('app.paginate'))
            ->through(fn($clazz) => [
                'id' => $clazz->id,
                'name' => $clazz->name,
                'description' => $clazz->description,
                'ordinal' => $clazz->ordinal,
                'status' => $clazz->status,
                'slug' => $clazz->slug,
                'board' => [
                    'id' => $clazz->board?->id,
                    'name' => $clazz->board?->name,
                    'slug' => $clazz->board?->slug,
                    'status' => $clazz->board?->status,
                ],
                'created_at' => $clazz->created_at?->format('Y-m-d H:i:s'),
            ]);

        // Get all boards for dropdown filters
        $boards = Board::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Admin/Clazz/index', [
            'classes' => $query,
            'filters' => $request->only('status', 'board', 'search'),
            'boards' => $boards,
        ]);
    }

    /**
     * Show the form for creating a new class.
     */
    public function create()
    {
        $boards = Board::select('id', 'name')->get();

        return Inertia::render('Admin/Clazz/create', [
            'boards' => $boards,
        ]);
    }

    /**
     * Store a newly created class in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'board_id'    => 'required|exists:boards,id',
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'ordinal'     => 'required|integer|min:1',
            'status'      => 'required|in:active,inactive',
        ]);
        // Auto-generate slug
        $validated['slug'] = Str::slug($validated['name']);

        Clazz::create($validated);

        return redirect()->route('admin.classes.index')->with('success', 'Class created successfully');
    }

    /**
     * Show the form for editing the specified class.
     */
    public function edit(Clazz $class)
    {
        $boards = Board::select('id', 'name')->get();

        return Inertia::render('Admin/Clazz/edit', [
            'clazz'  => $class,
            'boards' => $boards,
        ]);
    }

    /**
     * Update the specified class in storage.
     */
    public function update(Request $request, Clazz $class)
    {
        $validated = $request->validate([
            'board_id'    => 'required|exists:boards,id',
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'ordinal'     => 'required|integer|min:1',
            'status'      => 'required|in:active,inactive',
        ]);
        $class->update($validated);
        return redirect()->route('admin.classes.index')->with('success', 'Class updated successfully');
    }

    /**
     * Remove the specified class from storage.
     */
    public function destroy(Clazz $class)
    {
        $class->delete();

        return back()->with('success', 'Class deleted successfully');
    }
}
// Route::resource('clazzes', ClazzController::class);
