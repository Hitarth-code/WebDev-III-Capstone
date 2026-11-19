# 18. StayEasy – Hotel Room Booking System

> **WebDev Capstone Project**  
> A full-stack MERN hotel booking web application where guests can search hotels by dates, check real-time room availability without date clashes, book rooms, and manage their stays. Hotel Managers and Administrators have complete CRUD control over hotels and room types, accompanied by an aggregation-powered reports dashboard tracking occupancy rates and revenue.

---

## 📋 Features Overview

- **Multi-Role User Architecture**:
  - **Guest**: Search hotels by city, check room availability by dates, reserve rooms, view booking history, and cancel active bookings.
  - **Hotel Manager**: Full CRUD over hotels and room types/rooms they manage, booking overview, and property revenue/occupancy analytics.
  - **Administrator**: System-wide oversight with full CRUD access to all hotels, rooms, bookings, and platform-wide aggregation reports.

- **Real-Time Room Availability Search**:
  - Filter rooms dynamically by check-in date, check-out date, and guest capacity.

- **Booking Clash Prevention (Date Overlap Query)**:
  - Database overlap logic: `existingBooking.checkInDate < requestedCheckOut && existingBooking.checkOutDate > requestedCheckIn` ensures double bookings are impossible.

- **Cancellation & Booking History**:
  - Guests can inspect their past and active reservations, view itemized charges, and cancel reservations.

- **Occupancy Rate & Revenue Reports using MongoDB Aggregation**:
  - Uses native MongoDB Aggregation pipelines (`$match`, `$group`, `$lookup`, `$project`, `$cond`, `$sort`) to calculate:
    - Overall revenue, room nights booked, and confirmed vs. cancelled bookings.
    - Hotel-by-hotel revenue breakdowns and average booking values.
    - Hotel occupancy rates calculated as `(roomsBooked / totalRooms) * 100`.

---

## 🛠️ Libraries & Technologies Used

### Backend
- **express**: Fast, unopinionated web framework for Node.js
- **mongoose**: Elegant MongoDB object modeling and aggregation pipelines
- **dotenv**: Environment variable management
- **bcryptjs**: Password hashing and verification
- **jsonwebtoken (JWT)**: Stateless token-based user authentication and role verification
- **cors**: Cross-Origin Resource Sharing middleware
- **nodemon**: Development server with hot reloading

### Frontend
- **react**: UI component library
- **react-router-dom**: Client-side declarative routing
- **Fetch API**: Native browser API for backend HTTP communication
- **Context API**: React state management for authentication and session persistence

---

## 📂 Project Structure

```
WebDev Capstone/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection setup
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, profile
│   │   ├── hotelController.js    # Hotel CRUD and city search
│   │   ├── roomController.js     # Room CRUD & date overlap availability
│   │   ├── bookingController.js  # Booking creation, history, cancellation
│   │   └── reportController.js   # MongoDB aggregation reports
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT verification & role authorization
│   ├── models/
│   │   ├── User.js               # User schema (roles: guest, manager, admin)
│   │   ├── Hotel.js              # Hotel schema
│   │   ├── Room.js               # Room schema (Standard, Deluxe, Suite, etc.)
│   │   └── Booking.js            # Booking schema with status & date ranges
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth routes
│   │   ├── hotelRoutes.js        # /api/hotels routes
│   │   ├── roomRoutes.js         # /api/rooms routes
│   │   ├── bookingRoutes.js      # /api/bookings routes
│   │   └── reportRoutes.js       # /api/reports routes
│   ├── .env.example              # Sample environment configuration
│   ├── package.json              # Backend dependencies
│   ├── seed.js                   # Database seeder with sample data
│   └── server.js                 # Express server entry point
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Navigation with role links & profile pill
│   │   │   ├── Footer.jsx        # Footer component
│   │   │   └── ProtectedRoute.jsx# Auth & role guard
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Authentication context & persistent state
│   │   ├── pages/
│   │   │   ├── Home.jsx          # Hotel explore & date search banner
│   │   │   ├── HotelDetails.jsx  # Room availability list & booking modal
│   │   │   ├── Login.jsx         # User login with one-click demo credentials
│   │   │   ├── Register.jsx      # Account registration with role selection
│   │   │   ├── MyBookings.jsx    # Guest booking history & cancellation
│   │   │   ├── ManageHotels.jsx  # Hotel Manager / Admin hotel CRUD
│   │   │   ├── ManageRooms.jsx   # Hotel Manager / Admin room CRUD
│   │   │   └── Reports.jsx       # Aggregation analytics dashboard
│   │   ├── services/
│   │   │   └── api.js            # Fetch API helper functions
│   │   ├── App.jsx               # React Router layout
│   │   ├── index.css             # Beginner-friendly styling
│   │   └── main.jsx              # React DOM render entry
│   ├── index.html                # HTML template
│   ├── package.json              # Frontend dependencies
│   └── vite.config.js            # Vite configuration with API proxy
├── .gitignore                    # Git ignore file
├── package.json                  # Root runner scripts
└── README.md                     # Documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB instance running on `mongodb://127.0.0.1:27017` or a MongoDB Atlas connection string.

