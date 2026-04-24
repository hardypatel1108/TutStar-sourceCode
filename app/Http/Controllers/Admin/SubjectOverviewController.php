<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use App\Models\SubjectOverview;
use Illuminate\Http\Request;

class SubjectOverviewController extends Controller
{
    public function index()
    {
        return inertia('Admin/SubjectOverviews/Index', [
            'overviews' => SubjectOverview::with('subject')->latest()->get(),
        ]);
    }

    public function create(Subject $subject)
    {
        $subject->load(['overviews.points']);

        return inertia('Admin/SubjectOverviews/Create', [
            'subject' => $subject,
            'existingOverviews' => $subject->overviews->map(fn($o) => [
                'id' => $o->id,
                'title' => $o->title,
                'pointer_type' => $o->pointer_type,
                'points' => $o->points->map(fn($p) => [
                    'id' => $p->id,
                    'content' => $p->content,
                ])->values(),
            ])->values(), // ✅ ENSURE ARRAY
            'pointerTypes' => [
                ['id' => 'bullet', 'name' => 'Bullet Points (●)'],
                ['id' => 'check', 'name' => 'Check Points (✔)'],
            ],
        ]);

        // return inertia('Admin/SubjectOverviews/Create', [
        //      'subject' => $subject,
        //     'pointerTypes' => [
        //         ['id' => 'bullet', 'name' => 'Bullet Points (●)'],
        //         ['id' => 'check', 'name' => 'Check Points (✔)'],
        //     ],
        // ]);
    }

    public function store(Request $request, Subject $subject)
    {
        $data = $request->validate([
            'overviews' => 'required|array|min:1|max:3',
            'overviews.*.id' => 'nullable|exists:subject_overviews,id',
            'overviews.*.title' => 'required|string|max:255',
            'overviews.*.pointer_type' => 'required|in:bullet,check',
            'overviews.*.points' => 'required|array|min:1',
            'overviews.*.points.*.id' => 'nullable|exists:subject_overview_points,id',
            'overviews.*.points.*.content' => 'required|string',
        ]);

        $keptOverviewIds = [];

        foreach ($data['overviews'] as $oIndex => $overviewData) {
            $overview = SubjectOverview::updateOrCreate(
                [
                    'id' => $overviewData['id'] ?? null,
                ],
                [
                    'subject_id' => $subject->id,
                    'title' => $overviewData['title'],
                    'pointer_type' => $overviewData['pointer_type'],
                    'sort_order' => $oIndex + 1,
                ]
            );

            $keptOverviewIds[] = $overview->id;

            $keptPointIds = [];

            foreach ($overviewData['points'] as $pIndex => $pointData) {
                $point = $overview->points()->updateOrCreate(
                    [
                        'id' => $pointData['id'] ?? null,
                    ],
                    [
                        'content' => $pointData['content'],
                        'sort_order' => $pIndex + 1,
                    ]
                );

                $keptPointIds[] = $point->id;
            }

            // delete removed points
            $overview->points()
                ->whereNotIn('id', $keptPointIds)
                ->delete();
        }

        // delete removed overviews
        SubjectOverview::where('subject_id', $subject->id)
            ->whereNotIn('id', $keptOverviewIds)
            ->delete();

        return redirect()
            ->route('admin.subjects.index')
            ->with('success', 'Overviews synchronized successfully');
    }

    public function edit(SubjectOverview $subjectOverview)
    {
        $subjectOverview->load('points');

        return inertia('Admin/SubjectOverviews/Edit', [
            'overview' => $subjectOverview,
            'subjects' => Subject::select('id', 'name')->get(),
            'pointerTypes' => [
                ['id' => 'bullet', 'name' => 'Bullet Points (●)'],
                ['id' => 'check', 'name' => 'Check Points (✔)'],
            ],
        ]);
    }

    public function update(Request $request, SubjectOverview $subjectOverview)
    {
        $data = $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'title' => 'required|string|max:255',
            'pointer_type' => 'required|in:bullet,check',
            'points' => 'required|array|min:1',
            'points.*' => 'required|string',
        ]);

        $subjectOverview->update($data);

        // reset points
        $subjectOverview->points()->delete();

        foreach ($data['points'] as $i => $point) {
            $subjectOverview->points()->create([
                'content' => $point,
                'sort_order' => $i + 1,
            ]);
        }

        return back()->with('success', 'Overview updated');
    }

    public function destroy(SubjectOverview $subjectOverview)
    {
        $subjectOverview->delete();

        return back()->with('success', 'Overview deleted');
    }
}


// <ul>
//   {overview.points.map(p => (
//     <li key={p.id} className="flex gap-2">
//       {overview.pointer_type === 'check' ? '✔' : '●'}
//       {p.content}
//     </li>
//   ))}
// </ul>