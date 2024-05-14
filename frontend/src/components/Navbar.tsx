import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { FiMenu } from "react-icons/fi";
import { logout } from "../pages/Auth/authApi";
import Logo from "../assets/navbar/logo.svg";

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: '#1E1E1E'}}>
            <NavLink to="/" className="navbar-brand">
                <img src={Logo} alt="Gourmet Gleam Logo" height="50" />
            </NavLink>
            <button
                className="navbar-toggler"
                type="button"
                data-toggle="collapse"
                data-target="#navbarNav"
                aria-controls="navbarNav"
                aria-expanded="false"
                aria-label="Toggle navigation"
            >
                <FiMenu />
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav">
                    <li className="nav-item">
                        <NavLink to="/" className={`dropdown-item ${isActive("/") ? "active" : ""}`}>
                            Home
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to="/recommendations" className={`dropdown-item ${isActive("/recommendations") ? "active" : ""}`}>
                            Recommendations
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to="/profile" className={`dropdown-item ${isActive("/profile") ? "active" : ""}`}>
                            My Profile
                        </NavLink>
                    </li>
                    <li className="nav-item d-lg-none"> 
                        <span className="dropdown-item" onClick={handleLogout} style={{backgroundColor: '#FF4D4F', cursor: 'pointer', margin: '10px 0px'}}>
                            Logout
                        </span>
                    </li>
                </ul>
            </div>
            <div className="navbar-nav ml-auto d-none d-lg-block"> 
                <span className="nav-item dropdown-item" onClick={handleLogout} style={{backgroundColor: '#FF4D4F', cursor: 'pointer'}}>
                    Logout
                </span>
            </div>
        </nav>
    );
};

export default Navbar;
