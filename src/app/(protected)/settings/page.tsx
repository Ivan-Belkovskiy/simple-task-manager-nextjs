import LoginRegisterForm from "@/components/LoginRegisterForm/LoginRegisterForm";
import "./page.css";
import AccountSettings from "@/components/AccountSettings/AccountSettings";
import { getCurrentUser } from "@/app/actions/users/session";
import { redirect } from "next/navigation";

export default async function AccountSettingsPage() {

    const userData = await getCurrentUser();

    if (!userData) return redirect('/login');

    return (
        <div className="account-settings-page">
            <AccountSettings userData={userData} />
        </div>
    )
}