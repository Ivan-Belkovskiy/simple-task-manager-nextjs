import { CSSProperties, ReactNode } from "react";
import "./SimpleModal.css";

interface SimpleModalButton {
    text?: string;
    className?: string;
    style?: CSSProperties;
    disabled?: boolean;
    onClick?: () => void;
}

interface SimpleModalStyles {
    modal?: CSSProperties;
    title?: CSSProperties;
    content?: CSSProperties;
}

export default function SimpleModal({ title, children, buttons, styles }: {
    title: string;
    children?: ReactNode;
    buttons?: SimpleModalButton[];
    styles?: SimpleModalStyles;
}) {
    return (
        <div className="simple-modal__overlay">
            <div className="simple-modal" style={styles?.modal}>
                <div className="simple-modal__header">
                    <h1 className="simple-modal__title" style={styles?.title}>{title}</h1>
                </div>
                <div className="simple-modal__content" style={styles?.content}>{children}</div>
                <div className="simple-modal__buttons">
                    {buttons?.map((btn, idx) => (
                        <button
                            className={`simple-modal__button ${btn.className}`}
                            disabled={btn.disabled}
                            key={idx}
                            onClick={btn.onClick}
                        >{btn.text}</button>
                    ))}
                </div>
            </div>
        </div>
    );
}