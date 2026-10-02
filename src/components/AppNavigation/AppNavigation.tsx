'use client';

import { usePathname, useRouter } from "next/navigation";
import "./AppNavigation.css";
import { AUTH_URLS } from "@/lib/constants";
import { app_accounts, Prisma } from "@prisma/client";
import { useState } from "react";
import SimpleModal from "../UI/NEW/SimpleModal/SimpleModal";
import { logoutUser } from "@/app/actions/users/users";

type AppNavigationElement = {
    type: "app-logo";
} | {
    type: "button";
    isLink: true;
    linkUrl: string;
    textContent: string;

    urlType?: "in-app" | "page-path";

} | {
    type: "button";
    isLink?: false;
    textContent: string;
    onClick?: () => void;
} | {
    type: "button";
    isLink?: false;
    textContent: string;
    onClick?: () => void;
} | {
    type: "profile-button";
    // isLink?: false;
    // textContent: string;
    onClick?: () => void;
}

interface AppNavigationMain {
    left?: AppNavigationElement[];
    middle?: AppNavigationElement[];
    right?: AppNavigationElement[];
}

const LOGIN_PAGE_ELEMENTS: AppNavigationMain = {
    left: [
        {
            type: "app-logo",
        }
    ],
    right: [
        {
            type: "button",
            isLink: true,
            textContent: "Войти",
            linkUrl: "/login",

            urlType: "page-path",
        },
        {
            type: "button",
            isLink: true,
            textContent: "Создать аккаунт",
            linkUrl: "/register",

            urlType: "page-path",
        }
    ]
}

const NAVIGATION_ELEMENTS: AppNavigationMain = {
    left: [
        {
            type: "app-logo",
        }
    ],
    middle: [
        {
            type: "button",
            isLink: true,
            linkUrl: '/',
            textContent: 'Мои задачи',

            urlType: 'page-path'
        },
        // {
        //     type: "button",
        //     isLink: true,
        //     linkUrl: '/settings',
        //     textContent: 'Настройки аккаунта',

        //     urlType: 'page-path',
        // },
    ],
    right: [
        {
            type: "profile-button",
            // isLink: true,
            // linkUrl: '/settings',

            // onClick: () => {}


            // textContent: 'Настройки аккаунта',

            // urlType: 'page-path',
        },
    ]
}

export default function AppNavigation({ currentUrl, setCurrentUrl, userData }: { currentUrl: string; setCurrentUrl?: (data: string) => void; userData?: Prisma.app_accountsGetPayload<{ omit: { password_hash: true } }> }) {

    // const { currentUrl, setCurrentUrl } = useAppContext();

    const pageUrl = usePathname();
    // const {}

    const router = useRouter();

    const [logoutModal, setLogoutModal] = useState(false);
    const [isLoading, setLoading] = useState(false);
    
    const renderElements = (section: "left" | "middle" | "right", elements?: AppNavigationMain) => {
        return (elements || NAVIGATION_ELEMENTS)[section]?.map((el, idx) => {
            if (el.type === 'app-logo') return (
                <h1 className="app-navigation-element app-logo" key={idx}>Менеджер Задач 2.0</h1>
            );

            if (el.type === 'button') return (
                <button
                    key={idx}
                    className={(el.isLink) ? `app-navigation-element app-navigation__button ${(el.urlType === 'in-app' ? (el.linkUrl === currentUrl) : (pageUrl === el.linkUrl)) ? 'current-url' : ''}` : "app-navigation-element app-navigation__button"}
                    onClick={() => {
                        if (el.isLink && el.linkUrl) {
                            if (el.urlType === 'page-path') {
                                router.push(el.linkUrl);
                            } else setCurrentUrl?.(el.linkUrl);
                        } else if (!el.isLink) el.onClick?.();
                    }}
                >{el.textContent}</button>
            );

            if (el.type === 'profile-button') return (
                <>
                    <button
                        key={idx}
                        className={`app-navigation-element app-navigation__button profile-button`}
                        onClick={() => {
                            router.push('/settings');
                        }}
                    >
                        <span>{userData?.username}</span>
                        <span className="profile-button__label">[Настройки]</span>
                        {/* <div className="profile-button__preview"></div> */}
                    </button>
                    <button
                        key={idx}
                        className={`app-navigation-element app-navigation__button profile-button`}
                        onClick={() => setLogoutModal(true)}
                    >
                        Выйти
                        {/* <span className="profile-button__label">Выйти</span> */}
                        {/* <div className="profile-button__preview"></div> */}
                    </button>
                </>
            )
        })
    }


    const handleLogout = async () => {
        try {
            setLoading(true);

            const res = await logoutUser();

            setLoading(false);

        } catch (error) {
            
        } finally {
            setLogoutModal(false);
        }
    };

    return (
        <div className="app-navigation">
            {(AUTH_URLS.some(url => pageUrl.startsWith(url))) ? (
                <>
                    <div className="app-navigation__left">
                        {renderElements('left', LOGIN_PAGE_ELEMENTS)}
                    </div>
                    {/* <div className="app-navigation__center --desktop-only">
                        {renderElements('middle', LOGIN_PAGE_ELEMENTS)}
                    </div> */}
                    <div className="app-navigation__right">
                        {renderElements('right', LOGIN_PAGE_ELEMENTS)}
                    </div>
                </>
            ) : (
                <>
                    <div className="app-navigation__left --desktop-only">
                        {renderElements('left')}
                        {/* <h1 className="app-navigation-element app-logo">Interactive Info Manager</h1> */}
                    </div>
                    <div className="app-navigation__center">
                        {renderElements('middle')}
                        {/* <button className="app-navigation-element app-navigation__button">Мои записи</button>
                <button className="app-navigation-element app-navigation__button">Настройки аккаунта</button> */}
                    </div>
                    <div className="app-navigation__right --desktop-only">
                        {renderElements('right')}
                        {/* <button className="app-navigation-element app-navigation__button">Настройки аккаунта</button> */}
                    </div>
                </>
            )
            }

            {(logoutModal) && (
                <SimpleModal
                    type="confirm"
                    title="Выйти из аккаунта?"

                    onConfirm={handleLogout}
                    onCancel={() => setLogoutModal(false)}

                    disableButtons={isLoading}
                />
            )}
        </div >
    )
}