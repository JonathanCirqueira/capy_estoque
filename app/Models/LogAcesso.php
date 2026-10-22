<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property string|null $ip
 * @property string|null $user_agent
 * @property \Illuminate\Support\Carbon $login_em
 * @property-read User $user
 */
final class LogAcesso extends Model
{
    /** @use HasFactory<\Database\Factories\LogAcessoFactory> */
    use HasFactory;

    /**
     * @var bool
     */
    public $timestamps = false;

    /**
     * @var string
     */
    protected $table = 'logs_acesso';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'ip',
        'user_agent',
        'login_em',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'login_em' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
