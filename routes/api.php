<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\FriendshipController;

Route::post('login', [AuthController::class, 'login']);
Route::post('register', [AuthController::class, 'register']);


Route::middleware('auth:api')->group(function () {

    // Auth user actions
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    
    // Users
    Route::apiResource('users', UserController::class);

    // Profile
    // Route::apiResource('profiles', ProfileController::class)->only(['show', 'update']);

    // Posts
    Route::apiResource('posts', PostController::class);
    Route::post('/posts/{post}/privacy', [PostController::class, 'changePrivacy']);
    
    // Comments inside posts
    Route::apiResource('posts.comments', CommentController::class)
        ->shallow()
        ->only(['index', 'store', 'update', 'destroy']);
    
    Route::get('/posts/{post}/comments/parents', [CommentController::class, 'parentComments']);

    // Replies inside comments
    Route::get('comments/{comment}/replies', [CommentController::class, 'replies']);

    // Likes
    Route::post('likes', [LikeController::class, 'toggle']);

    // Friendships (Follow/Unfollow)
    // Route::post('/follow/{user}', [FriendshipController::class, 'follow']);
    // Route::delete('/unfollow/{user}', [FriendshipController::class, 'unfollow']);
    // Route::get('/friends', [FriendshipController::class, 'index']);
});

