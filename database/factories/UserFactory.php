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
        $firstNames = ['John', 'Jane', 'Alex', 'Emma', 'David', 'Sarah', 'Michael', 'Emily', 'Chris', 'Anna', 'Robert', 'Jessica', 'Daniel', 'Laura', 'Kevin', 'Sophia'];
        $lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas'];
        
        $firstName = $firstNames[array_rand($firstNames)];
        $lastName = $lastNames[array_rand($lastNames)];
        
        // Ensure email uniqueness with a large random number and a unique string
        $uniqueId = \Illuminate\Support\Str::random(5);
        $email = strtolower($firstName . '.' . $lastName . '.' . $uniqueId . '.' . rand(10000, 99999) . '@example.com');

        return [
            'uuid' => (string) \Illuminate\Support\Str::uuid(),
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => $email,
            'password' => static::$password ??= Hash::make('password'),
            'avatar' => null,
            'cover_photo' => null,
            'bio' => 'This is a demo biography for ' . $firstName . '.',
            'is_verified' => rand(0, 10) > 8,
            'last_seen' => now(),
            'remember_token' => \Illuminate\Support\Str::random(10),
        ];
    }
}
