<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('role')->default('usuario_padrao')->after('email');
            $table->string('status')->default('pendente')->after('role')->index();
            $table->string('convite_token', 64)->nullable()->unique()->after('status');
            $table->timestamp('convite_expira_em')->nullable()->after('convite_token');
            $table->foreignId('plano_id')->nullable()->after('convite_expira_em')->constrained('planos')->nullOnDelete();
            $table->string('assinatura_status')->nullable()->after('plano_id')->index();
            $table->string('assinatura_origem')->nullable()->after('assinatura_status')->index();
            $table->date('data_inicio')->nullable()->after('assinatura_origem');
            $table->date('data_vencimento')->nullable()->after('data_inicio')->index();
            $table->boolean('cancel_at_period_end')->default(false)->after('data_vencimento');
            $table->string('stripe_customer_id')->nullable()->unique()->after('cancel_at_period_end');
            $table->string('stripe_subscription_id')->nullable()->unique()->after('stripe_customer_id');
            $table->string('stripe_price_id')->nullable()->after('stripe_subscription_id');
            $table->string('password')->nullable()->change();
        });
    }
};
