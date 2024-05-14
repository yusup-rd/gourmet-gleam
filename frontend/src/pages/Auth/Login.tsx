import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import ResetModal from "../../components/ResetModal";
import cookiesSvg from "../../assets/bg/cookies.svg";
import pancakesSvg from "../../assets/bg/pancakes.svg";
import burgerSvg from "../../assets/bg/burger.svg";
import wrapSvg from "../../assets/bg/wrap.svg";

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

    const handleLogin = async (e: any) => {
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

    const handleForgotPassword = () => {
        setShowEmailInput((prevShowEmailInput) => !prevShowEmailInput);
    };

    const handlePasswordReset = async () => {
        try {
            setSendingOTP(true);
            await axios.post("http://localhost:5000/password-reset", {
                email: emailForReset,
            });
            setSuccessMessage(
                "OTP sent to your email. Please check your inbox."
            );
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
        <div
            className="container d-flex flex-column justify-content-center align-items-center position-relative"
            style={{ height: "100vh" }}
        >
            <div className="card-container position-relative">
                <div className="card p-4 d-flex flex-column justify-content-center">
                    <h2 className="mb-4 text-center title">Login</h2>
                    <form onSubmit={handleLogin}>
                        <div className="mt-0">
                            <input
                                type="email"
                                className="form-control"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="on"
                            />
                        </div>
                        <div className="my-3">
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="on"
                            />
                        </div>
                        <div className="mt-4 d-flex justify-content-center">
                            <button type="submit" className="btn btn-login">
                                Login
                            </button>
                        </div>
                    </form>
                </div>
                <img
                    src={cookiesSvg}
                    className="corner-img top-right"
                    alt="Cookies"
                />
                <img
                    src={pancakesSvg}
                    className="corner-img bottom-right"
                    alt="Pancakes"
                />
                <img
                    src={burgerSvg}
                    className="corner-img bottom-left"
                    alt="Burger"
                />
                <img src={wrapSvg} className="corner-img top-left" alt="Wrap" />
            </div>
            <div className="frame-container mt-3">
                <div className="text-center">
                    <Link to="/register" className="mr-3">
                        Create New Account
                    </Link>
                    <span style={{ cursor: "default", color: "white" }}>|</span>
                    <button
                        onClick={handleForgotPassword}
                        className="ml-3 btn btn-link btn-forgotpw"
                    >
                        Forgot Password
                    </button>
                </div>
            </div>

            {showEmailInput && (
                <div
                    className="mt-4"
                    style={{
                        backgroundColor: "#1E1E1E",
                        borderRadius: "10px",
                        padding: "10px",
                    }}
                >
                    <div className="d-flex flex-column align-items-start m-2">
                        {" "}
                        <input
                            type="email"
                            className="form-control mb-3"
                            placeholder="Email for Password Reset"
                            value={emailForReset}
                            onChange={(e) => setEmailForReset(e.target.value)}
                            autoComplete="on"
                            style={{ maxWidth: "100%" }}
                        />
                        <button
                            onClick={handlePasswordReset}
                            className="btn btn-otp"
                            style={{ width: "100%" }}
                        >
                            Send OTP
                        </button>
                    </div>
                </div>
            )}

            {sendingOTP && (
                <div className="text-warning my-3">Please wait...</div>
            )}
            {error && <div className="text-danger my-3">{error}</div>}
            {successMessage && (
                <div className="text-success my-3">{successMessage}</div>
            )}
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
