import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated, isManager } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          🏨 StayEasy
        </Link>

        <div className="navbar-links">
          <Link to="/" className="nav-link">
            Explore Hotels
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/my-bookings" className="nav-link">
                My Bookings
              </Link>

              {isManager && (
                <>
                  <Link to="/manage-hotels" className="nav-link">
                    Manage Hotels
                  </Link>
                  <Link to="/manage-rooms" className="nav-link">
                    Manage Rooms
                  </Link>
                  <Link to="/reports" className="nav-link">
                    Reports
                  </Link>
                </>
              )}

              <div className="user-badge">
                <span>{user.name}</span>
                <span className="role-tag">{user.role.replace('_', ' ')}</span>
              </div>

              <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
