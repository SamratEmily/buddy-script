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
            'likes_count' => (int) (function() {
                try {
                    return \Illuminate\Support\Facades\Redis::get("likes_count:post:{$this->id}") ?? $this->likes_count;
                } catch (\Exception $e) {
                    return $this->likes_count;
                }
            })(),
            'liked' => auth()->check() ? (function() {
                try {
                    $cached = \Illuminate\Support\Facades\Redis::get("user:".auth()->id().":liked:post:{$this->id}");
                    if ($cached !== null) return (bool) $cached;
                } catch (\Exception $e) {}
                return $this->likes->contains('user_id', auth()->id());
            })() : false,
            'comments_count' => (int) (function() {
                try {
                    return \Illuminate\Support\Facades\Redis::get("comments_count:post:{$this->id}") ?? $this->comments_count;
                } catch (\Exception $e) {
                    return $this->comments_count;
                }
            })(),
            'created_at' => $this->created_at->diffForHumans(),
            'is_public' => $this->is_public,
        ];
    }
}
