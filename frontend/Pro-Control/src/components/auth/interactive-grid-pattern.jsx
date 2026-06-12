import React, { useState } from "react";

/**
 * Сетка линий в духе Kiranism auth: крупнее ячейки, приглушенные линии.
 */
export function InteractiveGridPattern({
    width = 52,
    height = 52,
    squares = [18, 18],
    className = "",
    squaresClassName = "",
    ...props
}) {
    const [horizontal, vertical] = squares;
    const [hoveredSquare, setHoveredSquare] = useState(null);

    const mergedClass = [
        "absolute inset-0 h-full w-full border border-zinc-700/10",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <svg
            width={width * horizontal}
            height={height * vertical}
            className={mergedClass}
            {...props}
        >
            {Array.from({ length: horizontal * vertical }).map((_, index) => {
                const x = (index % horizontal) * width;
                const y = Math.floor(index / horizontal) * height;
                const squareClasses = [
                    "stroke-zinc-700/12 transition-all duration-100 ease-in-out [&:not(:hover)]:duration-1000",
                    hoveredSquare === index ? "fill-zinc-500/[0.05]" : "fill-transparent",
                    squaresClassName,
                ]
                    .filter(Boolean)
                    .join(" ");
                return (
                    <rect
                        key={index}
                        x={x}
                        y={y}
                        width={width}
                        height={height}
                        className={squareClasses}
                        onMouseEnter={() => setHoveredSquare(index)}
                        onMouseLeave={() => setHoveredSquare(null)}
                    />
                );
            })}
        </svg>
    );
}
