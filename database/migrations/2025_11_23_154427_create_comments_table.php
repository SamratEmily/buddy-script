<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateCommentsTable extends Migration
{
    public function up()
    {
        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('parent_id')->nullable()->index(); // threaded comments
            $table->unsignedBigInteger('likes_count')->default(0);
            $table->text('body');
            $table->timestamps();

            // optional self FK for parent (not required but helpful)
            $table->foreign('parent_id')->references('id')->on('comments')->nullOnDelete();
            
               // important for pagination
            $table->index(['post_id', 'id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('comments');
    }
}
