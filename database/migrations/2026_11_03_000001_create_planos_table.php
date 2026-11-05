<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('planos', function (Blueprint $table): void {
            $table->id();
            $table->string('nome');
            $table->string('ciclo');
            $table->unsignedInteger('preco_centavos');
            $table->string('stripe_price_id')->nullable()->unique();
            $table->timestamps();
        });
    }
};
