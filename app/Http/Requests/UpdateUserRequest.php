<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('user'); // works with route model binding

        return [
            'username'      => ['required', 'string', 'max:50', Rule::unique('users', 'username')->ignore($userId)],
            'email'         => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($userId)],
            'password'      => ['nullable', 'string', 'min:6', 'confirmed'],
            'first_name'    => ['required', 'string', 'max:255'],
            'last_name'     => ['nullable', 'string', 'max:255'],
            'bio'           => ['nullable', 'string', 'max:300'],
            'gender'        => ['nullable', 'in:male,female,other'],
            'dob'           => ['nullable', 'date', 'before:today'],
            'profile_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
            'cover_image'   => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:4096'],
        ];
    }
}
