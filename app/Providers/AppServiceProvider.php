<?php

declare(strict_types=1);

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Sleep;
use Illuminate\Validation\Rules\Password;
use Override;

final class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    #[Override]
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // 1. Configurações de Senha Padrão
        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );

        // 2. Modelo Estrito (Previne Lazy Loading, impede descartar atributos e atributos inexistentes)
        Model::shouldBeStrict(! app()->isProduction());

        // 3. Datas Imutáveis por padrão (CarbonImmutable)
        Date::use(CarbonImmutable::class);

        // 4. Segurança de Produção
        if (app()->isProduction()) {
            URL::forceScheme('https');
            DB::prohibitDestructiveCommands();
        }

        // 5. Configurações Globais de Testes
        if (app()->runningUnitTests()) {
            Http::preventStrayRequests();
            Sleep::fake();
        }
    }
}
