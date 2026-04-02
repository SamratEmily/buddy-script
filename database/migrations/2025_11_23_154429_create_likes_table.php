<?php
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration {
    public function up() {
        Schema::create('likes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // Polymorphic fields
            $table->unsignedBigInteger('likeable_id');
            $table->string('likeable_type');

            $table->foreignId('like_type_id')->nullable()->constrained('like_types')->cascadeOnDelete(); // reference to like_types

            $table->timestamps();
            
        
            $table->index(['likeable_type', 'likeable_id']); 
            $table->index('like_type_id'); 

            $table->unique(['user_id', 'likeable_id', 'likeable_type', 'like_type_id'], 'user_like_unique');
        });
    }

    public function down() {
        Schema::dropIfExists('likes');
    }
};
