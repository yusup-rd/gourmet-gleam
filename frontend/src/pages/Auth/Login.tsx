import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import ResetModal from "../../components/ResetModal";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailForReset, setEmailForReset] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [sendingOTP, setSendingOTP] = useState(false);
    const [showEmailInput, setShowEmailInput] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        axios.defaults.withCredentials = true;
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:5000/login", {
                email,
                password,
            });
            console.log(response.data);
            navigate("/");
        } catch (error) {
            setError("Login failed. Please check your credentials.");
        }
    };

    const handleForgotPassword = async () => {
        setShowEmailInput(true);
    };

    const handlePasswordReset = async () => {
        try {
            setSendingOTP(true);
            await axios.post("http://localhost:5000/password-reset", {
                email: emailForReset,
            });
            setSuccessMessage("OTP sent to your email. Please check your inbox.");
            setShowResetModal(true);
        } catch (error) {
            setError("Failed to send OTP. Please try again.");
        } finally {
            setSendingOTP(false);
        }
    };

    const handleResetModalClose = () => {
        setShowResetModal(false); 
        setSuccessMessage("");
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <div>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="on"
                    />
                </div>
                <div>
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="on"
                    />
                </div>
                <button type="submit">Login</button>
            </form>
            <Link to="/register">Create new account</Link>
            <br />
            {!showEmailInput && <button onClick={handleForgotPassword}>Forgot Password</button>}
            {showEmailInput && (
                <div>
                    <input
                        type="email"
                        placeholder="Email for Password Reset"
                        value={emailForReset}
                        onChange={(e) => setEmailForReset(e.target.value)}
                        autoComplete="on"
                    />
                    <button onClick={handlePasswordReset}>Send OTP</button>
                </div>
            )}
            {sendingOTP && <div>Please wait...</div>}
            {error && <div>{error}</div>}
            {successMessage && <div>{successMessage}</div>}
            {showResetModal && (
                <ResetModal
                    onClose={handleResetModalClose}
                    email={emailForReset}
                />
            )}
        </div>
    );
};

export default Login;
