<?php
namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'content' => $this->body,
            'image_url' => collect(
                is_array($this->image_path)
                ? $this->image_path
                : json_decode($this->image_path, true) ?? [$this->image_path]
            )->map(fn($img) => $img ? \Illuminate\Support\Facades\Storage::url($img) : null)->filter()->values(),

            'author' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ],
            'likes_count' => (int) $this->likes_count,
            'liked' => auth()->check() ? $this->likes->contains('user_id', auth()->id()) : false,
            'comments_count' => (int) $this->comments_count,
            'created_at' => $this->created_at->diffForHumans(),
            'is_public' => $this->is_public,
        ];
    }
}
