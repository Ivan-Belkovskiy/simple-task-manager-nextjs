'use client';

import { CSSProperties } from "react";
import "./AnimatedLoader.css";

export default function AnimatedLoader({ color, styles }: { color?: string; styles?: CSSProperties}) {
    return (
        <span className="animated-loader" style={{
            ...styles,
            borderTopColor: color,
            borderRightColor: color,
        }}></span>
    )
}