📌 Visão Geral do Módulo Atual
Nome do Módulo: Gestão de Usuários e Assinaturas (usuarios-assinaturas)

Objetivo: Gestão completa de usuários do SaaS com controle de assinaturas recorrentes (Stripe) e manuais (PIX/cortesia), controle de vigência/vencimento e fluxo de convite com definição de senha por e-mail diretamente acoplado à tabela `users` (com chave estrangeira `plano_id` para `planos`).

Entidades Principais: User, Plano.

---

🗄️ Passo 1: Schema, Enums & Banco (passo1-schema-banco)
[x] 1.1. Enums PHP & TypeScript:

- app/Enums/UserRole.php e resources/js/types/enums/user-role.ts (admin, usuario_padrao).
- app/Enums/UserStatus.php e resources/js/types/enums/user-status.ts (pendente, ativo, inativo).
- app/Enums/PlanoCiclo.php e resources/js/types/enums/plano-ciclo.ts (mensal, anual).
- app/Enums/AssinaturaStatus.php e resources/js/types/enums/assinatura-status.ts (active, past_due, canceled, trialing, incomplete).
- app/Enums/AssinaturaOrigem.php e resources/js/types/enums/assinatura-origem.ts (manual, stripe).

[x] 1.2. Migrations:

- Migration de planos: `planos` com `nome`, `ciclo`, `preco_centavos` (unsignedInteger), `stripe_price_id` (apenas método up(), sem down()).
- Migration evolutiva em users: adiciona `role`, `status`, `convite_token`, `convite_expira_em`, `plano_id` (FK `restrictOnDelete()` ou `nullOnDelete()`), `assinatura_status`, `assinatura_origem`, `data_inicio`, `data_vencimento`, `cancel_at_period_end`, `stripe_customer_id`, `stripe_subscription_id`, `stripe_price_id`, e torna `password` nullable (apenas método up(), sem down()).

[x] 1.3. Models & Casts:

- Atualizar app/Models/User.php com $fillable completo, relacionamento `belongsTo(Plano::class)` e `casts(): array` tipados.
- Criar app/Models/Plano.php com $fillable, `hasMany(User::class)` e `casts(): array` tipados.

[x] 1.4. Factories & Seeders:

- database/factories/PlanoFactory.php.
- database/factories/UserFactory.php (atualizado para suportar planos e campos de assinatura).
- database/seeders/PlanoSeeder.php provisionando os 4 planos fixos (Básico Mensal, Básico Anual, Pro Mensal, Pro Anual) com `preco_centavos`.

[x] 1.5. Quality Gate: Code Review de Schema & Banco (php-reviewer):

- Auditar ausência de método down().
- Auditar ausência de cascadeOnDelete() em relacionamentos centrais.
- Auditar uso de `preco_centavos` (inteiro) em vez de decimal/float.
- Auditar uso estrito de PHP 8.2+ Backed Enums.
- Auditar presença do método casts(): array em todas as models.

[x] 1.6. Verificação de Integridade: Executar php artisan migrate, php artisan db:seed --class=PlanoSeeder e composer verify.

[x] 1.7. Commit: feat(database): criar migrations, models, enums e seeders de usuarios e planos.


💻 Implementação dos Arquivos do Passo 1


### 1.1. Enums PHP e TypeScript

#### app/Enums/UserRole.php

```php
<?php

declare(strict_types=1);

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case UsuarioPadrao = 'usuario_padrao';

    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Administrador',
            self::UsuarioPadrao => 'Usuário Padrão',
        };
    }
}
```

#### app/Enums/UserStatus.php

```php
<?php

declare(strict_types=1);

namespace App\Enums;

enum UserStatus: string
{
    case Pendente = 'pendente';
    case Ativo = 'ativo';
    case Inativo = 'inativo';

    public function label(): string
    {
        return match ($this) {
            self::Pendente => 'Pendente',
            self::Ativo => 'Ativo',
            self::Inativo => 'Inativo',
        };
    }
}
```

#### app/Enums/PlanoCiclo.php

```php
<?php

declare(strict_types=1);

namespace App\Enums;

enum PlanoCiclo: string
{
    case Mensal = 'mensal';
    case Anual = 'anual';

    public function label(): string
    {
        return match ($this) {
            self::Mensal => 'Mensal',
            self::Anual => 'Anual',
        };
    }
}
```

#### app/Enums/AssinaturaStatus.php

```php
<?php

declare(strict_types=1);

namespace App\Enums;

enum AssinaturaStatus: string
{
    case Active = 'active';
    case PastDue = 'past_due';
    case Canceled = 'canceled';
    case Trialing = 'trialing';
    case Incomplete = 'incomplete';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'Ativa',
            self::PastDue => 'Em Atraso',
            self::Canceled => 'Cancelada',
            self::Trialing => 'Período de Testes',
            self::Incomplete => 'Incompleta',
        };
    }
}
```

#### app/Enums/AssinaturaOrigem.php

```php
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
```

#### Enums TypeScript (`resources/js/types/enums/`)

```typescript
// resources/js/types/enums/user-role.ts
export const UserRole = {
  Admin: 'admin',
  UsuarioPadrao: 'usuario_padrao',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// resources/js/types/enums/user-status.ts
export const UserStatus = {
  Pendente: 'pendente',
  Ativo: 'ativo',
  Inativo: 'inativo',
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

// resources/js/types/enums/plano-ciclo.ts
export const PlanoCiclo = {
  Mensal: 'mensal',
  Anual: 'anual',
} as const;
export type PlanoCiclo = (typeof PlanoCiclo)[keyof typeof PlanoCiclo];

// resources/js/types/enums/assinatura-status.ts
export const AssinaturaStatus = {
  Active: 'active',
  PastDue: 'past_due',
  Canceled: 'canceled',
  Trialing: 'trialing',
  Incomplete: 'incomplete',
} as const;
export type AssinaturaStatus = (typeof AssinaturaStatus)[keyof typeof AssinaturaStatus];

// resources/js/types/enums/assinatura-origem.ts
export const AssinaturaOrigem = {
  Manual: 'manual',
  Stripe: 'stripe',
} as const;
export type AssinaturaOrigem = (typeof AssinaturaOrigem)[keyof typeof AssinaturaOrigem];
```



