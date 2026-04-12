<?php
namespace App\Http\Controllers;


use App\Models\Post;
use App\Models\Comment;
use App\Models\User;
use App\Jobs\ToggleLikeJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;
use App\Http\Requests\ToggleLikesRequest;

class LikeController extends Controller
{
    public function toggle(ToggleLikesRequest $request)
    {
        

        $data = $request->validated();
        $userId = auth()->id();

        $likeableId = $data['likeable_id'];
        $likeableType = $data['likeable_type'];
        
        // Identify target
        $likeable = $likeableType === 'post'
            ? Post::findOrFail($likeableId)
            : Comment::findOrFail($likeableId);

        $type = get_class($likeable);

        // Check if user already liked
        $existingLike = \App\Models\Like::where([
            'user_id' => $userId,
            'likeable_id' => $likeableId,
            'likeable_type' => $type,
        ])->first();

        if ($existingLike) {
            // Unlike
            $existingLike->delete();
            $likeable->decrement('likes_count');
            $liked = false;
        } else {
            // Like
            \App\Models\Like::create([
                'user_id' => $userId,
                'likeable_id' => $likeableId,
                'likeable_type' => $type,
            ]);
            $likeable->increment('likes_count');
            $liked = true;
        }
        
        return response()->json([
            'liked' => $liked,
            'likes_count' => $likeable->fresh()->likes_count,
        ]);
    }

    public function likers(Request $request, string $type, int $id)
    {
        // Validate type
        if (!in_array($type, ['post', 'comment'])) {
            return response()->json(['error' => 'Invalid likeable type'], 422);
        }

        $model = $type === 'post' ? Post::findOrFail($id) : Comment::findOrFail($id);
        $userIds = $model->likes()->pluck('user_id')->toArray();

        if (empty($userIds)) {
            return response()->json(['data' => []]);
        }

        $users = User::whereIn('id', $userIds)
            ->get(['id', 'first_name', 'last_name', 'avatar'])
            ->map(fn($u) => [
                'id'     => $u->id,
                'name'   => trim("{$u->first_name} {$u->last_name}"),
                'avatar' => $u->avatar,
            ]);

        return response()->json(['data' => $users]);
    }
}
