import nodemailer from "nodemailer";

// Generate OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
});

// Send OTP email
export const sendOtpEmail = async (email, otp, isPasswordReset = false) => {
  try {
    const subject = isPasswordReset
      ? "Password Reset OTP"
      : "Email Verification OTP";

    await transporter.sendMail({
      from: `"CarRental" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    });

    return { success: true };
  } catch (error) {
    console.error("Email error:", error);
    return { success: false };
  }
};
