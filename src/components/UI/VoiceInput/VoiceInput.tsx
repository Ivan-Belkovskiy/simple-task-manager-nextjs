'use client';

import { useEffect, useRef, useState } from 'react';
import './VoiceInput.css';
import SimpleModal from '../NEW/SimpleModal/SimpleModal';
import { grantVoiceConsent, hasVoiceConsent } from './voiceConsent';

interface Props {
    onResult: (text: string) => void;
    mode?: 'replace' | 'append';
    currentValue?: string;
    language?: string;
    className?: string;
    disabled?: boolean;
    title?: string;
}

export default function VoiceInput({
    onResult,
    mode = 'replace',
    currentValue = '',
    language = 'ru-RU',
    className = '',
    disabled = false,
    title,
}: Props) {
    const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
    const startValueRef = useRef('');
    const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [listening, setListening] = useState(false);
    const [supported, setSupported] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isVoiceInpModalOpen, setVoiceInpModalOpen] = useState(false);

    // Поддержка API
    useEffect(() => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        setSupported(!!SR);
    }, []);

    // Cleanup
    useEffect(() => {
        return () => {
            recognitionRef.current?.abort();
            if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
        };
    }, []);

    // Стоп при уходе со вкладки
    useEffect(() => {
        const handleVisibility = () => {
            if (document.hidden && recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, []);

    const showError = (msg: string) => {
        setError(msg);
        if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
        errorTimerRef.current = setTimeout(() => setError(null), 3000);
    };

    const start = () => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) return;

        setError(null);

        const recognition = new SR();
        recognition.lang = language;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        startValueRef.current = currentValue;

        recognition.onstart = () => setListening(true);

        recognition.onresult = (event) => {
            let finalText = '';
            let interimText = '';

            for (let i = 0; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) finalText += result[0].transcript;
                else interimText += result[0].transcript;
            }

            const spoken = (finalText + interimText).trim();
            if (!spoken) return;

            const result = mode === 'append'
                ? [startValueRef.current, spoken].filter(Boolean).join(' ')
                : spoken;

            onResult(result);
        };

        recognition.onerror = (event) => {
            if (event.error === 'not-allowed') {
                showError('Разрешите доступ к микрофону');
            } else if (event.error === 'network') {
                showError('Проблема с сетью');
            } else if (event.error === 'audio-capture') {
                showError('Микрофон не найден');
            } else if (event.error === 'no-speech') {
                // игнорируем
            } else {
                showError('Ошибка распознавания');
            }
            setListening(false);
        };

        recognition.onend = () => setListening(false);

        try {
            recognition.start();
            recognitionRef.current = recognition;
        } catch (e) {
            console.error('Не удалось запустить распознавание:', e);
            showError('Не удалось запустить микрофон');
        }
    };

    const stop = () => {
        recognitionRef.current?.stop();
        setListening(false);
    };

    const handleClick = () => {
        if (listening) {
            stop();
            return;
        }
        if (!hasVoiceConsent()) {
            setVoiceInpModalOpen(true);
            return;
        }
        start();
    };

    const handleConfirmVoiceInput = () => {
        grantVoiceConsent();
        setVoiceInpModalOpen(false);
        // Задержка, чтобы модалка успела закрыться до запуска микрофона
        setTimeout(() => start(), 0);
    };

    if (!supported) return null;

    return (
        <>
            <div className={`voice-input ${className}`}>
                <button
                    type="button"
                    className={`voice-input__btn ${listening ? 'voice-input__btn--listening' : ''}`}
                    onClick={handleClick}
                    disabled={disabled}
                    aria-label={listening ? 'Остановить запись' : 'Начать голосовой ввод'}
                    aria-pressed={listening}
                    title={title ?? (listening ? 'Остановить запись' : 'Голосовой ввод')}
                >
                    {listening
                        ? <span className="voice-input__dot" aria-hidden />
                        : <span className="voice-input__icon" aria-hidden>🎤</span>}
                </button>
                {error && <span className="voice-input__error" role="alert">{error}</span>}
            </div>

            {isVoiceInpModalOpen && (
                <SimpleModal
                    type="confirm"
                    title="Начать голосовой ввод данных?"
                    message="Некоторые браузеры отправляют голос на сервер для распознавания."
                    confirmBtnText="Подтвердить"
                    cancelBtnText="Отмена"
                    onCancel={() => setVoiceInpModalOpen(false)}
                    onConfirm={handleConfirmVoiceInput}
                />
            )}
        </>
    );
}