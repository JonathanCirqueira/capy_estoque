<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\PlanoCiclo;
use App\Models\Plano;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Plano>
 */
final class PlanoFactory extends Factory
{
    protected $model = Plano::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nome' => fake()->randomElement(['Básico', 'Pro']),
            'ciclo' => fake()->randomElement(PlanoCiclo::cases()),
            'preco_centavos' => fake()->numberBetween(2900, 99000),
            'stripe_price_id' => 'price_'.fake()->regexify('[A-Za-z0-9]{24}'),
        ];
    }
}
