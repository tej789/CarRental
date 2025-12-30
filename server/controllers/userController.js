import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Car from '../models/Car.js';
import { generateOTP, sendOtpEmail } from '../configs/emailConfig.js';

// Generate JWT Token

const generateToken = (userId) => {
    const payload = userId;
    return jwt.sign(payload, process.env.JWT_SECRET)   // Sign the token with the secret key mainly jwt token have three parts in header, payload and signature in header we have algorithm and type of token in payload we have user id and in signature we have secret key

}

// Send OTP for registration
export const sendRegistrationOTP = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        if(!name || !email || !password || password.length < 8) {
            return res.json({success: false, message: "Fill all the fields."});
        }

        const userExists = await User.findOne({ email });
        if(userExists && userExists.isVerified) {
            return res.json({success: false, message: "User already exists."});
        }
        
        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = new Date();
        otpExpiry.setMinutes(otpExpiry.getMinutes() + 5); // OTP expires in 5 minutes
        
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // If user exists but not verified, update the user
        if(userExists) {
            userExists.name = name;
            userExists.password = hashedPassword;
            userExists.otp = otp;
            userExists.otpExpiry = otpExpiry;
            await userExists.save();
        } else {
            // Create a new unverified user with OTP
            await User.create({
                name,
                email,
                password: hashedPassword,
                otp,
                otpExpiry,
                isVerified: false
            });
        }
        
        // Send OTP via email
        const emailResult = await sendOtpEmail(email, otp);
        
        if(!emailResult.success) {
            return res.json({success: false, message: "Failed to send OTP. Please try again."});
        }
        
        res.json({
            success: true,
            message: "OTP sent to your email.",
            email
        });
    } catch(error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}

// Verify OTP and complete registration
export const verifyRegistrationOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        
        if(!email || !otp) {
            return res.json({success: false, message: "Email and OTP are required."});
        }
        
        const user = await User.findOne({ email });
        
        if(!user) {
            return res.json({success: false, message: "User not found."});
        }
        
        if(user.isVerified) {
            return res.json({success: false, message: "User is already verified."});
        }
        
        if(user.otp !== otp) {
            return res.json({success: false, message: "Invalid OTP."});
        }
        
        if(user.otpExpiry < new Date()) {
            return res.json({success: false, message: "OTP has expired."});
        }
        
        // Verify the user
        user.isVerified = true;
        user.otp = null;
        user.otpExpiry = null;
        await user.save();
        
        // Generate token
        const token = generateToken(user._id.toString());
        
        res.json({
            success: true,
            message: "Registration successful.",
            token
        });
    } catch(error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}

// Resend OTP
export const resendOTP = async (req, res) => {
    try {
        const { email, isPasswordReset = false } = req.body;
        
        if(!email) {
            return res.json({success: false, message: "Email is required."});
        }
        
        const user = await User.findOne({ email });
        
        if(!user) {
            return res.json({success: false, message: "User not found."});
        }
        
        if(isPasswordReset === false && user.isVerified) {
            return res.json({success: false, message: "User is already verified."});
        }
        
        // Generate new OTP
        const otp = generateOTP();
        const otpExpiry = new Date();
        otpExpiry.setMinutes(otpExpiry.getMinutes() + 5); // OTP expires in 5 minutes
        
        // Update user with new OTP
        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();
        
        // Send OTP via email
        const emailResult = await sendOtpEmail(email, otp, isPasswordReset);
        
        if(!emailResult.success) {
            return res.json({success: false, message: "Failed to send OTP. Please try again."});
        }
        
        res.json({
            success: true,
            message: "OTP resent to your email.",
            email
        });
    } catch(error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}

//Register User (Legacy - now handled by OTP verification)
export const registerUser = async (req, res) => {
    try{
        const {name,email,password} = req.body;
        
        if(!name || !email || !password || password.length < 8) {
            return res.json({success: false, message: "Fill all the fields."});
        }

        const userExists = await User.findOne({ email });
        if(userExists) {
            return res.json({success: false, message: "User already exists."});
        } 
        
        const hashedPassword = await bcrypt.hash(password, 10);     // Hash the password with bcrypt (10 is the salt rounds) and salt rounds are the number of times the password is hashed to make it more secure
        const user = await User.create({                            //here we create a new user in the database and save it
            name,
            email,
            password: hashedPassword,
            isVerified: true // Legacy function assumes verified
        });

        const token = generateToken(user._id.toString());
        res.json({
            success: true,
            token
        });

    }

    catch(error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }

}

// Login User
export const loginUser = async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({
            email
        });

        if(!user) {
            return res.json({success: false, message: "User not found."});
        }

        if(!user.isVerified) {
            return res.json({
                success: false, 
                message: "Email not verified. Please verify your email first.",
                needsVerification: true,
                email: user.email
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch) {
            return res.json({success: false, message: "Invalid credentials."});
        }

        const token = generateToken(user._id.toString());
        res.json({ 
            success: true,
            token
        });
    }
    catch(error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}

// Forgot Password - Send OTP
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        if(!email) {
            return res.json({success: false, message: "Email is required."});
        }
        
        const user = await User.findOne({ email });
        
        if(!user) {
            return res.json({success: false, message: "User not found."});
        }
        
        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = new Date();
        otpExpiry.setMinutes(otpExpiry.getMinutes() + 5); // OTP expires in 5 minutes
        
        // Update user with OTP
        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();
        
        // Send OTP via email
        const emailResult = await sendOtpEmail(email, otp, true);
        
        if(!emailResult.success) {
            return res.json({success: false, message: "Failed to send OTP. Please try again."});
        }
        
        res.json({
            success: true,
            message: "Password reset OTP sent to your email.",
            email
        });
    } catch(error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}

// Reset Password with OTP verification
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        
        if(!email || !otp || !newPassword) {
            return res.json({success: false, message: "All fields are required."});
        }
        
        if(newPassword.length < 8) {
            return res.json({success: false, message: "Password must be at least 8 characters."});
        }
        
        const user = await User.findOne({ email });
        
        if(!user) {
            return res.json({success: false, message: "User not found."});
        }
        
        if(user.otp !== otp) {
            return res.json({success: false, message: "Invalid OTP."});
        }
        
        if(user.otpExpiry < new Date()) {
            return res.json({success: false, message: "OTP has expired."});
        }
        
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Update user password and clear OTP
        user.password = hashedPassword;
        user.otp = null;
        user.otpExpiry = null;
        await user.save();
        
        res.json({
            success: true,
            message: "Password reset successful."
        });
    } catch(error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}

// Get User data using Token (JWT)

export const getUserData = async (req, res) => {
    try {
        const {user} = req; // user is added to the request object by the auth middleware

        res.json({
            success: true,
            user
        });
    }

    catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }

}

// Get All cars for the Frontend

export const getCars = async(req,res) =>{
    try{
        const cars = await Car.find({isAvailable: true});
        res.json({success: true, cars});
    }
    catch(error){
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}