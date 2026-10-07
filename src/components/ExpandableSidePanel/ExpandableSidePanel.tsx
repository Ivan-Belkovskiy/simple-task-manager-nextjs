'use client';

import { usePathname, useRouter } from "next/navigation";
import { AppNavigationElement, AppNavigationMain } from "../AppNavigation/AppNavigation";
import "./ExpandableSidePanel.css";
import { AppAccount } from "@/types/data";

export interface ExpandableSidePanelProps {
    isOpened: boolean;
    elements: AppNavigationMain;

    currentUrl?: string;
    setCurrentUrl?: (data: string) => void;

    userData?: AppAccount;

    setLogoutModal: (data: boolean) => void;

    onClose?: () => void;
}

export default function ExpandableSidePanel({ elements, isOpened, currentUrl, setCurrentUrl, userData, setLogoutModal, onClose }: ExpandableSidePanelProps) {

    const pageUrl = usePathname();

    const router = useRouter();

    const renderElements = (section: "left" | "middle" | "right", elements?: AppNavigationMain) => {
            if (elements) return (elements)[section]?.map((el, idx) => {
                // if (el.type === 'app-logo') return (
                //     <h1 className={`app-navigation-element app-logo ${el.displayOnDevice ? `--${el.displayOnDevice}-only` : ''}`} key={idx}>Менеджер Задач 2.0</h1>
                // );
    
                if (el.type === 'button') return (
                    <button
                        key={idx}
                        className={`${(el.isLink) ? `expandable-panel-element expandable-panel__button ${(el.urlType === 'in-app' ? (el.linkUrl === currentUrl) : (pageUrl === el.linkUrl)) ? 'current-url' : ''}` : "expandable-panel-element expandable-panel__button"} `}
                        onClick={() => {
                            if (el.isLink && el.linkUrl) {
                                if (el.urlType === 'page-path') {
                                    router.push(el.linkUrl);
                                } else setCurrentUrl?.(el.linkUrl);
                            } else if (!el.isLink) el.onClick?.();
                            onClose?.();
                        }}
                    >{el.textContent}</button>
                );
    
                if (el.type === 'profile-button') return (
                    <>
                        <button
                            key={idx}
                            className={`expandable-panel-element expandable-panel__button profile-button ${pageUrl.startsWith('/settings') ? 'current-url' : ''}`}
                            onClick={() => {
                                router.push('/settings');
                                onClose?.();
                            }}
                        >
                            <span>{userData?.username}</span>
                            <span className="profile-button__label">[Настройки]</span>
                            {/* <div className="profile-button__preview"></div> */}
                        </button>
                        <button
                            key={(idx + 1)}
                            className={`expandable-panel-element expandable-panel__button profile-button`}
                            onClick={() => setLogoutModal(true)}
                        >
                            Выйти
                            {/* <span className="profile-button__label">Выйти</span> */}
                            {/* <div className="profile-button__preview"></div> */}
                        </button>
                    </>
                );
    
                if (el.type === 'mobile-menu-button') return null;
            });
        }

    return (
        <div className="expandable-side-panel__overlay">
            <div className={`expandable-side-panel ${isOpened ? 'opened' : ''}`}>
                <div className="expandable-side-panel__main">
                    <div className="expandable-side-panel-elements">
                        {renderElements('left', elements)}
                        {renderElements('middle', elements)}
                    </div>
                </div>
                <div className="expandable-side-panel__bottom">
                    <div className="expandable-side-panel-elements">
                        {renderElements('right', elements)}
                    </div>
                </div>
            </div>
        </div>
    );
}