<?php

namespace App\Http\Requests;

use App\Enums\ConcernCategoryCode;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreConcernRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Enforced at middleware routing level
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'required|string|min:10|max:10000',
            'category_id' => ['required', 'string', Rule::in(array_column(ConcernCategoryCode::options(), 'value'))],
            'visibility' => ['sometimes', Rule::in(['public', 'private'])],
            'incident_occurred_at' => ['nullable', 'date', 'before_or_equal:now'],
            'lat' => 'required|numeric|between:-90,90',
            'lng' => 'required|numeric|between:-180,180',
            'images' => 'nullable|array|max:4',
            'images.*' => 'image|mimes:jpeg,png,jpg,webp|max:4096',
        ];
    }
}
