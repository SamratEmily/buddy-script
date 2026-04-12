<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $faker = app(\Faker\Generator::class);
        return [
            'uuid' => (string) \Illuminate\Support\Str::uuid(),
            'first_name' => $faker->firstName(),
            'last_name' => $faker->lastName(),
            'email' => $faker->unique()->safeEmail(),
            'password' => static::$password ??= Hash::make('password'),
            'avatar' => null,
            'cover_photo' => null,
            'bio' => $faker->optional()->sentence(),
            'is_verified' => $faker->boolean(20),
            'last_seen' => now(),
            'remember_token' => Str::random(10),
        ];
    }
}