### 1.2. Migrations (Apenas up(), sem down())


#### database/migrations/2026_11_03_000001_create_planos_table.php

```php
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
```

#### database/migrations/2026_11_03_000002_add_assinatura_and_convite_to_users_table.php

```php
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
```

---

### 1.3. Models com $fillable, casts(): array e Relacionamentos

#### app/Models/User.php

```php
<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\AssinaturaOrigem;
use App\Enums\AssinaturaStatus;
use App\Enums\UserRole;
use App\Enums\UserStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

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

    protected $hidden = [
        'password',
        'remember_token',
        'convite_token',
    ];

    /**
     * @return array<string, string|class-string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
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

    public function plano(): BelongsTo
    {
        return $this->belongsTo(Plano::class);
    }
}
```

#### app/Models/Plano.php

```php
<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\PlanoCiclo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plano extends Model
{
    use HasFactory;

    protected $table = 'planos';

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

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
```



### 1.4. Factories & Seeder


#### database/factories/PlanoFactory.php

```php
<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\PlanoCiclo;
use App\Models\Plano;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Plano>
 */
class PlanoFactory extends Factory
{
    protected $model = Plano::class;

    public function definition(): array
    {
        return [
            'nome' => fake()->randomElement(['Básico', 'Pro']),
            'ciclo' => fake()->randomElement(PlanoCiclo::cases()),
            'preco_centavos' => fake()->numberBetween(2900, 99000),
            'stripe_price_id' => 'price_' . fake()->regexify('[A-Za-z0-9]{24}'),
        ];
    }
}
```

#### database/seeders/PlanoSeeder.php

```php
<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\PlanoCiclo;
use App\Models\Plano;
use Illuminate\Database\Seeder;

class PlanoSeeder extends Seeder
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
```
---

## 🎨 Passo 2: Frontend UI & Telas (passo2-frontend-ui)

### 📌 Lista de Tarefas do Passo 2
- [x] 2.1. Tipos e Contratos TypeScript (`resources/js/pages/usuarios/types.ts`)
- [x] 2.2. Modal de Convite de Usuário (`resources/js/pages/usuarios/components/modal-convidar-usuario.tsx`)
- [x] 2.3. Página Principal de Listagem (`resources/js/pages/usuarios/index.tsx`)
- [x] 2.4. Quality Gate de UI (`react-reviewer`) & `composer verify`

### 📌 Checklist Pré-Execução (Auditoria `MEMORY.md`)

- [x] **Anti-Duplicação de Layout:** NUNCA envolver a página em `<AppLayout>` no JSX retornado. Usar exclusivamente `UsuariosIndex.layout = { breadcrumbs: [{ title: 'Usuários', href: '/usuarios' }] }`.
- [x] **Breadcrumbs:** NUNCA incluir `{ title: 'Início', href: '/dashboard' }` nos breadcrumbs; iniciar diretamente com `'Usuários'`.
- [x] **Largura Fluida:** Container raiz fluido com `flex flex-1 flex-col gap-6 p-4 md:p-6`. PROIBIDO `mx-auto` ou `max-w-*`.
- [x] **PageHeader Canônico:** Importar de `@/components/page-header` com `title`, `description` e `action`. PROIBIDO divs manuais.
- [x] **Card Container Único:** Container com `overflow-hidden rounded-2xl border border-border/50 bg-card shadow-xs md:rounded-3xl`.
- [x] **StatusTabs Integrado:** Dentro do card no topo, sem padding externo, com `color` temático em cada aba (`todos` -> primary, `ativo` -> success, `pendente` -> warning, `inativo` -> destructive).
- [x] **Filtros em Linha Única:** Barra de busca com lupa + Combobox de filtro + botão de exportar (3 pontinhos) alinhados horizontalmente (`flex-col gap-3 sm:flex-row sm:items-center`).
- [x] **Tabela Desktop:** Cabeçalho com `SortableTableHead` (UPPERCASE). Coluna de dados com `text-sm font-normal text-foreground`.
- [x] **Cards Mobile:** Lista em cards limpos (`md:hidden`), sem ícones inventados.
- [x] **Divisor de Águas do Cadastro:** Formulário de convite tem **3 campos** (`name`, `email`, `role`) -> **Modal (`Dialog`) obrigatório (`<= 8` campos)**.
- [x] **Dimensionamento do Modal:** Usar `sm:max-w-3xl` centralizado no desktop e tela cheia no mobile.
- [x] **Seletor de Nível de Acesso:** Usar o componente oficial `<Selector>` / `<SelectorItem>` com indicador de checkbox semi-quadrado (`rounded-md` com `Check`), preenchimento primário no ícone ativo e cards em grid `grid-cols-1 sm:grid-cols-2`.
- [x] **Botões e Ações:** Componente oficial `<Botao>` com texto fixo (`Voltar` com `ArrowLeft` na esquerda, `Enviar` com `Check` na direita com `justify-between`).
- [x] **Inativação Segura:** Usar `<ConfirmationModal>` para inativação com tom `#ce3765` para o botão e título destrutivo.
- [x] **Troca de Senha / Reenvio de Convite:** Usar `<ConfirmationModal>` padrão confirmando o envio do e-mail. NUNCA abrir modal com input de texto ou cópia de senha.
- [x] **Sem Strings Mágicas:** Usar Enums espelhados de TypeScript (`resources/js/types/enums/`).
- [x] **Sem Validação Manual na UI:** Erros tratados com Precognition e exibidos via `<InputError message={errors.campo} />` com `error={Boolean(errors.campo)}` nos inputs.

