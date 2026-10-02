'use server';

import { COOKIE_NAME } from '@/lib/constants';
import { signJWT } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import type { UserLoginData, UserRegisterData, AuthResult } from '@/types/auth';

const SESSION_EXPIRATION = 7 * 24 * 60 * 60;

export async function loginUser(
    data: UserLoginData,
    noRedirect = false,
): Promise<AuthResult> {
    if (!data.login?.trim() || !data.password) {
        return { success: false, error: 'Заполните все поля' };
    }

    try {
        const user = await prisma.app_accounts.findUnique({
            where: { login: data.login.trim() },
        });

        if (!user) {
            return { success: false, error: 'Неверный логин или пароль' };
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.password_hash);
        if (!isPasswordValid) {
            return { success: false, error: 'Неверный логин или пароль' };
        }

        const token = await signJWT({
            userId: user.id,
            login: user.login,
            accessLevel: 'USER', 
            sessionId: crypto.randomUUID(),
        });

        const cookieStore = await cookies();
        cookieStore.set(COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: SESSION_EXPIRATION,
            path: '/',
            sameSite: 'lax',
        });
    } catch (error) {
        console.error('Ошибка авторизации:', error);
        return { success: false, error: 'Что-то пошло не так' };
    }

    if (!noRedirect) redirect('/');
    return { success: true };
}

export async function logoutUser(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
    redirect('/login');
}

export async function registerUser(data: UserRegisterData): Promise<AuthResult> {
    if (!data.username?.trim() || !data.login?.trim() || !data.password) {
        return { success: false, error: 'Заполните все поля' };
    }
    if (data.password !== data.repeatPassword) {
        return { success: false, error: 'Пароли не совпадают' };
    }
    if (data.password.length < 6) {
        return { success: false, error: 'Пароль должен быть не короче 6 символов' };
    }

    const userExists = await prisma.app_accounts.findUnique({
        where: { login: data.login.trim() },
    });
    if (userExists) {
        return { success: false, error: 'Такой пользователь уже существует!' };
    }

    try {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        await prisma.app_accounts.create({
            data: {
                username: data.username.trim(),
                login: data.login.trim(),
                password_hash: hashedPassword,
            },
        });
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        return { success: false, error: 'Ошибка регистрации' };
    }

    await loginUser({ login: data.login.trim(), password: data.password }, true);
    redirect('/');
}