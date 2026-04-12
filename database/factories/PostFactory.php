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
        return [
            'user_id' => User::factory(),
            'body' => $this->faker->paragraphs(2, true),
            'image_path' => null,
            'is_public' => true,
            'likes_count' => 0,
            'comments_count' => 0,
            'created_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'updated_at' => now(),
        ];
    }
}
