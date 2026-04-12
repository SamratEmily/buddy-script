<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Post;
use App\Models\Comment;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class DemoSeeder extends Seeder
{
    public function run()
    {
        // Clean up existing data except the main user
        echo "Cleaning up old demo data...\n";
        
        // Delete in order to respect Foreign Key constraints (Children first)
        \App\Models\Like::query()->delete();
        Comment::query()->delete();
        Post::query()->delete();
        User::query()->where('email', '!=', 'nayakemily50@gmail.com')->delete();

        // 1. Create or get the main user
        $mainUser = User::firstOrCreate(
            ['email' => 'nayakemily50@gmail.com'],
            [
                'first_name' => 'Nayak',
                'last_name' => 'Emily',
                'password' => Hash::make('nayakemily50@gmail.com'),
                'uuid' => (string) \Illuminate\Support\Str::uuid(),
            ]
        );

        echo "Generating 1000 demo users...\n";
        $users = User::factory()->count(1000)->create();
        $allUsers = $users->concat([$mainUser]);

        echo "Generating 10,000 posts...\n";
        // To speed up, we'll use chunking or just loop
        $posts = Post::factory()
            ->count(10000)
            ->sequence(fn ($seq) => ['user_id' => $allUsers->random()->id])
            ->create();

        echo "Generating comments for some posts...\n";
        // We'll take 500 posts and give them ~20 comments each to reach ~10,000 total comments
        // Or exactly 1,000 comments as requested?
        // Let's do 1,000 total comments distributed across posts
        $sampledPosts = $posts->random(200);

        foreach ($sampledPosts as $post) {
            $numComments = rand(2, 8);
            $comments = Comment::factory()->count($numComments)->create([
                'post_id' => $post->id,
                'user_id' => $allUsers->random()->id,
                'parent_id' => null,
            ]);

            // Add replies to some comments
            foreach ($comments as $comment) {
                if (rand(0, 1)) { // 50% chance to have replies
                    $numReplies = rand(1, 3);
                    Comment::factory()->count($numReplies)->create([
                        'post_id' => $post->id,
                        'user_id' => $allUsers->random()->id,
                        'parent_id' => $comment->id,
                    ]);
                    $numComments += $numReplies;
                }
            }
            
            // Update counter cache
            $post->update(['comments_count' => $numComments]);
        }

        echo "Seeding completed successfully.\n";
    }
}
