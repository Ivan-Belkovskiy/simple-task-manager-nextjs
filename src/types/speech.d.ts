export {};

declare global {
    interface SpeechRecognitionResultLike {
        readonly isFinal: boolean;
        readonly length: number;
        [index: number]: { transcript: string; confidence: number };
    }

    interface SpeechRecognitionResultListLike {
        readonly length: number;
        [index: number]: SpeechRecognitionResultLike;
    }

    interface SpeechRecognitionEventLike extends Event {
        readonly resultIndex: number;
        readonly results: SpeechRecognitionResultListLike;
    }

    interface SpeechRecognitionErrorEventLike extends Event {
        readonly error: string;
        readonly message: string;
    }

    interface SpeechRecognitionLike extends EventTarget {
        continuous: boolean;
        interimResults: boolean;
        lang: string;
        maxAlternatives: number;
        start(): void;
        stop(): void;
        abort(): void;
        onaudiostart: ((this: SpeechRecognitionLike, ev: Event) => void) | null;
        onaudioend:   ((this: SpeechRecognitionLike, ev: Event) => void) | null;
        onend:        ((this: SpeechRecognitionLike, ev: Event) => void) | null;
        onerror:      ((this: SpeechRecognitionLike, ev: SpeechRecognitionErrorEventLike) => void) | null;
        onresult:     ((this: SpeechRecognitionLike, ev: SpeechRecognitionEventLike) => void) | null;
        onstart:      ((this: SpeechRecognitionLike, ev: Event) => void) | null;
    }

    interface SpeechRecognitionConstructor {
        new (): SpeechRecognitionLike;
    }

    interface Window {
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
    }

    SpeechRecognitionEvent
}