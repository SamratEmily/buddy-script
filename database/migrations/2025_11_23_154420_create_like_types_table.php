<?php
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration {
    public function up() {
        Schema::create('like_types', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // like, love, haha, wow, sad, angry
            $table->string('icon_path')->nullable(); // optional SVG path or icon name
            $table->timestamps();
        });
    }

    public function down() {
        Schema::dropIfExists('like_types');
    }
};
