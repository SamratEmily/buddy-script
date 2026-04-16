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

        $likeable = $likeableType === 'post'
            ? Post::findOrFail($likeableId)
            : Comment::findOrFail($likeableId);

        $type = $likeableType; // simplified type for redis key
        $redisKey = "user:{$userId}:liked:{$type}:{$likeableId}";
        $countKey = "likes_count:{$type}:{$likeableId}";

        try {
            $isLiked = Redis::get($redisKey);

            if ($isLiked === null) {
                // Fallback to DB check if not in Redis
                $isLiked = $likeable->likes()->where('user_id', $userId)->exists();
                Redis::set($redisKey, $isLiked ? 1 : 0, 'EX', 3600);
            }

            if ($isLiked) {
                // Unlike logic
                Redis::set($redisKey, 0, 'EX', 3600);
                $newCount = Redis::decr($countKey);
                if ($newCount < 0) {
                     $newCount = max(0, $likeable->likes_count - 1);
                     Redis::set($countKey, $newCount);
                }
                $liked = false;
            } else {
                // Like logic
                Redis::set($redisKey, 1, 'EX', 3600);
                $newCount = Redis::incr($countKey);
                $liked = true;
            }

            // Sync with DB in background
            ToggleLikeJob::dispatch($likeable, $userId, $liked);

            return response()->json([
                'liked' => $liked,
                'likes_count' => (int) $newCount,
                'source' => 'cache'
            ]);

        } catch (\Exception $e) {
            // Redis failure fallback: Purely DB logic
            $existingLike = \App\Models\Like::where([
                'user_id' => $userId,
                'likeable_id' => $likeableId,
                'likeable_type' => get_class($likeable),
            ])->first();

            if ($existingLike) {
                $existingLike->delete();
                $likeable->decrement('likes_count');
                $liked = false;
            } else {
                \App\Models\Like::create([
                    'user_id' => $userId,
                    'likeable_id' => $likeableId,
                    'likeable_type' => get_class($likeable),
                ]);
                $likeable->increment('likes_count');
                $liked = true;
            }

            return response()->json([
                'liked' => $liked,
                'likes_count' => $likeable->fresh()->likes_count,
                'source' => 'database'
            ]);
        }
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
