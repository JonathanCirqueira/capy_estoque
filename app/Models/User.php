<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\AssinaturaOrigem;
use App\Enums\AssinaturaStatus;
use App\Enums\UserRole;
use App\Enums\UserStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property \Illuminate\Support\Carbon|null $email_verified_at
 * @property string $password
 * @property UserRole $role
 * @property UserStatus $status
 * @property string|null $convite_token
 * @property \Illuminate\Support\Carbon|null $convite_expira_em
 * @property int|null $plano_id
 * @property AssinaturaStatus|null $assinatura_status
 * @property AssinaturaOrigem|null $assinatura_origem
 * @property \Illuminate\Support\Carbon|null $data_inicio
 * @property \Illuminate\Support\Carbon|null $data_vencimento
 * @property bool $cancel_at_period_end
 * @property string|null $stripe_customer_id
 * @property string|null $stripe_subscription_id
 * @property string|null $stripe_price_id
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property \Illuminate\Support\Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property \Illuminate\Support\Carbon|null $ultimo_login_em
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */
final class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory;

    use Notifiable;
    use TwoFactorAuthenticatable;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'status',
        'convite_token',
        'convite_expira_em',
        'plano_id',
        'assinatura_status',
        'assinatura_origem',
        'data_inicio',
        'data_vencimento',
        'cancel_at_period_end',
        'stripe_customer_id',
        'stripe_subscription_id',
        'stripe_price_id',
    ];

    /**
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
        'convite_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string|class-string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'ultimo_login_em' => 'datetime',
            'role' => UserRole::class,
            'status' => UserStatus::class,
            'convite_expira_em' => 'datetime',
            'assinatura_status' => AssinaturaStatus::class,
            'assinatura_origem' => AssinaturaOrigem::class,
            'data_inicio' => 'date',
            'data_vencimento' => 'date',
            'cancel_at_period_end' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<Plano, $this>
     */
    public function plano(): BelongsTo
    {
        return $this->belongsTo(Plano::class);
    }

    /**
     * @return HasMany<LogAcesso, $this>
     */
    public function logsAcesso(): HasMany
    {
        return $this->hasMany(LogAcesso::class);
    }
}
