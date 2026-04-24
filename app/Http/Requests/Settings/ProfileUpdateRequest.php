<?php

namespace App\Http\Requests\Settings;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // 'name' => ['required', 'string', 'max:255'],

            // 'email' => [
            //     'required',
            //     'string',
            //     'lowercase',
            //     'email',
            //     'max:255',
            //     Rule::unique(User::class)->ignore($this->user()->id),
            // ],
            // User table
            'email' => ['sometimes', 'required', 'email', 'max:255', 'unique:users,email,' . $this->user()->id],
            'phone' => ['sometimes', 'required', 'string', 'max:20', 'unique:users,phone,' . $this->user()->id],
            'profile_image' => ['nullable', 'image', 'max:2048'],

            // Student table
            'board_id' => ['nullable', 'exists:boards,id'],
            'class_id' => ['nullable', 'exists:classes,id'],
            'school' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:100'],
            'state' => ['nullable', 'string', 'max:100'],
        ];
    }
}
