import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import HotelDetails from './pages/HotelDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import MyBookings from './pages/MyBookings';
import ManageHotels from './pages/ManageHotels';
import ManageRooms from './pages/ManageRooms';
import Reports from './pages/Reports';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/hotel/:id" element={<HotelDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute>
                    <MyBookings />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/manage-hotels"
                element={
                  <ProtectedRoute roles={['hotel_manager', 'admin']}>
                    <ManageHotels />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manage-rooms"
                element={
                  <ProtectedRoute roles={['hotel_manager', 'admin']}>
                    <ManageRooms />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute roles={['hotel_manager', 'admin']}>
                    <Reports />
                  </ProtectedRoute>
                }
              />

              <Route
                path="*"
                element={
                  <div style={{ textAlign: 'center', padding: '60px' }}>
                    <h2>404 - Page Not Found</h2>
                    <p style={{ color: '#6b7280', margin: '12px 0 20px' }}>
                      The page you are looking for does not exist.
                    </p>
                    <Link to="/" className="btn btn-primary">
                      Return to Home
                    </Link>
                  </div>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
