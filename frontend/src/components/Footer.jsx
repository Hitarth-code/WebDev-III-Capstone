import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>© {new Date().getFullYear()} StayEasy - Hotel Room Booking System</p>
      </div>
    </footer>
  );
};

export default Footer;
