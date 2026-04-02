<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class JwtAuthFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_login_me_and_logout_flow()
    {
        $payload = [
            'first_name' => 'Test',
            'last_name' => 'User',
            'username' => 'testuser',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        // Register
        $register = $this->postJson('/api/register', [
            'first_name' => $payload['first_name'],
            'last_name' => $payload['last_name'],
            'username' => $payload['username'],
            'email' => $payload['email'],
            'password' => $payload['password'],
            'confirm' => $payload['password'],
        ]);

        $register->assertStatus(201);
        $data = $register->json();
        $this->assertArrayHasKey('token', $data);
        $this->assertArrayHasKey('user', $data);

        $token = $data['token'];

        // Get /api/me
        $me = $this->withHeaders(['Authorization' => "Bearer $token"])->getJson('/api/me');
        $me->assertStatus(200);
        $me->assertJsonFragment(['email' => $payload['email']]);

        // Logout
        $logout = $this->withHeaders(['Authorization' => "Bearer $token"])->postJson('/api/logout');
        $logout->assertStatus(204);

        // After logout token should be invalid
        $me2 = $this->withHeaders(['Authorization' => "Bearer $token"])->getJson('/api/me');
        $me2->assertStatus(401);
    }
}
