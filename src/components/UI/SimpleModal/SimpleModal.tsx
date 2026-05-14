import { CSSProperties } from "react";
import "./SimpleModal.css";

interface SimpleModalButton {
    text?: string;
    className?: string;
    style?: CSSProperties;
    onClick?: () => void;
}

interface SimpleModalStyles {
    modal?: CSSProperties;
    title?: CSSProperties;
    messagebox?: CSSProperties;
}

export default function SimpleModal({ title, message, buttons, styles }: {
    title: string;
    message?: string;
    buttons?: SimpleModalButton[];
    styles?: SimpleModalStyles;
}) {
    return (
        <div className="simple-modal__overlay">
            <div className="simple-modal" style={styles?.modal}>
                <div className="simple-modal__header">
                    <h1 className="simple-modal__title" style={styles?.title}>{title}</h1>
                </div>
                <div className="simple-modal__messagebox" style={styles?.messagebox}>{message}</div>
                <div className="simple-modal__buttons">
                    {buttons?.map((btn, idx) => (
                        <button
                            className={`simple-modal__button ${btn.className}`}
                            key={idx}
                            onClick={btn.onClick}
                        >{btn.text}</button>
                    ))}
                </div>
            </div>
        </div>
    );
}