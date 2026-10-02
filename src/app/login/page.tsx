import LoginRegisterForm from "@/components/LoginRegisterForm/LoginRegisterForm";
import "./page.css";

export default function LoginPage() {
    return (
        <div className="login-page">
            <LoginRegisterForm type="login" />
        </div>
    )
}