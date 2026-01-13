import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Car from '../models/Car.js';
import { generateOTP, sendOtpEmail } from '../configs/emailConfig.js';

/* ================== HELPER ================== */
const normalizeEmail = (email) => {
    return email.trim().toLowerCase();
};

/* ================== JWT ================== */
const generateToken = (userId) => {
    return jwt.sign(userId, process.env.JWT_SECRET);
};

/* ================== SEND OTP ================== */
export const sendRegistrationOTP = async (req, res) => {
    try {
        let { name, email, password } = req.body;
        email = normalizeEmail(email);

        if (!name || !email || !password || password.length < 8) {
            return res.json({ success: false, message: "Fill all the fields." });
        }

        const userExists = await User.findOne({ email });

        if (userExists && userExists.isVerified) {
            return res.json({ success: false, message: "User already exists." });
        }

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
        const hashedPassword = await bcrypt.hash(password, 10);

        if (userExists) {
            userExists.name = name;
            userExists.password = hashedPassword;
            userExists.otp = otp;
            userExists.otpExpiry = otpExpiry;
            await userExists.save();
        } else {
            await User.create({
                name,
                email,
                password: hashedPassword,
                otp,
                otpExpiry,
                isVerified: false
            });
        }

        const emailResult = await sendOtpEmail(email, otp);

        if (!emailResult.success) {
            return res.json({ success: false, message: "Failed to send OTP." });
        }

        res.json({ success: true, message: "OTP sent to your email." });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

/* ================== VERIFY OTP ================== */
export const verifyRegistrationOTP = async (req, res) => {
    try {
        let { email, otp } = req.body;
        email = normalizeEmail(email);

        const user = await User.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User not found." });
        }

        if (user.isVerified) {
            return res.json({ success: false, message: "User already verified." });
        }

        if (user.otp !== otp) {
            return res.json({ success: false, message: "Invalid OTP." });
        }

        if (user.otpExpiry < new Date()) {
            return res.json({ success: false, message: "OTP expired." });
        }

        user.isVerified = true;
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        const token = generateToken(user._id.toString());

        res.json({ success: true, token });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

/* ================== LOGIN ================== */
export const loginUser = async (req, res) => {
    try {
        let { email, password } = req.body;
        email = normalizeEmail(email);

        const user = await User.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User not found." });
        }

        if (!user.isVerified) {
            return res.json({
                success: false,
                message: "Email not verified.",
                needsVerification: true
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({ success: false, message: "Invalid credentials." });
        }

        const token = generateToken(user._id.toString());

        res.json({ success: true, token });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

/* ================== RESEND OTP ================== */
export const resendOTP = async (req, res) => {
    try {
        let { email } = req.body;
        email = normalizeEmail(email);

        const user = await User.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User not found." });
        }

        if (user.isVerified) {
            return res.json({ success: false, message: "User already verified." });
        }

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
        await user.save();

        await sendOtpEmail(email, otp);

        res.json({ success: true, message: "OTP resent." });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

/* ================== FORGOT PASSWORD ================== */
export const forgotPassword = async (req, res) => {
    try {
        let { email } = req.body;
        email = normalizeEmail(email);

        const user = await User.findOne({ email });
        if (!user) return res.json({ success: false, message: "User not found." });

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
        await user.save();

        await sendOtpEmail(email, otp, true);

        res.json({ success: true, message: "OTP sent." });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

/* ================== RESET PASSWORD ================== */
export const resetPassword = async (req, res) => {
    try {
        let { email, otp, newPassword } = req.body;
        email = normalizeEmail(email);

        const user = await User.findOne({ email });

        if (!user || user.otp !== otp) {
            return res.json({ success: false, message: "Invalid OTP." });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        res.json({ success: true, message: "Password reset successful." });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

/* ================== CARS ================== */
export const getCars = async (req, res) => {
    try {
        const cars = await Car.find({ isAvailable: true });
        res.json({ success: true, cars });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
