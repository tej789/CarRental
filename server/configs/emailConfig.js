import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Function to send OTP email
export const sendOtpEmail = async (email, otp, isPasswordReset = false) => {
  try {
    const subject = isPasswordReset
      ? "Password Reset OTP"
      : "Email Verification OTP";

    await resend.emails.send({
      from: "CarRental <onboarding@resend.dev>",
      to: email,
      subject,
      html: `
        <h2>Your OTP is ${otp}</h2>
        <p>This OTP will expire in 5 minutes.</p>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
};

// Function to generate a random 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export default { sendOtpEmail, generateOTP };
