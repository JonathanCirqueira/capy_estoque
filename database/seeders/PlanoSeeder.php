<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\PlanoCiclo;
use App\Models\Plano;
use Illuminate\Database\Seeder;

final class PlanoSeeder extends Seeder
{
    public function run(): void
    {
        $planos = [
            [
                'nome' => 'Básico',
                'ciclo' => PlanoCiclo::Mensal,
                'preco_centavos' => 4990,
                'stripe_price_id' => null,
            ],
            [
                'nome' => 'Básico',
                'ciclo' => PlanoCiclo::Anual,
                'preco_centavos' => 47900,
                'stripe_price_id' => null,
            ],
            [
                'nome' => 'Pro',
                'ciclo' => PlanoCiclo::Mensal,
                'preco_centavos' => 9990,
                'stripe_price_id' => null,
            ],
            [
                'nome' => 'Pro',
                'ciclo' => PlanoCiclo::Anual,
                'preco_centavos' => 95900,
                'stripe_price_id' => null,
            ],
        ];

        foreach ($planos as $plano) {
            Plano::firstOrCreate(
                ['nome' => $plano['nome'], 'ciclo' => $plano['ciclo']],
                $plano
            );
        }
    }
}
