<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CommentResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'      => $this->id,
            'body' => $this->body,
            'image_url' => collect(
                is_array($this->image_path)
                ? $this->image_path
                : json_decode($this->image_path, true) ?? [$this->image_path]
            )->map(fn($img) => $img ? \Illuminate\Support\Facades\Storage::url($img) : null)->filter()->values(),
            'parent_id' => $this->parent_id,
            'author'  => [
                'id'   => $this->user->id,
                'name' => $this->user->name,
            ],
            'created_at' => $this->created_at->diffForHumans(),
            'likes_count' => (int) $this->likes_count,
            'liked' => auth()->check() ? $this->likes()->where('user_id', auth()->id())->exists() : false,
            
        ];
    }
}
