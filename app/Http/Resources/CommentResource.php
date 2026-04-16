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
            )->map(fn($img) => $img ? asset("storage/$img") : null)->filter()->values(),
            'parent_id' => $this->parent_id,
            'author'  => [
                'id'   => $this->user->id,
                'name' => $this->user->name,
            ],
            'created_at' => $this->created_at->diffForHumans(),
            'likes_count' => (int) (function() {
                try {
                    return \Illuminate\Support\Facades\Redis::get("likes_count:comment:{$this->id}") ?? $this->likes_count;
                } catch (\Exception $e) {
                    return $this->likes_count;
                }
            })(),
            'liked' => auth()->check() ? (function() {
                try {
                    $cached = \Illuminate\Support\Facades\Redis::get("user:".auth()->id().":liked:comment:{$this->id}");
                    if ($cached !== null) return (bool) $cached;
                } catch (\Exception $e) {}
                return $this->likes()->where('user_id', auth()->id())->exists();
            })() : false,
            
        ];
    }
}
