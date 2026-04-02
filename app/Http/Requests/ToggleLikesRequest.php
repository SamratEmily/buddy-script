<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ToggleLikesRequest extends FormRequest
{
    public function authorize()
    {
        return true; // allow authenticated users
    }

    public function rules()
    {
        return [
            'likeable_id' => [
                'required',
                'integer',
                $this->getExistsRule()
            ],
            'likeable_type' => 'required|string|in:post,comment',
        ];
    }

    /**
     * Return exists rule dynamically based on likeable_type.
     */
    private function getExistsRule()
    {
        $type = $this->input('likeable_type');

        if ($type === 'post') {
            return 'exists:posts,id';
        }

        if ($type === 'comment') {
            return 'exists:comments,id';
        }

        return null; // if likeable_type invalid, rules() will fail earlier
    }
}
