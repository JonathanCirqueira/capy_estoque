<?php

declare(strict_types=1);

namespace App\Enums;

enum AssinaturaOrigem: string
{
    case Manual = 'manual';
    case Stripe = 'stripe';

    public function label(): string
    {
        return match ($this) {
            self::Manual => 'Manual (PIX/Direto)',
            self::Stripe => 'Stripe',
        };
    }
}
