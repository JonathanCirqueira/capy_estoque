<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\PlanoCiclo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class Plano extends Model
{
    /** @use HasFactory<\Database\Factories\PlanoFactory> */
    use HasFactory;

    protected $table = 'planos';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'nome',
        'ciclo',
        'preco_centavos',
        'stripe_price_id',
    ];

    /**
     * @return array<string, string|class-string>
     */
    protected function casts(): array
    {
        return [
            'ciclo' => PlanoCiclo::class,
            'preco_centavos' => 'integer',
        ];
    }

    /**
     * @return HasMany<User, $this>
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
