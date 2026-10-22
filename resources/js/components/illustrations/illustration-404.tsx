import { cn } from '@/lib/utils';

interface Illustration404Props {
    className?: string;
}

export function Illustration404({ className }: Illustration404Props) {
    return (
        <div className={cn('relative my-4 flex w-full items-center justify-center', className)}>
            <svg
                viewBox="0 0 460 300"
                className="h-auto w-full max-w-110 select-none sm:max-w-125"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-hidden="true"
            >
                {/* Nuvem de Fundo Orgânica */}
                <path
                    d="M140 230 C90 230 60 190 70 145 C75 110 110 90 140 95 C155 60 205 45 245 60 C270 40 310 45 330 75 C370 70 405 100 400 140 C430 165 425 210 390 230 Z"
                    className="fill-muted/70 stroke-transparent dark:fill-zinc-700/50 dark:stroke-zinc-500/50"
                    strokeWidth="1.5"
                />

                {/* Sol Suave */}
                <circle cx="170" cy="115" r="24" className="fill-amber-300 dark:fill-amber-400/90" />

                {/* Nuvenzinhas internas decorativas */}
                <path
                    d="M130 155 Q145 145 160 155 Q175 165 190 155"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="text-muted-foreground/20 dark:text-zinc-400/50"
                />
                <path
                    d="M330 120 Q345 110 360 120 Q375 130 390 120"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="text-muted-foreground/20 dark:text-zinc-400/50"
                />

                {/* Pontos de interrogação flutuantes */}
                <text
                    x="200"
                    y="125"
                    className="fill-muted-foreground/40 text-2xl font-bold select-none dark:fill-zinc-400/70"
                >
                    ?
                </text>
                <text
                    x="285"
                    y="110"
                    className="fill-muted-foreground/50 text-xl font-bold select-none dark:fill-zinc-400/70"
                >
                    ?
                </text>
                <text
                    x="295"
                    y="145"
                    className="fill-muted-foreground/35 text-lg font-bold select-none dark:fill-zinc-400/60"
                >
                    ?
                </text>

                {/* Personagem Ilustrada */}
                {/* Cabeça / Cabelo de fundo */}
                <circle cx="245" cy="118" r="16" className="fill-rose-400 dark:fill-rose-500" />
                {/* Rosto */}
                <circle cx="245" cy="120" r="12" className="fill-amber-100 dark:fill-amber-200" />
                {/* Cabelo frontal e franja */}
                <path
                    d="M233 118 C235 106 255 106 257 118 C252 114 246 114 242 116 C238 114 235 116 233 118 Z"
                    className="fill-rose-500 dark:fill-rose-600"
                />
                {/* Olhos e expressão sutil */}
                <circle cx="242" cy="120" r="1.5" className="fill-zinc-800" />
                <circle cx="248" cy="120" r="1.5" className="fill-zinc-800" />
                {/* Braço na cabeça (pose de dúvida) */}
                <path
                    d="M255 135 Q264 125 256 112"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    className="text-amber-200"
                />
                {/* Tronco / Blusa */}
                <path
                    d="M236 132 C236 132 245 130 254 132 L257 160 L233 160 Z"
                    className="fill-rose-400 dark:fill-rose-500"
                />
                {/* Calça */}
                <path
                    d="M234 160 L256 160 L254 195 L247 195 L245 168 L243 195 L236 195 Z"
                    className="fill-teal-600 dark:fill-teal-500"
                />
                {/* Pés / Sapatos */}
                <ellipse cx="236" cy="196" rx="4" ry="2" className="fill-rose-400" />
                <ellipse cx="254" cy="196" rx="4" ry="2" className="fill-rose-400" />

                {/* Número 404 Estilizado em Destaque */}
                <g className="font-black tracking-tight select-none">
                    {/* Primeiro 4 */}
                    <text x="130" y="218" fontSize="92" className="fill-primary font-black drop-shadow-xs">
                        4
                    </text>

                    {/* Zero central com vazado */}
                    <circle cx="245" cy="188" r="38" className="fill-primary" />
                    <circle cx="245" cy="188" r="20" className="fill-background dark:fill-[#242428]" />

                    {/* Segundo 4 */}
                    <text x="290" y="218" fontSize="92" className="fill-primary font-black drop-shadow-xs">
                        4
                    </text>
                </g>
            </svg>
        </div>
    );
}

export default Illustration404;
