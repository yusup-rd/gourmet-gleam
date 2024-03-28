import { Link, useNavigate } from "react-router-dom";
import { RxAvatar } from "react-icons/rx";
import { logout } from "../pages/Auth/authApi";

const Navbar = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <Link to="/" className="navbar-brand">
                Gourmet Gleam
            </Link>
            <button
                className="navbar-toggler"
                type="button"
                data-toggle="collapse"
                data-target="#navbarNav"
                aria-controls="navbarNav"
                aria-expanded="false"
                aria-label="Toggle navigation"
            >
                <RxAvatar />
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav">
                    <li className="nav-item">
                        <Link to="/" className="dropdown-item">
                            Home
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/profile" className="dropdown-item">
                            My Profile
                        </Link>
                    </li>
                    <li className="nav-item">
                        <span className="dropdown-item" onClick={handleLogout}>
                            Logout
                        </span>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
