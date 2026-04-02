<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Follow;
use Illuminate\Http\Request;

class FollowController extends Controller
{
    public function toggle(Request $request, User $user)
    {
        $me = $request->user();

        if ($me->id === $user->id) {
            return response()->json(['message' => 'Cannot follow yourself'], 422);
        }

        $existing = Follow::where('follower_id', $me->id)
            ->where('followed_id', $user->id)
            ->first();

        if ($existing) {
            $existing->delete();
            return response()->json(['following' => false]);
        } else {
            Follow::create(['follower_id' => $me->id, 'followed_id' => $user->id]);
            return response()->json(['following' => true]);
        }
    }
}