### 2. Clone the Repository
```bash
git clone https://github.com/Hitarth-code/WebDev-III-Capstone.git
cd WebDev-III-Capstone
```

### 3. Install Dependencies
```bash
# Install root, backend, and frontend packages:
npm run install:all
```
*(Or navigate to `backend/` and `frontend/` and run `npm install` in each)*

### 4. Configure Environment Variables
Inside `backend/`, copy `.env.example` to `.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/stayeasy
JWT_SECRET=stayeasy_secret_key_12345
NODE_ENV=development
```

### 5. Seed Sample Data (Hotels, Rooms, Bookings, Users)
Run the seeder script to populate MongoDB with test hotels across Mumbai, Delhi, and Bengaluru:
```bash
npm run seed
```

### 6. Run the Application
In separate terminal windows (or using root script):
```bash
# Start Backend API (Port 5000)
npm run server

# Start Frontend (Port 3000)
npm run client
```
Open your browser at `http://localhost:3000`.

---

## 🔑 Demo Login Credentials

The seed script creates three accounts for evaluation:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Guest** | `guest@stayeasy.com` | `password123` | Search, book rooms, cancel bookings |
| **Hotel Manager** | `manager@stayeasy.com` | `password123` | CRUD for managed hotels & rooms, view reports |
| **Admin** | `admin@stayeasy.com` | `password123` | Full system control across all properties |

*(You can also click the quick-fill buttons directly on the Login page).*

---

## 📡 API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create user account
- `POST /api/auth/login` - User login & receive JWT
- `GET /api/auth/profile` - Current user details (Protected)

### Hotels (`/api/hotels`)
- `GET /api/hotels` - List hotels (supports `?city=` and `?search=`)
- `GET /api/hotels/:id` - Get single hotel details
- `GET /api/hotels/manager/my-hotels` - List hotels managed by user (Manager / Admin)
- `POST /api/hotels` - Add a hotel (Manager / Admin)
- `PUT /api/hotels/:id` - Edit a hotel (Manager / Admin)
- `DELETE /api/hotels/:id` - Delete a hotel and its rooms (Manager / Admin)

### Rooms (`/api/rooms`)
- `GET /api/rooms/hotel/:hotelId` - List rooms (supports `?checkIn=`, `?checkOut=`, `?guests=`)
- `GET /api/rooms/:id` - Get room details
- `POST /api/rooms` - Add a room (Manager / Admin)
- `PUT /api/rooms/:id` - Edit room details (Manager / Admin)
- `DELETE /api/rooms/:id` - Delete a room (Manager / Admin)

### Bookings (`/api/bookings`)
- `POST /api/bookings` - Create a reservation with date clash check
- `GET /api/bookings/my-bookings` - Guest's booking history
- `PUT /api/bookings/:id/cancel` - Cancel a reservation
- `GET /api/bookings/all` - Manager / Admin booking oversight

### Reports (`/api/reports`)
- `GET /api/reports/dashboard` - Occupancy and revenue analytics computed via MongoDB Aggregation

---

## 👨‍💻 Author
**Hitarth Srivastava**  
Capstone Project - Web Development III
