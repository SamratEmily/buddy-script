<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class UserControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_returns_paginated_users()
    {
        User::factory()->count(3)->create();

        $response = $this->withoutMiddleware()->getJson('/api/users');

        $response->assertStatus(200)
            ->assertJsonStructure(['data', 'links', 'meta']);
    }

    public function test_store_creates_user()
    {
        $payload = [
            'username' => 'jdoe',
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'jdoe@example.com',
            'password' => 'secret123',
        ];

        $response = $this->withoutMiddleware()->postJson('/api/users', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.email', 'jdoe@example.com');

        $this->assertDatabaseHas('users', ['email' => 'jdoe@example.com']);
    }

    public function test_show_returns_user()
    {
        $user = User::factory()->create();

        $response = $this->withoutMiddleware()->getJson('/api/users/' . $user->id);

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $user->id);
    }

    public function test_update_modifies_user()
    {
        $user = User::factory()->create(['first_name' => 'Old']);

        $payload = ['first_name' => 'New'];

        $response = $this->withoutMiddleware()->putJson('/api/users/' . $user->id, $payload);

        $response->assertStatus(200)
            ->assertJsonPath('data.first_name', 'New');

        $this->assertDatabaseHas('users', ['id' => $user->id, 'first_name' => 'New']);
    }

    public function test_destroy_soft_deletes_user()
    {
        $user = User::factory()->create();

        $response = $this->withoutMiddleware()->deleteJson('/api/users/' . $user->id);

        $response->assertStatus(204);

        $this->assertSoftDeleted('users', ['id' => $user->id]);
    }
}
