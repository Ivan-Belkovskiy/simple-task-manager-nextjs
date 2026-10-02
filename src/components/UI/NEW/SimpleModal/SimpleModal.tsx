'use client';

import { useEffect, useState } from "react";
import "./SimpleModal.css";
import AnimatedLoader from "../../AnimatedLoader/AnimatedLoader";

export type SimpleModalType = "info" | "confirm" | "prompt" | "progress";

export type SimpleModalProps = {
    type: "progress";
    title?: string;
    message?: string;

    current: number;
    all: number;

    displayPercent?: boolean;

} | {
    type: "info";
    title?: string;
    message?: string;

    disableButtons?: boolean;

    confirmBtnText?: string;

    onConfirm?: () => void;
    // onCancel?: () => void;
} | {
    type: "confirm";
    title?: string;
    message?: string;

    disableButtons?: boolean;

    confirmBtnText?: string;
    cancelBtnText?: string;

    onConfirm?: () => void;
    onCancel?: () => void;
} | {
    type: "prompt";
    title?: string;
    message?: string;

    disableButtons?: boolean;

    confirmBtnText?: string;
    cancelBtnText?: string;

    inputPlaceholder?: string;

    onConfirm?: (value: string) => void;
    onCancel?: () => void;
};

export default function SimpleModal(props: SimpleModalProps) {

    const [inputValue, setInputValue] = useState('');

    return (
        <div className="simple-modal-new__overlay">
            <div className="simple-modal-new">
                <div className="simple-modal-new__main">
                    <h1 className="simple-modal-new__title">{props.title || "Модальное окно"}</h1>
                </div>
                {/* <div className="simple-modal-new__buttons"></div> */}
                {(props.type === 'progress') ? (
                    <>
                        <div className="simple-modal-new__content">
                            <p className="simple-modal-new__message">{props.message}</p>
                            <div className="simple-modal-new__loading-container">
                                <AnimatedLoader />
                                <div className="simple-modal-new__progress-container">
                                    <div className="simple-modal-new__progressbar-base">
                                        <div className="simple-modal-new__progressbar-main"></div>
                                    </div>
                                    <span className="simple-modal-new__progress-text">{props.current} / {props.all} ({Math.floor(props.current / (props.all / 100))}%) </span>
                                </div>
                                
                            </div>
                        </div>
                    </>
                ) :
                    (props.type === "info") ? (
                        <>
                            <div className="simple-modal-new__content">
                                <p className="simple-modal-new__message">{props.message}</p>
                            </div>
                            <div className="simple-modal-new__buttons">
                                <button className="simple-modal-new__button" onClick={() => props.onConfirm?.()}>{props.confirmBtnText || "ОК"}</button>
                            </div>
                        </>
                    ) : (props.type === "confirm") ? (
                        <>
                            <div className="simple-modal-new__content">
                                <p className="simple-modal-new__message">{props.message}</p>
                            </div>
                            <div className="simple-modal-new__buttons">
                                <button className="simple-modal-new__button" onClick={() => props.onConfirm?.()}>{props.confirmBtnText || "ОК"}</button>
                                <button className="simple-modal-new__button" onClick={() => props.onCancel?.()}>{props.cancelBtnText || "Отмена"}</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="simple-modal-new__content">
                                <p className="simple-modal-new__message">{props.message}</p>
                                <input
                                    type="text"
                                    className="simple-modal-new__input"
                                    placeholder={props.inputPlaceholder}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="simple-modal-new__buttons">
                                <button disabled={props.disableButtons} className="simple-modal-new__button" onClick={() => props.onConfirm?.(inputValue)}>{props.confirmBtnText || "ОК"}</button>
                                <button disabled={props.disableButtons} className="simple-modal-new__button" onClick={() => props.onCancel?.()}>{props.cancelBtnText || "Отмена"}</button>
                            </div>
                        </>
                    )}
            </div>
        </div>
    )
}