<?php
namespace App\Http\Controllers;


use App\Models\Post;
use App\Models\Comment;
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

        $type = $likeable::class;

        // Redis keys
        $likesSetKey = "{$likeableType}:{$likeable->id}:liked_users";
        $likesCountKey = "{$likeableType}:{$likeable->id}:likes_count";

        // Ensure counter is initialized in Redis
        Redis::setnx($likesCountKey, $likeable->likes_count);

        // Check if user already liked (O(1) Redis set)
        $alreadyLiked = Redis::sismember($likesSetKey, $userId);

        if ($alreadyLiked) {
            // Unlike
            Redis::srem($likesSetKey, $userId);   // remove user from set
            Redis::decr($likesCountKey);          // decrement counter
            ToggleLikeJob::dispatchAfterResponse($likeable, $userId, false); // DB update
            $liked = false;

        } else {
            // Like
            Redis::sadd($likesSetKey, $userId);   // add user to set
            Redis::incr($likesCountKey);          // increment counter
            ToggleLikeJob::dispatchAfterResponse($likeable, $userId, true); // DB update
            $liked = true;
        }
        
        return response()->json([
            'liked' => $liked,
            'likes_count' => Redis::get($likesCountKey),
        ]);
    }
}
