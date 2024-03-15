import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    
    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        axios.defaults.withCredentials = true;
        e.preventDefault();
        try {
            const response = await axios.post(
                "http://localhost:5000/login",
                {
                    email,
                    password,
                }
            );
            console.log(response.data);
            navigate("/");
        } catch (error) {
            setError("Login failed. Please check your credentials.");
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
            {error && <div>{error}</div>}
        </div>
    );
};

export default Login;
