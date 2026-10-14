<?php

declare(strict_types=1);

namespace App\Templates;

/**
 * TEMPLATE CANÔNICO: Enum Tipado (Backed Enum com Options e Labels)
 *
 * Padrão arquitetural agnóstico para Enums no Starter Kit.
 *
 * Convenções e Boas Práticas:
 * - Strict types habilitado
 * - Backed Enum tipado (: string ou : int)
 * - Chaves dos cases em TitleCase (ex: Ativo, PendenteAprovacao, Inativo)
 * - Valores literais padronizados em UPPER_SNAKE_CASE (quando string)
 * - Método options() estático com PHPDoc array shape para alimentar selects no Inertia/React
 * - Método label() legível para exibição ao usuário final
 * - Método opcional de variantes de badge (primary, success, warning, destructive)
 *
 * Legenda de Substituição:
 * - [NomeDoEnum]: Nome da classe do enum (ex: StatusPedido, PerfilAcesso, TipoDocumento)
 */
enum EnumTemplate: string
{
    case OpcaoPrincipal = 'OPCAO_PRINCIPAL';
    case OpcaoSecundaria = 'OPCAO_SECUNDARIA';
    case OpcaoAlternativa = 'OPCAO_ALTERNATIVA';

    /**
     * Retorna todas as opções formatadas para selects e comboboxes no frontend.
     *
     * @return array<int, array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(static fn (self $item): array => [
            'value' => $item->value,
            'label' => $item->label(),
        ], self::cases());
    }

    /**
     * Retorna todos os valores puros em formato de array simples.
     *
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * Rótulo legível para apresentação na interface.
     */
    public function label(): string
    {
        return match ($this) {
            self::OpcaoPrincipal => 'Opção Principal',
            self::OpcaoSecundaria => 'Opção Secundária',
            self::OpcaoAlternativa => 'Opção Alternativa',
        };
    }

    /**
     * Variante ou cor de Badge para integração com o Design System frontend.
     * (default, secondary, destructive, outline, success, warning)
     */
    public function badgeVariant(): string
    {
        return match ($this) {
            self::OpcaoPrincipal => 'default',
            self::OpcaoSecundaria => 'secondary',
            self::OpcaoAlternativa => 'outline',
        };
    }
}
