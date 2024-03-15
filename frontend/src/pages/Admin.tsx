import { useEffect } from "react";
import { isAuthenticated, logout } from "../authApi";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  
  const navigate = useNavigate();
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    }
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
  )
}

export default Admin