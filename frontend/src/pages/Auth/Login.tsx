import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailForReset, setEmailForReset] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [showEmailInput, setShowEmailInput] = useState(false); // State to track whether to show the email input
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
        setShowEmailInput(true); // Show the email input when user clicks on Forgot Password
    };

    const handlePasswordReset = async () => {
        try {
            await axios.post("http://localhost:5000/password-reset", {
                email: emailForReset, // Corrected here
            });
            console.log("Email sent to backend is: ", emailForReset); // Also corrected here
            setSuccessMessage("OTP sent to your email. Please check your inbox.");
        } catch (error) {
            setError("Failed to send OTP. Please try again.");
        }
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
            {/* Show the input only when the user clicks on Forgot Password */}
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
            {error && <div>{error}</div>}
            {successMessage && <div>{successMessage}</div>}
        </div>
    );
};

export default Login;
