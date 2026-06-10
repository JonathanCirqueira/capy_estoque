import React from 'react';

export default function SidebarPattern() {
    return (
        <div
            className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-hidden select-none"
            aria-hidden="true"
        >
            {/* 
                Seamless Large-Scale Regular Hexagon Node Mesh (Perfect Geometry)
                - Mathematically perfect regular hexagons with radius R = 130px
                - Circular vertex node dots exactly centered on all intersections
                - Custom rotation and extremely subtle opacity for a state-of-the-art tech aesthetic
            */}
            <svg
                className="h-full w-full text-white/4 mix-blend-screen dark:text-sky-300/4"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <pattern
                        id="perfect-large-hex-grid"
                        width="550"
                        height="450"
                        patternUnits="userSpaceOnUse"
                        patternTransform="rotate(15 0 0)"
                    >
                        {/* 
                            Sparse Flat-Topped Hexagon Constellation Grid
                            - Non-honeycomb "loose" layout
                            - Perfect seamless diagonal and horizontal connections
                        */}
                        <g
                            stroke="currentColor"
                            strokeWidth="1.2"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            {/* Central Perfect Flat-Topped Hexagon */}
                            <polygon points="205,103.76 345,103.76 415,225 345,346.24 205,346.24 135,225" />

                            {/* Seamless Horizontal Connectors */}
                            <line x1="0" y1="225" x2="135" y2="225" />
                            <line x1="415" y1="225" x2="550" y2="225" />

                            {/* Seamless Diagonal Connectors crossing the borders */}
                            <line x1="205" y1="103.76" x2="145" y2="0" />
                            <line x1="145" y1="450" x2="205" y2="346.24" />
                            <line x1="345" y1="103.76" x2="405" y2="0" />
                            <line x1="405" y1="450" x2="345" y2="346.24" />
                        </g>

                        {/* Perfectly Centered Vertex Nodes/Dots */}
                        <g fill="currentColor">
                            <circle cx="135" cy="225" r="5" />
                            <circle cx="205" cy="103.76" r="5" />
                            <circle cx="345" cy="103.76" r="5" />
                            <circle cx="415" cy="225" r="5" />
                            <circle cx="345" cy="346.24" r="5" />
                            <circle cx="205" cy="346.24" r="5" />
                        </g>
                    </pattern>
                </defs>
                {/* Fills the background with our sparse flat-topped hex constellation */}
                <rect width="100%" height="100%" fill="url(#perfect-large-hex-grid)" />
            </svg>
        </div>
    );
}