---

### 2.1. Tipos e Contratos TypeScript (`resources/js/pages/usuarios/types.ts`)

```typescript
import type { UserRole } from '@/types/enums/user-role';
import type { UserStatus } from '@/types/enums/user-status';
import type { AssinaturaStatus } from '@/types/enums/assinatura-status';
import type { AssinaturaOrigem } from '@/types/enums/assinatura-origem';
import type { PlanoCiclo } from '@/types/enums/plano-ciclo';

export interface PlanoResumo {
    id: number;
    nome: string;
    ciclo: PlanoCiclo;
    preco_centavos: number;
}

export interface UsuarioListItem {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    created_at: string;
    plano_id?: number | null;
    plano?: PlanoResumo | null;
    assinatura_status?: AssinaturaStatus | null;
    assinatura_origem?: AssinaturaOrigem | null;
    data_inicio?: string | null;
    data_vencimento?: string | null;
    cancel_at_period_end?: boolean;
}

export interface UsuariosPageProps {
    usuarios: {
        data: UsuarioListItem[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
        per_page: number;
    };
    contadores: {
        todos: number;
        ativo: number;
        pendente: number;
        inativo: number;
    };
    filtros: {
        busca?: string;
        aba?: string;
        role?: string;
        ordem_campo?: string;
        ordem_direcao?: 'asc' | 'desc';
    };
}

export interface ConvidarUsuarioFormData {
    name: string;
    email: string;
    role: UserRole;
}
```

---

### 2.2. Modal de Convite de Usuário (`resources/js/pages/usuarios/components/modal-convidar-usuario.tsx`)

```tsx
import React from 'react';
import { useForm } from '@inertiajs/react';
import { MailPlus, Check, ArrowLeft, Shield, User } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from '@/components/ui/dialog';
import { Botao } from '@/components/botao';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Selector, SelectorItem } from '@/components/ui/selector';
import { UserRole } from '@/types/enums/user-role';
import type { ConvidarUsuarioFormData } from '../types';

interface ModalConvidarUsuarioProps {
    aberto: boolean;
    onAbertoAlterado: (aberto: boolean) => void;
}

export function ModalConvidarUsuario({ aberto, onAbertoAlterado }: ModalConvidarUsuarioProps) {
    const { data, setData, post, processing, errors, reset, clearErrors, validate } = useForm<ConvidarUsuarioFormData>({
        name: '',
        email: '',
        role: UserRole.UsuarioPadrao,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/usuarios/convidar', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onAbertoAlterado(false);
            },
        });
    };

    return (
        <Dialog open={aberto} onOpenChange={onAbertoAlterado}>
            <DialogContent className="fixed inset-0 top-0 left-0 z-50 flex h-dvh max-h-none w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-0 p-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:h-auto sm:max-h-[90vh] sm:w-full sm:max-w-3xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border sm:border-border/60 sm:shadow-2xl">
                <DialogHeader className="flex flex-row items-center gap-3.5 border-b border-border/40 p-4 sm:p-6 text-left">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <MailPlus className="size-5" />
                    </div>
                    <div>
                        <DialogTitle className="text-base font-semibold text-foreground sm:text-lg">
                            Convidar Usuário
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground sm:text-sm">
                            Envie um convite de acesso para um novo colaborador definir sua senha.
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                Informações do Usuário
                            </span>
                            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="name">
                                        Nome Completo <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => {
                                            setData('name', e.target.value);
                                            clearErrors('name');
                                        }}
                                        onBlur={() => validate('name')}
                                        placeholder="Digite o nome completo..."
                                        error={Boolean(errors.name)}
                                        disabled={processing}
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="email">
                                        E-mail do Colaborador <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => {
                                            setData('email', e.target.value);
                                            clearErrors('email');
                                        }}
                                        onBlur={() => validate('email')}
                                        placeholder="Ex: colaborador@empresa.com.br"
                                        error={Boolean(errors.email)}
                                        disabled={processing}
                                    />
                                    <InputError message={errors.email} />
                                </div>
                            </div>
                        </div>

                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                Nível de Acesso <span className="text-destructive">*</span>
                            </span>
                            <div className="mt-3">
                                <Selector
                                    value={data.role}
                                    onValueChange={(val) => {
                                        setData('role', val as UserRole);
                                        clearErrors('role');
                                    }}
                                    className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                                >
                                    <SelectorItem
                                        value={UserRole.Admin}
                                        title="Administrador"
                                        description="Acesso irrestrito a todas as configurações"
                                        icon={Shield}
                                    />
                                    <SelectorItem
                                        value={UserRole.UsuarioPadrao}
                                        title="Usuário Padrão"
                                        description="Acesso operacional básico ao sistema"
                                        icon={User}
                                    />
                                </Selector>
                                <InputError message={errors.role} />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex items-center justify-between border-t border-border/40 bg-muted/20 p-4 shrink-0 sm:justify-between">
                        <DialogClose asChild>
                            <Botao type="button" variant="outline" icon={<ArrowLeft className="size-4" />} disabled={processing}>
                                Voltar
                            </Botao>
                        </DialogClose>
                        <Botao type="submit" loading={processing} icon={<Check className="size-4" strokeWidth={2.5} />}>
                            Enviar
                        </Botao>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
```

---

### 2.3. Página Principal de Listagem (`resources/js/pages/usuarios/index.tsx`)

