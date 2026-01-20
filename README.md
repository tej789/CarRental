# 🚗 Car Rental Management System (MERN Stack)

A full-stack **Car Rental Management System** built using the **MERN stack** that allows users to browse cars, book rentals, and manage reservations, while admins can manage cars, users, and bookings through a secure dashboard.

This project is designed as a **real-world full-stack application**, suitable for **deployment, resume, and interview explanation**.

---

## ✨ Features

### 👤 User Features

* User registration and login (JWT authentication)
* Browse available cars with details
* Rent cars for selected dates
* View booking history
* Responsive UI for all devices

### 🛠️ Admin Features

* Admin authentication
* Add, update, and delete cars
* Manage users
* View all bookings
* Control availability status of cars

---

## 🧰 Tech Stack

### Frontend

* React.js
* Vite
* HTML5, CSS3
* Axios
* Responsive design

### Backend

* Node.js
* Express.js
* MongoDB & Mongoose
* JWT Authentication
* RESTful APIs

### Tools & Services

* MongoDB Atlas
* Git & GitHub
* dotenv for environment variables

---

## 📂 Project Structure

```
CarRental/
│
├── client/                # Frontend (React)
│   ├── public/
│   ├── src/
│   ├── package.json
│
├── server/                # Backend (Node + Express)
│   ├── configs/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   ├── package.json
│
├── README.md
└── .gitignore
```

---

## ⚙️ Environment Variables

Create a `.env` file inside the **server** folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

⚠️ **Do not upload `.env` file to GitHub**

---

## 🚀 Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/CarRental.git
cd CarRental
```

### 2️⃣ Backend Setup

```bash
cd server
npm install
npm start
```

### 3️⃣ Frontend Setup

```bash
cd client
npm install
npm run dev
```

---

## 🌐 API Overview (Sample)

| Method | Endpoint           | Description       |
| ------ | ------------------ | ----------------- |
| POST   | /api/auth/login    | User login        |
| POST   | /api/auth/register | User registration |
| GET    | /api/cars          | Get all cars      |
| POST   | /api/bookings      | Create booking    |

---
## 🔐 Security

* JWT-based authentication
* Password hashing
* Environment variables protection
* Role-based access (Admin/User)

---

## 🎯 Use Cases

* Online car rental platforms
* Learning MERN stack
* College projects
* Resume & interview demonstrations

---

## 👨‍💻 Author

**Tej**
GitHub: [https://github.com/tej789](https://github.com/tej789)

---

## 📄 License

This project is for **educational purposes**.
