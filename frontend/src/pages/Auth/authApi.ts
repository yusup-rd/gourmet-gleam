import axios from "axios";

export const login = async (email: string, password: string) => {
    try {
        const response = await axios.post("http://localhost:5173/login", {
            email,
            password,
        });
        return response.data;
    } catch (error) {
        throw new Error("Login failed");
    }
};

export const register = async (
    name: string,
    email: string,
    password: string
) => {
    try {
        const response = await axios.post("http://localhost:5173/register", {
            name,
            email,
            password,
        });
        return response.data;
    } catch (error) {
        throw new Error("Registration failed");
    }
};

export const logout = async () => {
    try {
        await axios.get("http://localhost:5000/logout");
    } catch (error) {
        throw new Error("Logout failed");
    }
};

export const isAuthenticated = () => {
    return document.cookie
        .split(";")
        .some((c) => c.trim().startsWith("token="));
};

export const getUserRole = async () => {
    try {
        const response = await axios.get("http://localhost:5000/user-role", {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching user role:", error);
        throw error;
    }
};

export const getUserId = async () => {
    try {
        const response = await axios.get("http://localhost:5000/user-id", {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching user ID:", error);
        throw error;
    }
};
