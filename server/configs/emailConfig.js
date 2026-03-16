import Brevo from "@getbrevo/brevo";

// Generate OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

// Send OTP email
export const sendOtpEmail = async (email, otp, isPasswordReset = false) => {
  try {
    const subject = isPasswordReset
      ? "Password Reset OTP"
      : "Email Verification OTP";

    const sendSmtpEmail = {
      sender: {
        // Fall back to generic values if dedicated Brevo sender env vars are not set
        email: process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USER,
        name: process.env.BREVO_SENDER_NAME || "CarRental",
      },
      to: [{ email }],
      subject,
      htmlContent: `
        <h2>Your OTP is ${otp}</h2>
        <p>This OTP will expire in 5 minutes.</p>
      `,
    };

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    return { success: true };
  } catch (error) {
    console.error("Brevo email error:", error);
    return { success: false };
  }
};
