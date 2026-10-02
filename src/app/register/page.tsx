import LoginRegisterForm from "@/components/LoginRegisterForm/LoginRegisterForm";
import "./page.css";

export default function RegisterPage() {
    return (
        <div className="register-page">
            <LoginRegisterForm type="register" />
        </div>
    )
}