<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Like extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'likeable_id',
        'likeable_type',
        'like_type_id',
    ];

    public function likeable()
    {
        return $this->morphTo();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function type()
    {
        return $this->belongsTo(LikeType::class, 'like_type_id');
    }
    
    // Map type IDs to model classes
    const LIKEABLE_TYPES = [
        1 => Post::class,
        2 => Comment::class,
    ];

    // Helper to get model class from ID
    public static function getLikeableModel(int $id): ?string
    {
        return self::LIKEABLE_TYPES[$id] ?? null;
    }
}


