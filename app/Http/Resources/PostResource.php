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
            )->map(fn($img) => $img ? asset("storage/$img") : null)->filter()->values(),

            'author' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ],
            'likes_count' => $this->likes()->count(),
            'liked' => $this->likes()->where('user_id', auth()->id())->exists(),
            'comments_count' => $this->comments()->count(),
            'created_at' => $this->created_at->diffForHumans(),
            'is_public' => $this->is_public,
            'comments' => CommentResource::collection($this->whenLoaded('comments')),
        ];
    }
}