```tsx
import React, { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import { Search, MoreHorizontal, Download, FolderOpen, RefreshCw, ShieldAlert, MoreVertical } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/ui/combobox';
import { StatusTabs, type StatusTabItem } from '@/components/ui/status-tabs';
import { SortableTableHead } from '@/components/ui/sortable-table-head';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { Paginacao } from '@/components/paginacao';
import { ModalConvidarUsuario } from './components/modal-convidar-usuario';
import { UserRole } from '@/types/enums/user-role';
import { UserStatus } from '@/types/enums/user-status';
import type { UsuariosPageProps, UsuarioListItem } from './types';

export default function UsuariosIndex({ usuarios, contadores, filtros }: UsuariosPageProps) {
    const [modalConvidarAberto, setModalConvidarAberto] = useState(false);
    const [usuarioInativar, setUsuarioInativar] = useState<UsuarioListItem | null>(null);
    const [usuarioReenviar, setUsuarioReenviar] = useState<UsuarioListItem | null>(null);

    const [termoBusca, setTermoBusca] = useState(filtros.busca ?? '');
    const [roleFiltro, setRoleFiltro] = useState(filtros.role ?? 'todos');
    const [abaStatus, setAbaStatus] = useState(filtros.aba ?? 'todos');

    const statusTabs: StatusTabItem[] = useMemo(
        () => [
            { id: 'todos', label: 'Todos', count: contadores.todos, color: 'primary' },
            { id: 'ativo', label: 'Ativos', count: contadores.ativo, color: 'success' },
            { id: 'pendente', label: 'Pendentes', count: contadores.pendente, color: 'warning' },
            { id: 'inativo', label: 'Inativos', count: contadores.inativo, color: 'destructive' },
        ],
        [contadores],
    );

    const handleFiltrar = (novosFiltros: Partial<typeof filtros>) => {
        router.get(
            '/usuarios',
            {
                ...filtros,
                ...novosFiltros,
                page: 1,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <>
            <Head title="Gestão de Usuários" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    title="Gestão de Usuários"
                    description="Gerencie os usuários do sistema, configure perfis de acesso e convide novos membros."
                    action={{
                        label: 'Convidar Usuário',
                        onClick: () => setModalConvidarAberto(true),
                    }}
                />

                <div className="border-border/50 bg-card shadow-xs overflow-hidden rounded-2xl border md:rounded-3xl">
                    <StatusTabs
                        tabs={statusTabs}
                        activeTab={abaStatus}
                        onChange={(tab) => {
                            setAbaStatus(tab);
                            handleFiltrar({ aba: tab });
                        }}
                    />

                    {/* Filtros em linha única alinhados horizontalmente */}
                    <div className="p-4 md:p-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="relative flex-1">
                                <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                                <Input
                                    value={termoBusca}
                                    onChange={(e) => {
                                        setTermoBusca(e.target.value);
                                        handleFiltrar({ busca: e.target.value });
                                    }}
                                    placeholder="Filtrar por nome ou e-mail..."
                                    className="pl-9"
                                />
                            </div>

                            <div className="w-full sm:w-56">
                                <Combobox
                                    value={roleFiltro}
                                    onChange={(val) => {
                                        setRoleFiltro(val);
                                        handleFiltrar({ role: val });
                                    }}
                                    options={[
                                        { value: 'todos', label: 'Todos os Perfis' },
                                        { value: UserRole.Admin, label: 'Administrador' },
                                        { value: UserRole.UsuarioPadrao, label: 'Usuário Padrão' },
                                    ]}
                                    placeholder="Perfil de Acesso"
                                />
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-muted-foreground shrink-0">
                                        <MoreHorizontal className="size-4" />
                                        <span className="sr-only">Opções da Listagem</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => window.open('/usuarios/exportar', '_blank')}>
                                        <Download className="mr-2 size-4" /> Exportar CSV
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Tabela Desktop */}
                    <div className="border-border/40 hidden border-t md:block">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <SortableTableHead
                                        field="name"
                                        currentField={filtros.ordem_campo}
                                        direction={filtros.ordem_direcao}
                                        onSort={(f, d) => handleFiltrar({ ordem_campo: f, ordem_direcao: d })}
                                    >
                                        NOME
                                    </SortableTableHead>
                                    <SortableTableHead
                                        field="email"
                                        currentField={filtros.ordem_campo}
                                        direction={filtros.ordem_direcao}
                                        onSort={(f, d) => handleFiltrar({ ordem_campo: f, ordem_direcao: d })}
                                    >
                                        E-MAIL
                                    </SortableTableHead>
                                    <SortableTableHead
                                        field="role"
                                        currentField={filtros.ordem_campo}
                                        direction={filtros.ordem_direcao}
                                        onSort={(f, d) => handleFiltrar({ ordem_campo: f, ordem_direcao: d })}
                                    >
                                        PERFIL
                                    </SortableTableHead>
                                    <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                        PLANO
                                    </TableHead>
                                    <SortableTableHead
                                        field="status"
                                        currentField={filtros.ordem_campo}
                                        direction={filtros.ordem_direcao}
                                        onSort={(f, d) => handleFiltrar({ ordem_campo: f, ordem_direcao: d })}
                                    >
                                        STATUS
                                    </SortableTableHead>
                                    <TableHead className="text-muted-foreground w-16 text-right text-xs font-semibold uppercase tracking-wider">
                                        AÇÕES
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {usuarios.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-48 text-center">
                                            <div className="text-muted-foreground flex flex-col items-center justify-center gap-2">
                                                <FolderOpen className="text-muted-foreground/60 size-8 stroke-1" />
                                                <p className="text-sm">
                                                    Nenhum usuário encontrado com os filtros aplicados.
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    usuarios.data.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="text-foreground text-sm font-normal">
                                                {user.name}
                                            </TableCell>
                                            <TableCell className="text-foreground text-sm font-normal">
                                                {user.email}
                                            </TableCell>
                                            <TableCell className="text-foreground text-sm font-normal">
                                                {user.role === UserRole.Admin ? 'Administrador' : 'Usuário Padrão'}
                                            </TableCell>
                                            <TableCell className="text-foreground text-sm font-normal">
                                                {user.plano ? `${user.plano.nome}` : 'Sem Plano'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        user.status === UserStatus.Ativo
                                                            ? 'success'
                                                            : user.status === UserStatus.Pendente
                                                              ? 'warning'
                                                              : 'destructive'
                                                    }
                                                >
                                                    {user.status === UserStatus.Ativo
                                                        ? 'ATIVO'
                                                        : user.status === UserStatus.Pendente
                                                          ? 'PENDENTE'
                                                          : 'INATIVO'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="size-8">
                                                            <MoreVertical className="size-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {user.status === UserStatus.Pendente && (
                                                            <DropdownMenuItem onClick={() => setUsuarioReenviar(user)}>
                                                                <RefreshCw className="mr-2 size-4" /> Reenviar Convite
                                                            </DropdownMenuItem>
                                                        )}
                                                        {user.status === UserStatus.Ativo && (
                                                            <DropdownMenuItem
                                                                onClick={() => setUsuarioInativar(user)}
                                                                className="text-destructive focus:text-destructive"
                                                            >
                                                                <ShieldAlert className="mr-2 size-4" /> Inativar Usuário
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Cards Mobile */}
                    <div className="border-border/40 flex flex-col gap-3 border-t p-4 md:hidden">
                        {usuarios.data.map((user) => (
                            <div
                                key={user.id}
                                className="border-border/60 bg-background flex items-center justify-between rounded-xl border p-3.5"
                            >
                                <div>
                                    <p className="text-foreground text-sm font-semibold">{user.name}</p>
                                    <p className="text-muted-foreground text-xs">{user.email}</p>
                                    <p className="text-foreground/80 mt-1 text-xs">
                                        {user.role === UserRole.Admin ? 'Administrador' : 'Usuário Padrão'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant={
                                            user.status === UserStatus.Ativo
                                                ? 'success'
                                                : user.status === UserStatus.Pendente
                                                  ? 'warning'
                                                  : 'destructive'
                                        }
                                    >
                                        {user.status === UserStatus.Ativo
                                            ? 'ATIVO'
                                            : user.status === UserStatus.Pendente
                                              ? 'PENDENTE'
                                              : 'INATIVO'}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Paginacao links={usuarios.links} total={usuarios.total} de={usuarios.from} ate={usuarios.to} />
                </div>
            </div>

            <ModalConvidarUsuario aberto={modalConvidarAberto} onAbertoAlterado={setModalConvidarAberto} />

            {/* Modal de Inativação Segura (#ce3765) */}
            <ConfirmationModal
                open={Boolean(usuarioInativar)}
                onOpenChange={(aberto) => !aberto && setUsuarioInativar(null)}
                title="Inativar Usuário"
                description={`Tem certeza que deseja inativar o acesso de ${usuarioInativar?.name}? O colaborador não conseguirá mais entrar no sistema.`}
                confirmText="Inativar"
                cancelText="Voltar"
                destructive
                onConfirm={() => {
                    if (usuarioInativar) {
                        router.put(
                            `/usuarios/${usuarioInativar.id}/inativar`,
                            {},
                            {
                                preserveScroll: true,
                                onSuccess: () => setUsuarioInativar(null),
                            },
                        );
                    }
                }}
            />

            {/* Modal de Confirmação para Reenvio de Convite por E-mail */}
            <ConfirmationModal
                open={Boolean(usuarioReenviar)}
                onOpenChange={(aberto) => !aberto && setUsuarioReenviar(null)}
                title="Reenviar Convite"
                description={`Deseja reenviar o e-mail de convite com link de definição de senha para ${usuarioReenviar?.email}?`}
                confirmText="Enviar E-mail"
                cancelText="Voltar"
                onConfirm={() => {
                    if (usuarioReenviar) {
                        router.post(
                            `/usuarios/${usuarioReenviar.id}/reenviar-convite`,
                            {},
                            {
                                preserveScroll: true,
                                onSuccess: () => setUsuarioReenviar(null),
                            },
                        );
                    }
                }}
            />
        </>
    );
}

UsuariosIndex.layout = {
    breadcrumbs: [{ title: 'Usuários', href: '/usuarios' }],
};
```

