
import { CSSProperties, ReactNode } from "react";
import "./ErrorBlock.css";

export default function ErrorBlock({
    displayError,
    children,
    text,
    styles,
    className
}: {
    displayError?: boolean | null;
    children?: ReactNode;
    text?: string;
    styles?: CSSProperties;
    className?: string;
}) {
    return (
        <div className={`error-block ${className ?? ""} ${displayError ? 'error-display' : ''}`} style={styles}>
            <div className="error-block__content">{children}</div>
            {displayError && (
                <div className="error-block__infobox">
                    {text}
                </div>
            )}
        </div>
        // <div className={`error-block ${className ?? ""}`} style={styles}>{text}</div>
    )
}