<?php

namespace Database\Factories;

use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CommentFactory extends Factory
{
    protected $model = Comment::class;

    public function definition(): array
    {
        $comments = [
            "Great post! Thanks for sharing.",
            "I totally agree with this.",
            "Wow, interesting perspective.",
            "Could you tell me more about this?",
            "Haha, so true!",
            "Nice one!",
            "I'm not so sure about that, but okay.",
            "Perfectly said.",
            "Indeed!",
            "Bookmarking this for later."
        ];

        return [
            'post_id' => Post::factory(),
            'user_id' => User::factory(),
            'body' => $comments[array_rand($comments)],
            'parent_id' => null,
            'likes_count' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
