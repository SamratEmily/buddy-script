<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePostsTable extends Migration
{
    public function up()
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('body')->nullable();
            $table->string('image_path')->nullable(); // optional image
            $table->boolean('is_public')->default(true);
            $table->unsignedBigInteger('likes_count')->default(0);
            $table->unsignedBigInteger('comments_count')->default(0);
            $table->timestamps();

            $table->index('user_id');        //  filter posts by user
            $table->index('is_public');      // for public feed
            $table->index('created_at');     // for latest/oldest sort (pagination)
        });
    }

    public function down()
    {
        Schema::dropIfExists('posts');
    }
}
