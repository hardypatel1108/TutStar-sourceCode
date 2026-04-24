<?php

namespace App\Http\Middleware;

use App\Models\Board;
use App\Models\Clazz;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'csrf_token' => csrf_token(),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => fn() => $request->user()
                    ? $request->user()->loadMissing(
                        'studentProfile:id,user_id,board_id,class_id'
                    )
                    : null,
                'permissions' => fn() => $request->user() ? $request->user()->getAllPermissions()->pluck("name") : [],
                'roles' => fn() => $request->user() ? $request->user()->getRoleNames() : [],
            ],
            'studentMeta' => fn() => ($request->user() && $request->user()->studentProfile)
                ? [
                    'boards' => Board::query()->select('id', 'name')->orderBy('name')->get(),
                    'classes' => Clazz::query()->select('id', 'name', 'board_id')->orderBy('ordinal')->orderBy('name')->get(),
                ]
                : null,
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
