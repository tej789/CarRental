import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import OtpVerification from './OtpVerification';
import ResetPassword from './ResetPassword';

const Login = () => {
    const { setShowLogin, axios, setToken, navigate } = useAppContext();

    const [state, setState] = useState("login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showOtpVerification, setShowOtpVerification] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [verifiedOtp, setVerifiedOtp] = useState("");
    const [loading, setLoading] = useState(false);

    const validateSignup = () => {
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return false;
        }
        if (password.length < 8) {
            toast.error("Password must be at least 8 characters");
            return false;
        }
        return true;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axios.post('/api/user/login', { email, password });

            if (data.success) {
                navigate("/");
                setToken(data.token);
                localStorage.setItem("token", data.token);
                setShowLogin(false);
            } else if (data.needsVerification) {
                setShowOtpVerification(true);
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        if (!validateSignup()) return;

        setLoading(true);
        try {
            const { data } = await axios.post('/api/user/send-otp', { name, email, password });
            if (data.success) {
                toast.success(data.message);
                setShowOtpVerification(true);
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (!email) return toast.error("Please enter your email");

        setLoading(true);
        try {
            const { data } = await axios.post('/api/user/forgot-password', { email });
            if (data.success) {
                toast.success(data.message);
                setShowOtpVerification(true);
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSuccess = (tokenOrOtp) => {
        if (showForgotPassword) {
            setVerifiedOtp(tokenOrOtp);
            setShowResetPassword(true);
            setShowOtpVerification(false);
        } else {
            navigate("/");
            setToken(tokenOrOtp);
            localStorage.setItem("token", tokenOrOtp);
            setShowLogin(false);
            toast.success("Account verified successfully!");
        }
    };

    const handleResetSuccess = () => {
        setState("login");
        setShowForgotPassword(false);
        setShowResetPassword(false);
        toast.success("Password reset successful. Please login.");
    };

    const inputClass =
        "w-full mt-1 px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition";

    const buttonClass =
        "bg-primary hover:bg-blue-700 text-white font-medium py-2.5 rounded-md transition disabled:bg-gray-400";

    const renderForm = () => {
        if (showOtpVerification) {
            return (
                <OtpVerification
                    email={email}
                    isPasswordReset={showForgotPassword}
                    onSuccess={handleOtpSuccess}
                    onBack={() => {
                        setShowOtpVerification(false);
                        if (showForgotPassword) {
                            setShowForgotPassword(false);
                            setState("login");
                        }
                    }}
                />
            );
        }

        if (showResetPassword) {
            return (
                <ResetPassword
                    email={email}
                    otp={verifiedOtp}
                    onSuccess={handleResetSuccess}
                    onBack={() => {
                        setShowResetPassword(false);
                        setShowOtpVerification(true);
                    }}
                />
            );
        }

        if (showForgotPassword) {
            return (
                <form onSubmit={handleForgotPassword} className="flex flex-col gap-5">
                    <h2 className="text-2xl font-semibold text-center">
                        <span className="text-primary">Forgot</span> Password
                    </h2>

                    <p className="text-sm text-gray-500 text-center">
                        Enter your email to receive reset OTP
                    </p>

                    <div>
                        <label className="text-sm font-medium">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={inputClass}
                            required
                        />
                    </div>

                    <button type="submit" disabled={loading} className={buttonClass}>
                        {loading ? "Sending..." : "Send Reset OTP"}
                    </button>

                    <p
                        onClick={() => {
                            setShowForgotPassword(false);
                            setState("login");
                        }}
                        className="text-center text-primary cursor-pointer hover:underline text-sm"
                    >
                        Back to Login
                    </p>
                </form>
            );
        }

        if (state === "login") {
            return (
                <form onSubmit={handleLogin} className="flex flex-col gap-5">
                    <h2 className="text-2xl font-semibold text-center">
                        <span className="text-primary">User</span> Login
                    </h2>

                    <div>
                        <label className="text-sm font-medium">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={inputClass}
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={inputClass}
                            required
                        />
                    </div>

                    <div className="flex justify-between text-sm">
                        <span
                            onClick={() => setState("register")}
                            className="text-primary cursor-pointer hover:underline"
                        >
                            Create account
                        </span>
                        <span
                            onClick={() => setShowForgotPassword(true)}
                            className="text-primary cursor-pointer hover:underline"
                        >
                            Forgot password?
                        </span>
                    </div>

                    <button type="submit" disabled={loading} className={buttonClass}>
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
            );
        }

        return (
            <form onSubmit={handleSignup} className="flex flex-col gap-5">
                <h2 className="text-2xl font-semibold text-center">
                    <span className="text-primary">User</span> Sign Up
                </h2>

                <div>
                    <label className="text-sm font-medium">Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={inputClass}
                        required
                    />
                </div>

                <div>
                    <label className="text-sm font-medium">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputClass}
                        required
                    />
                </div>

                <div>
                    <label className="text-sm font-medium">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={inputClass}
                        required
                    />
                </div>

                <div>
                    <label className="text-sm font-medium">Confirm Password</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={inputClass}
                        required
                    />
                </div>

                <p className="text-sm text-center">
                    Already have an account?
                    <span
                        onClick={() => setState("login")}
                        className="text-primary cursor-pointer ml-1 hover:underline"
                    >
                        Login
                    </span>
                </p>

                <button type="submit" disabled={loading} className={buttonClass}>
                    {loading ? "Creating Account..." : "Create Account"}
                </button>
            </form>
        );
    };

    return (
        <div
            onClick={() => setShowLogin(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-[90%] max-w-md bg-white rounded-xl shadow-2xl border border-gray-200 px-6 py-8 sm:px-8"
            >
                {renderForm()}
            </div>
        </div>
    );
};

export default Login;
