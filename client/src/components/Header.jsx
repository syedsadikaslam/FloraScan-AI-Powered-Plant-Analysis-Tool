import { Link } from "react-router-dom";
import { useContext, useState, useRef, useEffect } from "react";
import AuthContext from "../context/AuthContext";

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="logo">
          <i className="fa-solid fa-leaf"></i>
          <span> FloraScan</span>
        </Link>
        <nav className="nav-links">
          <Link to="/">Home</Link>

          {user ? (
            <div className="user-menu-container" ref={menuRef} style={{ position: 'relative', marginLeft: '20px' }}>
              <div
                className="user-profile-trigger"
                onClick={() => setShowMenu(!showMenu)}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {user.avatar ? <img src={user.avatar} alt="avatar" className="avatar-small" /> : <i className="fa-solid fa-user-circle" style={{ fontSize: '28px', color: '#6cff95' }}></i>}
                <span className="user-name">{user.name}</span>
                <i className={`fa-solid fa-chevron-${showMenu ? 'up' : 'down'}`} style={{ fontSize: '12px', color: '#aaa' }}></i>
              </div>

              {showMenu && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <strong>{user.name}</strong>
                    <small>{user.email}</small>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link to="/history" onClick={() => setShowMenu(false)}>
                    <i className="fa-solid fa-clock-rotate-left"></i> History
                  </Link>
                  <button onClick={() => { logout(); setShowMenu(false); }} className="dropdown-item logout">
                    <i className="fa-solid fa-sign-out-alt"></i> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="login-link" style={{ marginLeft: '20px' }}>
              <i className="fa-solid fa-user"></i> Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
