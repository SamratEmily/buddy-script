<?php

namespace Database\Factories;

use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PostFactory extends Factory
{
    protected $model = Post::class;

    public function definition(): array
    {
        $bodies = [
            "Just had an amazing day! #blessed",
            "Does anyone else love the new update?",
            "Thinking about starting a new project today. Any ideas?",
            "What a beautiful morning for a walk!",
            "Laravel Cloud is actually pretty cool to work with.",
            "Can someone explain how deep seek works? #AI",
            "This is my first post on BuddyScript!",
            "I'm feeling very productive today.",
            "Coffee and code: my happy place.",
            "Learning React has been a journey, but it's worth it."
        ];

        return [
            'user_id' => User::factory(),
            'body' => $bodies[array_rand($bodies)],
            'image_path' => null,
            'is_public' => true,
            'likes_count' => 0,
            'comments_count' => 0,
            'created_at' => now()->subDays(rand(1, 30)),
            'updated_at' => now(),
        ];
    }
}
