<?php

namespace App\Jobs;

use App\Models\Like;
use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class ToggleLikeJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $likeable;
    protected $userId;
    protected $liked;

    public function __construct($likeable, $userId, $liked)
    {
        $this->likeable = $likeable;
        $this->userId = $userId;
        $this->liked = $liked;
    }

    public function handle()
    {
        $type = get_class($this->likeable);

        if ($this->liked) {
            // Like
            Like::firstOrCreate([
                'user_id' => $this->userId,
                'likeable_id' => $this->likeable->id,
                'likeable_type' => $type,
            ]);
            $this->likeable->increment('likes_count');
        } else {
            // Unlike
            Like::where([
                'user_id' => $this->userId,
                'likeable_id' => $this->likeable->id,
                'likeable_type' => $type,
            ])->delete();
            $this->likeable->decrement('likes_count');
        }
    }
}
