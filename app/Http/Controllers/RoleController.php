<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Illuminate\Validation\Rule;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render("roles/index", [
            "roles" => Role::with('permissions')->get()
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        abort(403, 'You are not allowed to create roles.');
        // return Inertia::render("roles/create", [
        //     "permissions" => Permission::pluck('name')
        // ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        abort(403, 'You are not allowed to create roles.');

        $validated = $request->validate([
            'name'          => 'required|string|max:50|unique:roles,name', // ✅ must not exist
            'permissions'   => 'required|array|min:1',
            'permissions.*' => 'string|max:100',
        ]);

        // Create the role only once
        $role = Role::create([
            'name' => $validated['name'],
        ]);

        // Assign permissions
        $role->syncPermissions($validated['permissions']);

        return redirect()->route('roles.index')->with('success', 'Role added successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $role = Role::with('permissions')->findOrFail($id);
        $permissions = Permission::pluck('name');

        return Inertia::render('roles/edit', [
            'role' => $role,
            'permissions' => $permissions
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $role = Role::findOrFail($id);

        $validated = $request->validate([
            // 'name'          => ['required', 'string', 'max:50', Rule::unique('roles', 'name')->ignore($role->id)],
            'permissions'   => 'required|array|min:1',
            'permissions.*' => 'string|max:100',
        ]);

        // $role->update([
        //     'name' => $validated['name'],
        // ]);

        $role->syncPermissions($validated['permissions']);

        return redirect()->route('roles.index')->with('success', 'Role updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $role = Role::findOrFail($id);
        $role->delete();
        return redirect()->route('roles.index')->with('success', 'Role deleted successfully.');
    }
}
