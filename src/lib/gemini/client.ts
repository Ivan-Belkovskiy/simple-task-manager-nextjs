import 'server-only';
import { GoogleGenAI } from '@google/genai';

const API_KEYS = [
    process.env.GEMINI_API_KEY_01,
    process.env.GEMINI_API_KEY_02,
].filter((k): k is string => typeof k === 'string' && k.length > 0);

if (API_KEYS.length === 0) {
    throw new Error('Не задан ни один GEMINI_API_KEY_* в переменных окружения');
}

let currentIndex = 0;

export function getNextApiKey(): string {
    const key = API_KEYS[currentIndex];
    currentIndex = (currentIndex + 1) % API_KEYS.length;
    return key;
}

export function getKeysCount(): number {
    return API_KEYS.length;
}

export function createClient(apiKey: string): GoogleGenAI {
    return new GoogleGenAI({ apiKey });
}