---

## ⚙️ Passo 3: Backend API & Lógica (passo3-backend-api)

### 📌 Checklist Pré-Execução (Auditoria `MEMORY.md` & Regras de Ouro)

- [x] **Zero Strings Mágicas:** Status (`UserStatus`) e perfil (`UserRole`) validados via `Rule::enum(UserStatus::class)` e `Rule::enum(UserRole::class)`.
- [x] **Raw Data Only:** Backend envia apenas dados brutos (`id`, `name`, `email`, `role`, `status`, `created_at`, `plano_id`, vigências). Sem formatações de data ou moeda na API.
- [x] **Sem `down()` em Migrations:** Focado exclusivamente no método `up()`.
- [x] **Sem `authorize()` Redundante:** FormRequests sem declaração de método `authorize()`. Autorização gerenciada no Controller via Policy/Gate.
- [x] **Sem `prepareForValidation()` Redundante:** Não duplicar limpeza de strings (`TrimStrings` e `ConvertEmptyStringsToNull` já rodam globalmente).
- [x] **Sem Injeção de Action no `__construct()`:** Actions injetadas exclusivamente na assinatura do método da rota que as executa (`index`, `convidar`, `inativar`, etc.), conforme regra estrita do `MEMORY.md`.
- [x] **Anti-N+1 Estrito:** Eager loading via `$query->with('plano')`.
- [x] **Contadores de Abas Reativos:** Usar `(clone $queryBase)` para calcular contadores de `todos`, `ativo`, `pendente` e `inativo`, respeitando filtros de busca e perfil aplicados.
- [x] **Actions Transacionais:** Criação de convite e inativação envolvidas em `DB::transaction()`.
- [x] **Exportação O(1) de RAM:** Controller de exportação CSV utilizando `cursor()` lazy stream com cabeçalho UTF-8 BOM para Excel.
- [x] **Mailable Assíncrono:** Mailable de convite implementando `ShouldQueue` com `$this->afterCommit()`.

