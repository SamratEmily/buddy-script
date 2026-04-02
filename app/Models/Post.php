<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Post extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'body', 'image_path', 'is_public', 'likes_count', 'comments_count'];

    // owner
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // comments for this post
    public function comments()
    {
        return $this->hasMany(Comment::class)->latest();
    }

    // polymorphic likes
    public function likes()
    {
        return $this->morphMany(Like::class, 'likeable');
    }

    // convenience: check if a given user liked this post
    public function isLikedBy($user)
    {
        return $this->likes()->where('user_id', $user->id)->exists();
    }
}
