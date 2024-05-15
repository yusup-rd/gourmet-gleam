import React, { useState } from "react";
import axios from "axios";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import cookiesSvg from "../../assets/bg/cookies.svg";
import pancakesSvg from "../../assets/bg/pancakes.svg";
import burgerSvg from "../../assets/bg/burger.svg";
import wrapSvg from "../../assets/bg/wrap.svg";
import "./auth.css";

const StyledContainer = styled.div`
    height: 100vh;
    overflow: hidden;
`;

const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        try {
            const response = await axios.post(
                "http://localhost:5000/register",
                {
                    name,
                    email,
                    password,
                }
            );
            console.log(response.data);
            navigate("/login");
        } catch (error) {
            setError("Registration failed. Please try again later.");
        }
    };

    const handleInputChange = (
        setter: React.Dispatch<React.SetStateAction<string>>,
        value: string
    ) => {
        setter(value);
        if (error) setError("");
    };

    return (
        <StyledContainer className="d-flex flex-column justify-content-center align-items-center position-relative">
            {error && (
                <div className="error-message-container">
                    <div className="text-danger">{error}</div>
                </div>
            )}
            <div className="card-container position-relative">
                <div className="card p-4 d-flex flex-column justify-content-center">
                    <h2 className="mb-4 text-center title">Register</h2>
                    <form onSubmit={handleRegister}>
                        <div className="mt-0">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Name"
                                value={name}
                                onChange={(e) =>
                                    handleInputChange(setName, e.target.value)
                                }
                                autoComplete="on"
                            />
                        </div>
                        <div className="my-3">
                            <input
                                type="email"
                                className="form-control"
                                placeholder="Email"
                                value={email}
                                onChange={(e) =>
                                    handleInputChange(setEmail, e.target.value)
                                }
                                autoComplete="on"
                            />
                        </div>
                        <div className="my-3">
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Password"
                                value={password}
                                onChange={(e) =>
                                    handleInputChange(
                                        setPassword,
                                        e.target.value
                                    )
                                }
                                autoComplete="on"
                            />
                        </div>
                        <div className="my-3">
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) =>
                                    handleInputChange(
                                        setConfirmPassword,
                                        e.target.value
                                    )
                                }
                                autoComplete="on"
                            />
                        </div>
                        <div className="mt-4 d-flex justify-content-center">
                            <button type="submit" className="btn btn-login">
                                Register
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
                    <Link to="/login">Already have an account</Link>
                </div>
            </div>
        </StyledContainer>
    );
};

export default Register;