---

### 3.1. Form Requests (`app/Http/Requests/`)

#### 3.1.1. `app/Http/Requests/ListarUsuariosRequest.php`

```php
<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class ListarUsuariosRequest extends FormRequest
{
    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'busca' => ['nullable', 'string', 'max:255'],
            'aba' => ['nullable', 'string', Rule::in(['todos', ...array_column(UserStatus::cases(), 'value')])],
            'role' => ['nullable', 'string', Rule::in(['todos', ...array_column(UserRole::cases(), 'value')])],
            'ordem_campo' => ['nullable', 'string', Rule::in(['name', 'email', 'role', 'status', 'created_at'])],
            'ordem_direcao' => ['nullable', 'string', Rule::in(['asc', 'desc'])],
            'per_page' => ['nullable', 'integer', 'min:5', 'max:100'],
        ];
    }
}
```

#### 3.1.2. `app/Http/Requests/ConvidarUsuarioRequest.php`

```php
<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class ConvidarUsuarioRequest extends FormRequest
{
    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class, 'email'),
            ],
            'role' => ['required', Rule::enum(UserRole::class)],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'nome completo',
            'email' => 'e-mail do colaborador',
            'role' => 'nível de acesso',
        ];
    }
}
```

---

### 3.2. Actions Transacionais e de Consulta (`app/Actions/Usuarios/`)

#### 3.2.1. `app/Actions/Usuarios/FiltrarUsuariosAction.php`

```php
<?php

declare(strict_types=1);

namespace App\Actions\Usuarios;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

final readonly class FiltrarUsuariosAction
{
    /**
     * @param array{
     *     busca?: string|null,
     *     role?: string|null,
     *     ordem_campo?: string|null,
     *     ordem_direcao?: string|null
     * } $filtros
     * @return Builder<User>
     */
    public function executeQuery(array $filtros): Builder
    {
        return User::query()
            ->with(['plano'])
            ->when(! empty($filtros['busca']), function (Builder $query) use ($filtros): void {
                $termo = '%'.trim((string) $filtros['busca']).'%';
                $query->where(function (Builder $sub) use ($termo): void {
                    $sub->where('name', 'like', $termo)
                        ->orWhere('email', 'like', $termo);
                });
            })
            ->when(! empty($filtros['role']) && $filtros['role'] !== 'todos', function (Builder $query) use ($filtros): void {
                $query->where('role', $filtros['role']);
            })
            ->orderBy(
                $filtros['ordem_campo'] ?? 'created_at',
                $filtros['ordem_direcao'] ?? 'desc'
            );
    }

    /**
     * @param Builder<User> $query
     * @param string|null $aba
     * @return Builder<User>
     */
    public function aplicarFiltroAba(Builder $query, ?string $aba): Builder
    {
        if (empty($aba) || $aba === 'todos') {
            return $query;
        }

        return $query->where('status', $aba);
    }
}
```

#### 3.2.2. `app/Actions/Usuarios/ConvidarUsuarioAction.php`

```php
<?php

declare(strict_types=1);

namespace App\Actions\Usuarios;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Mail\ConviteUsuarioMail;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

final readonly class ConvidarUsuarioAction
{
    /**
     * @param array{name: string, email: string, role: string|UserRole} $dados
     */
    public function execute(array $dados): User
    {
        return DB::transaction(function () use ($dados): User {
            $token = Str::random(64);

            $usuario = User::create([
                'name' => $dados['name'],
                'email' => $dados['email'],
                'role' => $dados['role'],
                'status' => UserStatus::Pendente,
                'convite_token' => $token,
                'convite_expira_em' => now()->addDays(7),
                'password' => null,
            ]);

            Mail::to($usuario->email)->send(new ConviteUsuarioMail($usuario));

            return $usuario;
        });
    }
}
```

#### 3.2.3. `app/Actions/Usuarios/InativarUsuarioAction.php`

```php
<?php

declare(strict_types=1);

namespace App\Actions\Usuarios;

use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Support\Facades\DB;

final readonly class InativarUsuarioAction
{
    public function execute(User $usuario): User
    {
        return DB::transaction(function () use ($usuario): User {
            $usuario->update([
                'status' => UserStatus::Inativo,
            ]);

            return $usuario;
        });
    }
}
```

#### 3.2.4. `app/Actions/Usuarios/ReenviarConviteAction.php`

```php
<?php

declare(strict_types=1);

namespace App\Actions\Usuarios;

use App\Mail\ConviteUsuarioMail;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use InvalidArgumentException;

final readonly class ReenviarConviteAction
{
    public function execute(User $usuario): void
    {
        if ($usuario->status->value !== 'pendente') {
            throw new InvalidArgumentException('Apenas usuários com convite pendente podem receber novo e-mail.');
        }

        DB::transaction(function () use ($usuario): void {
            $usuario->update([
                'convite_token' => Str::random(64),
                'convite_expira_em' => now()->addDays(7),
            ]);

            Mail::to($usuario->email)->send(new ConviteUsuarioMail($usuario));
        });
    }
}
```

