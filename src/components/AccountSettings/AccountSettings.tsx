// import { app_accounts } from "@prisma/client";
import "./AccountSettings.css";
import { AppAccount } from "@/types/data";

export default function AccountSettings({ userData }: { userData: AppAccount }) {
    return (
        <div className="account-settings">
            <h1 className="account-settings__title">Настройки аккаунта</h1>
            <div className="account-settings__content">

            </div>
        </div>
    )
}