'use client';

import { CSSProperties } from "react";
import "./FloatingActionButton.css";

export default function FloatingActionButton({ styles, content, position, onClick }: {
    styles?: CSSProperties;
    content?: string;
    position?: {
        top?: number;
        right?: number;
        bottom?: number;
        left?: number;
    };
    onClick?: () => void;
    // position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}) {
    return (
        <button
            className="floating-action-btn"
            style={{
                ...styles,
                top: (position?.top ? `${position?.top}px` : null) || styles?.top,
                right: (position?.right ? `${position?.right}px` : null) || styles?.right,
                bottom: (position?.bottom ? `${position?.bottom}px` : null) || styles?.bottom,
                left: (position?.left ? `${position?.left}px` : null) || styles?.left,
            }}
            onClick={onClick}
        >
            <div className="floating-action-btn__content">{content}</div>
        </button>
    )
}