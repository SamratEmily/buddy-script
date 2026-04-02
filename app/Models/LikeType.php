<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LikeType extends Model
{
    protected $fillable = ['name', 'icon_path'];

    public function likes()
    {
        return $this->hasMany(Like::class);
    }
}
