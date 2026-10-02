export interface UserLoginData {
    login: string;
    password: string;
}

export interface UserRegisterData {
    username: string;
    login: string;
    password: string;
    repeatPassword: string;
}

export type AuthResult =
    | { success: true }
    | { success: false; error: string };