---

### 3.3. Mailable Assíncrono (`app/Mail/ConviteUsuarioMail.php`)

```php
<?php

declare(strict_types=1);

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

final class ConviteUsuarioMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public readonly User $usuario)
    {
        $this->afterCommit();
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Convite para Acesso ao Capy Estoque',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.convite-usuario',
            with: [
                'nome' => $this->usuario->name,
                'linkConvite' => url("/convite/{$this->usuario->convite_token}"),
            ],
        );
    }
}
```

---

### 3.4. Policy de Autorização (`app/Policies/UserPolicy.php`)

```php
<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\User;

final class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === UserRole::Admin;
    }

    public function create(User $user): bool
    {
        return $user->role === UserRole::Admin;
    }

    public function update(User $user, User $model): bool
    {
        return $user->role === UserRole::Admin;
    }

    public function inativar(User $user, User $model): bool
    {
        return $user->role === UserRole::Admin && $user->id !== $model->id;
    }

    public function export(User $user): bool
    {
        return $user->role === UserRole::Admin;
    }
}
```

---

### 3.5. Thin Controllers

#### 3.5.1. `app/Http/Controllers/UsuarioController.php`

```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Usuarios\ConvidarUsuarioAction;
use App\Actions\Usuarios\FiltrarUsuariosAction;
use App\Actions\Usuarios\InativarUsuarioAction;
use App\Actions\Usuarios\ReenviarConviteAction;
use App\Enums\UserStatus;
use App\Http\Requests\ConvidarUsuarioRequest;
use App\Http\Requests\ListarUsuariosRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

final class UsuarioController extends Controller
{
    public function index(ListarUsuariosRequest $request, FiltrarUsuariosAction $action): Response
    {
        Gate::authorize('viewAny', User::class);

        $filtros = $request->validated();
        $queryBase = $action->executeQuery($filtros);

        $contadores = [
            'todos' => (clone $queryBase)->count(),
            'ativo' => (clone $queryBase)->where('status', UserStatus::Ativo->value)->count(),
            'pendente' => (clone $queryBase)->where('status', UserStatus::Pendente->value)->count(),
            'inativo' => (clone $queryBase)->where('status', UserStatus::Inativo->value)->count(),
        ];

        $abaAtiva = (string) ($filtros['aba'] ?? 'todos');
        $usuarios = $action->aplicarFiltroAba($queryBase, $abaAtiva)
            ->paginate((int) ($filtros['per_page'] ?? 10))
            ->withQueryString();

        return Inertia::render('usuarios/index', [
            'usuarios' => $usuarios,
            'contadores' => $contadores,
            'filtros' => $filtros,
        ]);
    }

    public function convidar(ConvidarUsuarioRequest $request, ConvidarUsuarioAction $action): RedirectResponse
    {
        Gate::authorize('create', User::class);

        $action->execute($request->validated());

        return redirect()->back()->with('success', 'Convite enviado com sucesso!');
    }

    public function inativar(User $usuario, InativarUsuarioAction $action): RedirectResponse
    {
        Gate::authorize('inativar', $usuario);

        $action->execute($usuario);

        return redirect()->back()->with('success', 'Usuário inativado com sucesso!');
    }

    public function reenviarConvite(User $usuario, ReenviarConviteAction $action): RedirectResponse
    {
        Gate::authorize('update', $usuario);

        $action->execute($usuario);

        return redirect()->back()->with('success', 'Convite reenviado com sucesso!');
    }
}
```

#### 3.5.2. `app/Http/Controllers/ExportarUsuariosController.php`

```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Usuarios\FiltrarUsuariosAction;
use App\Http\Requests\ListarUsuariosRequest;
use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\StreamedResponse;

final class ExportarUsuariosController extends Controller
{
    public function __invoke(ListarUsuariosRequest $request, FiltrarUsuariosAction $action): StreamedResponse
    {
        Gate::authorize('export', User::class);

        $filtros = $request->validated();
        $query = $action->aplicarFiltroAba(
            $action->executeQuery($filtros),
            $filtros['aba'] ?? 'todos'
        );

        return response()->streamDownload(function () use ($query): void {
            $handle = fopen('php://output', 'wb');
            if ($handle === false) {
                return;
            }

            fwrite($handle, "\xEF\xBB\xBF");

            fputcsv($handle, ['ID', 'Nome', 'E-mail', 'Perfil', 'Status', 'Plano', 'Criado em'], ';');

            foreach ($query->cursor() as $usuario) {
                fputcsv($handle, [
                    $usuario->id,
                    $usuario->name,
                    $usuario->email,
                    $usuario->role->label(),
                    $usuario->status->label(),
                    $usuario->plano?->nome ?? 'Sem Plano',
                    $usuario->created_at?->toIso8601String() ?? '',
                ], ';');
            }

            fclose($handle);
        }, 'usuarios_'.now()->format('Y-m-d_His').'.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
```

---

### 3.6. Rotas Web (`routes/web.php`)
```php
use App\Http\Controllers\ExportarUsuariosController;
use App\Http\Controllers\UsuarioController;

Route::middleware(['auth'])->group(function (): void {
    Route::get('/usuarios', [UsuarioController::class, 'index'])->name('usuarios.index');
    Route::post('/usuarios/convidar', [UsuarioController::class, 'convidar'])->name('usuarios.convidar');
    Route::get('/usuarios/exportar', ExportarUsuariosController::class)->name('usuarios.exportar');
    Route::put('/usuarios/{usuario}/inativar', [UsuarioController::class, 'inativar'])->name('usuarios.inativar');
    Route::post('/usuarios/{usuario}/reenviar-convite', [UsuarioController::class, 'reenviarConvite'])->name('usuarios.reenviar-convite');
});
```

