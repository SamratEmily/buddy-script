<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;

class UserController extends Controller
{
	public function index(Request $request)
	{
		$perPage = (int) $request->query('per_page', 15);
		return UserResource::collection(User::paginate($perPage));
	}

	public function show(User $user)
	{
		return new UserResource($user);
	}

	public function store(StoreUserRequest $request)
	{
		$data = $request->validated();

		$user = new User();
		// $user->username = $data['username'];
		$user->first_name = $data['first_name'];
		$user->last_name = $data['last_name'];
		$user->email = $data['email'];
		$user->password = Hash::make($data['password']);
		$user->bio = $data['bio'] ?? null;
		$user->save();

		return (new UserResource($user))->response()->setStatusCode(201);
	}

	public function update(UpdateUserRequest $request, User $user)
	{
		$data = $request->validated();

		foreach (['username','first_name','last_name','email','bio'] as $field) {
			if (array_key_exists($field, $data)) {
				$user->{$field} = $data[$field];
			}
		}

		if (!empty($data['password'])) {
			$user->password = Hash::make($data['password']);
		}

		$user->save();

		return new UserResource($user);
	}

	public function destroy(User $user)
	{
		$user->delete();
		return response()->noContent();
	}
}

