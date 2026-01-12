import express from 'express';
import "dotenv/config";
import cors from 'cors';   //use for work frontend and backend on different ports
import connectDB from './configs/db.js';
import userRouter from './routes/userRoutes.js';
import ownerRouter from './routes/ownerRoutes.js'; 
import bookingRouter from './routes/bookingRoutes.js'; 

// Initialize Express App
const app = express();

await connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.send('Welcome to the server!');
});
app.use('/api/user', userRouter);
app.use('/api/owner', ownerRouter);
app.use('/api/bookings', bookingRouter); 

const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