---

### 3.7. Quality Gate: Code Review Backend (php-reviewer)

- [ ] Auditar conformidade com `declare(strict_types=1);` em todos os arquivos PHP.
- [ ] Auditar ausência de `prepareForValidation()` e ausência de `authorize()` nos FormRequests.
- [ ] Auditar injeção de Actions estritamente nas assinaturas dos métodos dos Controllers (zero injeção no `__construct()`).
- [ ] Auditar queries com eager loading anti-N+1 (`with(['plano'])`).
- [ ] Auditar contadores via `(clone $queryBase)`.
- [ ] Auditar uso de transações `DB::transaction()` em todas as Actions de escrita.
- [ ] Auditar streaming O(1) com `$query->cursor()` na exportação CSV.
- [ ] Auditar `ShouldQueue` e `$this->afterCommit()` no Mailable.

---

### 3.8. Verificação de Integridade

- Executar `vendor/bin/pint --dirty --format agent`.
- Executar `php artisan test --compact`.
- Executar `composer verify`.

---

### 3.9. Commit

- `feat(backend): implementar controller, actions, requests e policies de gestao de usuarios`

---

## 🔗 Passo 4: Integração, Wire-up & Precognition (passo4-integracao-e2e)

### 📌 Checklist Pré-Execução (Auditoria `MEMORY.md` & Regras de Ouro)

- [x] **Wayfinder Oficial:** Gerar rotas tipadas com `php artisan wayfinder:generate --with-form`.
- [x] **Zero URLs Hardcoded:** Substituir URLs string por chamadas tipadas do Wayfinder importadas de `@/actions/` ou `@/routes/`.
- [x] **Laravel Precognition no Modal de Convite:** Conectar o formulário via validação em tempo real no `onBlur` com `validate('campo')` e limpeza no `onChange` com `clearErrors('campo')`, exibindo mensagens do FormRequest do backend.
- [x] **Zero Validações Manuais na UI:** Nenhuma função manual `validarCampos` ou checagens manuais de string.
- [x] **Inativação Segura:** Menu de 3 pontinhos na tabela desktop disparando inativação lógica segura (`router.put(...)`) com ConfirmationModal no tom `#ce3765`.
- [x] **Reenvio de Convite:** Disparo seguro (`router.post(...)`) com modal de confirmação de e-mail.
- [x] **Exportação:** Disparo de download via endpoint tipado da rota `usuarios.exportar`.

---

### 4.1. Geração de Rotas Tipadas Wayfinder

```bash
php artisan wayfinder:generate --with-form
```


---

### 4.2. Testes Automatizados E2E / Feature com Pest v4 (`tests/Feature/Usuarios/GestaoUsuariosTest.php`)

```php
<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Mail\ConviteUsuarioMail;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

beforeEach(function (): void {
    Mail::fake();
    $this->admin = User::factory()->create([
        'role' => UserRole::Admin,
        'status' => UserStatus::Ativo,
    ]);
});

test('administrador visualiza a listagem de usuários com contadores de status', function (): void {
    User::factory()->count(3)->create(['status' => UserStatus::Ativo]);
    User::factory()->count(2)->create(['status' => UserStatus::Pendente]);

    $this->actingAs($this->admin)
        ->get(route('usuarios.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('usuarios/index')
            ->has('usuarios.data', 6)
            ->where('contadores.ativo', 4)
            ->where('contadores.pendente', 2)
        );
});

test('administrador pode convidar um novo colaborador com precognition', function (): void {
    $this->actingAs($this->admin)
        ->post(route('usuarios.convidar'), [
            'name' => 'Novo Membro',
            'email' => 'novo@capy.com',
            'role' => UserRole::UsuarioPadrao->value,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('users', [
        'email' => 'novo@capy.com',
        'status' => UserStatus::Pendente->value,
        'role' => UserRole::UsuarioPadrao->value,
    ]);

    Mail::assertSent(ConviteUsuarioMail::class, fn ($mail) => $mail->hasTo('novo@capy.com'));
});

test('precognition rejeita convite com e-mail duplicado', function (): void {
    User::factory()->create(['email' => 'duplicado@capy.com']);

    $this->actingAs($this->admin)
        ->withHeaders(['Precognition' => 'true'])
        ->post(route('usuarios.convidar'), [
            'name' => 'Teste Duplicado',
            'email' => 'duplicado@capy.com',
            'role' => UserRole::UsuarioPadrao->value,
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['email']);
});

test('administrador pode inativar um usuário ativo', function (): void {
    $usuario = User::factory()->create(['status' => UserStatus::Ativo]);

    $this->actingAs($this->admin)
        ->put(route('usuarios.inativar', $usuario))
        ->assertRedirect();

    expect($usuario->fresh()->status)->toBe(UserStatus::Inativo);
});

test('administrador pode exportar a lista de usuários em csv', function (): void {
    User::factory()->count(5)->create();

    $this->actingAs($this->admin)
        ->get(route('usuarios.exportar'))
        ->assertOk()
        ->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
});
```

---

### 4.3. Quality Gate: Code Review de Integração (typescript-reviewer & react-reviewer)

- [ ] Auditar geração de Wayfinder com `--with-form`.
- [ ] Auditar integração do Precognition via `onBlur` + `validate` e `clearErrors`.
- [ ] Auditar ausência de validações manuais na UI.
- [ ] Auditar execução e aprovação de 100% dos testes Pest com `php artisan test --compact`.
- [ ] Auditar execução de `composer verify` garantindo 0 falhas em Oxlint, Rector, PHPStan e Pest.

---

### 4.4. Commit

- `feat(usuarios): integrar endpoints, wire-up com wayfinder, precognition e testes e2e`
