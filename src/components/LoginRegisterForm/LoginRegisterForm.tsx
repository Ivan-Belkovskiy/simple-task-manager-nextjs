'use client';

import { useEffect, useMemo, useState } from 'react';
import './LoginRegisterForm.css';
import AnimatedLoader from '../UI/AnimatedLoader/AnimatedLoader';
import { loginUser, registerUser } from "@/app/actions/users/users";
import type { UserLoginData, UserRegisterData } from "@/types/auth";

type FormType = 'login' | 'register';

type FormData =
    | { type: 'login'; login: string; password: string }
    | { type: 'register'; username: string; login: string; password: string; repeatPassword: string };

const FORM_META: Record<FormType, { title: string; submitText: string }> = {
    login: { title: 'Вход в систему', submitText: 'Войти' },
    register: { title: 'Создание аккаунта', submitText: 'Создать аккаунт' },
};

const EMPTY_DATA: Record<FormType, FormData> = {
    login: { type: 'login', login: '', password: '' },
    register: { type: 'register', username: '', login: '', password: '', repeatPassword: '' },
};

export default function LoginRegisterForm({ type = 'login' }: { type?: FormType }) {
    const [data, setData] = useState<FormData>(() => EMPTY_DATA[type]);
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        setData(EMPTY_DATA[type]);
        setError(null);
    }, [type]);

    const meta = FORM_META[type];

    const update = (patch: Partial<FormData>) =>
        setData(prev => ({ ...prev, ...patch } as FormData));

    const validate = (): string | null => {
        if (!data.login.trim()) return 'Введите логин';
        if (!data.password) return 'Введите пароль';

        if (data.type === 'register') {
            if (!data.username.trim()) return 'Введите имя пользователя';
            if (data.password.length < 6) return 'Пароль должен быть не короче 6 символов';
            if (data.password !== data.repeatPassword) return 'Пароли не совпадают';
        }
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setError(null);
        setLoading(true);

        try {
            const result = data.type === 'login'
                ? await loginUser({ login: data.login, password: data.password })
                : await registerUser(data);

            if (!result.success) {
                setError(result.error);
            }
        } catch (err) {
            console.error(err);
            // setError('Ошибка соединения');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="login-register-form" onSubmit={handleSubmit} noValidate>
            <h1 className="login-register-form__title">{meta.title}</h1>

            <div className="login-register-form__content">
                {data.type === 'register' && (
                    <div className="login-register-form__block">
                        <label htmlFor="username" className="login-register-form__label">
                            Имя пользователя / аккаунта:
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            className="login-register-form__input"
                            autoComplete="nickname"
                            value={data.username}
                            onChange={e => update({ username: e.target.value })}
                            disabled={isLoading}
                        />
                    </div>
                )}

                <div className="login-register-form__block">
                    <label htmlFor="login" className="login-register-form__label">Логин:</label>
                    <input
                        id="login"
                        name="login"
                        type="text"
                        className="login-register-form__input"
                        autoComplete="username"
                        value={data.login}
                        onChange={e => update({ login: e.target.value })}
                        disabled={isLoading}
                    />
                </div>

                <div className="login-register-form__block">
                    <label htmlFor="password" className="login-register-form__label">Пароль:</label>
                    {/* <div className="login-register-form__password-wrapper"> */}
                    <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        className="login-register-form__input"
                        autoComplete={data.type === 'login' ? 'current-password' : 'new-password'}
                        value={data.password}
                        onChange={e => update({ password: e.target.value })}
                        disabled={isLoading}
                    />
                    <button
                        type="button"
                        className="login-register-form__button inline-btn"
                        onClick={() => setShowPassword(p => !p)}
                        aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                    >
                        {showPassword ? '^' : '_'}
                    </button>
                    {/* </div> */}
                </div>

                {data.type === 'register' && (
                    <div className="login-register-form__block">
                        <label htmlFor="repeatPassword" className="login-register-form__label">
                            Повторить пароль:
                        </label>
                        <input
                            id="repeatPassword"
                            name="repeatPassword"
                            type={showPassword ? 'text' : 'password'}
                            className="login-register-form__input"
                            autoComplete="new-password"
                            value={data.repeatPassword}
                            onChange={e => update({ repeatPassword: e.target.value })}
                            disabled={isLoading}
                        />
                    </div>
                )}

                {error && (
                    <div role="alert" className="login-register-form__error">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    className="login-register-form__button"
                    disabled={isLoading}
                    aria-busy={isLoading}
                >
                    {isLoading && <AnimatedLoader color="#fff" />}
                    <span>{meta.submitText}</span>
                </button>
            </div>
        </form>
    );
}