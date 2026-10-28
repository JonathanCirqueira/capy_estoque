import React from 'react';

export default function SidebarPattern() {
    return (
        <svg
            className="pointer-events-none absolute inset-0 z-0 h-full w-full select-none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <defs>
                <style>
                    {`
                        @keyframes floatParticle1 {
                            0%, 100% {
                                transform: translate(0, 0);
                            }
                            50% {
                                transform: translate(12px, -20px);
                            }
                        }

                        @keyframes floatParticle2 {
                            0%, 100% {
                                transform: translate(0, 0);
                            }
                            50% {
                                transform: translate(-15px, 15px);
                            }
                        }

                        @keyframes floatParticle3 {
                            0%, 100% {
                                transform: translate(0, 0);
                            }
                            50% {
                                transform: translate(18px, 12px);
                            }
                        }

                        @keyframes floatParticle4 {
                            0%, 100% {
                                transform: translate(0, 0);
                            }
                            50% {
                                transform: translate(-10px, -18px);
                            }
                        }

                        .particle-anim {
                            transform-box: fill-box;
                            transform-origin: center;
                            animation-timing-function: ease-in-out;
                            animation-iteration-count: infinite;
                        }

                        .particle-1 {
                            animation-name: floatParticle1;
                            animation-duration: 14s;
                        }

                        .particle-2 {
                            animation-name: floatParticle2;
                            animation-duration: 18s;
                        }

                        .particle-3 {
                            animation-name: floatParticle3;
                            animation-duration: 16s;
                        }

                        .particle-4 {
                            animation-name: floatParticle4;
                            animation-duration: 12s;
                        }
                    `}
                </style>

                {/* Malha quadrada de 30x30px */}
                <pattern id="subtle-squared-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="white" strokeWidth="0.8" strokeOpacity="0.025" />
                </pattern>
            </defs>

            {/* Grid sutil cobrindo todo o container */}
            <rect width="100%" height="100%" fill="url(#subtle-squared-grid)" />

            {/* Pontinhos flutuantes (Círculos SVG #36C2D2 com opacidade 20%) */}
            <g fill="#36C2D2" opacity="0.2">
                <circle
                    cx="15%"
                    cy="8%"
                    r="1.5"
                    className="particle-anim particle-1"
                    style={{ animationDelay: '-4s' }}
                />
                <circle
                    cx="80%"
                    cy="14%"
                    r="1.2"
                    className="particle-anim particle-2"
                    style={{ animationDelay: '-6s' }}
                />
                <circle
                    cx="15%"
                    cy="15%"
                    r="1.8"
                    className="particle-anim particle-3"
                    style={{ animationDelay: '-8s' }}
                />
                <circle
                    cx="45%"
                    cy="20%"
                    r="1"
                    className="particle-anim particle-4"
                    style={{ animationDelay: '-10s' }}
                />
                <circle
                    cx="80%"
                    cy="25%"
                    r="2"
                    className="particle-anim particle-1"
                    style={{ animationDelay: '-2s' }}
                />
                <circle
                    cx="28%"
                    cy="32%"
                    r="1.2"
                    className="particle-anim particle-2"
                    style={{ animationDelay: '-5s' }}
                />
                <circle
                    cx="35%"
                    cy="40%"
                    r="1.5"
                    className="particle-anim particle-3"
                    style={{ animationDelay: '-7s' }}
                />
                <circle
                    cx="75%"
                    cy="45%"
                    r="1.8"
                    className="particle-anim particle-4"
                    style={{ animationDelay: '-11s' }}
                />
                <circle
                    cx="18%"
                    cy="50%"
                    r="1"
                    className="particle-anim particle-1"
                    style={{ animationDelay: '-9s' }}
                />
                <circle
                    cx="70%"
                    cy="55%"
                    r="2"
                    className="particle-anim particle-2"
                    style={{ animationDelay: '-3s' }}
                />
                <circle
                    cx="40%"
                    cy="63%"
                    r="1.2"
                    className="particle-anim particle-3"
                    style={{ animationDelay: '-6s' }}
                />
                <circle
                    cx="20%"
                    cy="70%"
                    r="1.8"
                    className="particle-anim particle-4"
                    style={{ animationDelay: '-8s' }}
                />
                <circle
                    cx="65%"
                    cy="74%"
                    r="1.5"
                    className="particle-anim particle-1"
                    style={{ animationDelay: '-1s' }}
                />
                <circle
                    cx="85%"
                    cy="80%"
                    r="1.2"
                    className="particle-anim particle-2"
                    style={{ animationDelay: '-10s' }}
                />
                <circle
                    cx="30%"
                    cy="85%"
                    r="2"
                    className="particle-anim particle-3"
                    style={{ animationDelay: '-4s' }}
                />
                <circle
                    cx="78%"
                    cy="90%"
                    r="1"
                    className="particle-anim particle-4"
                    style={{ animationDelay: '-7s' }}
                />
                <circle
                    cx="22%"
                    cy="95%"
                    r="1.5"
                    className="particle-anim particle-1"
                    style={{ animationDelay: '-5s' }}
                />
            </g>
        </svg>
    );
}
