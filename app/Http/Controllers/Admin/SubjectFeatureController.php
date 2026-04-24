<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use App\Models\SubjectFeature;
use Illuminate\Http\Request;

class SubjectFeatureController extends Controller
{
    public function create(Subject $subject)
    {
        $subject->load('features');

        return inertia('Admin/SubjectFeatures/Create', [
            'subject' => $subject,
            'existingFeatures' => $subject->features->map(fn($f) => [
                'id' => $f->id,
                'title' => $f->title,
                'description' => $f->description,
            ])->values(),
        ]);
    }

    public function store(Request $request, Subject $subject)
    {
        $data = $request->validate([
            'features' => 'required|array|min:1',
            'features.*.id' => 'nullable|exists:subject_features,id',
            'features.*.title' => 'required|string|max:255',
            'features.*.description' => 'required|string',
        ]);

        $incomingIds = collect($data['features'])
            ->pluck('id')
            ->filter()
            ->values();

        // 🔴 DELETE REMOVED FEATURES
        $subject->features()
            ->whereNotIn('id', $incomingIds)
            ->delete();

        // 🟢 CREATE / UPDATE
        foreach ($data['features'] as $index => $feature) {
            SubjectFeature::updateOrCreate(
                [
                    'id' => $feature['id'] ?? null,
                ],
                [
                    'subject_id' => $subject->id,
                    'title' => $feature['title'],
                    'description' => $feature['description'],
                    'sort_order' => $index + 1,
                ]
            );
        }

        return redirect()
            ->route('admin.subjects.index')
            ->with('success', 'Subject features saved successfully');
    }
}


// {subject.features.map(f => (
//     <div key={f.id} className="space-y-1">
//         <h4 className="font-semibold">{f.title}</h4>
//         <p className="text-sm text-gray-600">{f.description}</p>
//     </div>
// ))}