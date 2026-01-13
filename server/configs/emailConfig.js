import nodemailer from 'nodemailer';

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    connectionTimeout: 10 * 1000
});

// Function to send OTP email
export const sendOtpEmail = async (email, otp, isPasswordReset = false) => {
    try {
        const subject = isPasswordReset ? 'Password Reset OTP' : 'Email Verification OTP';
        const text = isPasswordReset 
            ? `Your OTP for password reset is: ${otp}. This OTP will expire in 5 minutes.`
            : `Your OTP for email verification is: ${otp}. This OTP will expire in 5 minutes.`;
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject,
            text
        };

        const info = await transporter.sendMail(mailOptions);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
};

// Function to generate a random 6-digit OTP
export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export default { sendOtpEmail, generateOTP };
