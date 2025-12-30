import express from 'express';
import { 
    getCars, 
    getUserData, 
    loginUser, 
    registerUser, 
    sendRegistrationOTP, 
    verifyRegistrationOTP, 
    resendOTP, 
    forgotPassword, 
    resetPassword 
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const userRouter = express.Router();

// Authentication routes
userRouter.post('/register', registerUser); // Legacy route
userRouter.post('/login', loginUser);
userRouter.get('/data', protect, getUserData);

// OTP verification routes
userRouter.post('/send-otp', sendRegistrationOTP);
userRouter.post('/verify-otp', verifyRegistrationOTP);
userRouter.post('/resend-otp', resendOTP);
userRouter.post('/forgot-password', forgotPassword);
userRouter.post('/reset-password', resetPassword);

// Other routes
userRouter.get('/cars', getCars);

export default userRouter;