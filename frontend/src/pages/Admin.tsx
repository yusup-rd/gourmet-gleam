import { useEffect } from "react";
import { getUserRole, isAuthenticated, logout } from "../authApi";
import { useNavigate } from "react-router-dom";

const Admin = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!isAuthenticated()) {
                    navigate("/login");
                    return;
                }
                const userRoleResponse = await getUserRole();
                const userRole = userRoleResponse?.role;
                if (userRole !== "admin") {
                    navigate("/");
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div>
            <h1>Admin Page</h1>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default Admin;
