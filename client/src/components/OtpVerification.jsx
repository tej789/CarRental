import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const OtpVerification = ({ email, isPasswordReset = false, onSuccess, onBack }) => {
    const { axios } = useAppContext();

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resendDisabled, setResendDisabled] = useState(true);
    const [countdown, setCountdown] = useState(60);

    // ✅ FIX: create refs only once
    const inputRefs = useRef([]);

    if (inputRefs.current.length === 0) {
        inputRefs.current = Array(6)
            .fill(null)
            .map(() => React.createRef());
    }

    // ✅ FIX: safe focus + timer
    useEffect(() => {
        inputRefs.current[0]?.current?.focus();

        let timer;
        if (resendDisabled) {
            timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setResendDisabled(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(timer);
    }, [resendDisabled]);

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.current?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.current?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();

        if (/^\d{6}$/.test(pastedData)) {
            const newOtp = pastedData.split('');
            setOtp(newOtp);
            inputRefs.current[5]?.current?.focus();
        }
    };

    const handleVerify = async () => {
        const otpString = otp.join('');

        if (otpString.length !== 6) {
            toast.error('Please enter a valid 6-digit OTP');
            return;
        }

        setLoading(true);
        try {
            if (isPasswordReset) {
                onSuccess(otpString);
                return;
            }

            const { data } = await axios.post('/api/user/verify-otp', {
                email,
                otp: otpString,
            });

            if (data.success) {
                toast.success(data.message || 'OTP verified successfully');
                onSuccess(data.token);
            } else {
                toast.error(data.message || 'Invalid OTP');
            }
        } catch (error) {
            toast.error(error.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setLoading(true);
        try {
            const endpoint = isPasswordReset
                ? '/api/user/forgot-password'
                : '/api/user/resend-otp';

            const { data } = await axios.post(endpoint, { email });

            if (data.success) {
                toast.success(data.message || 'OTP resent successfully');
                setResendDisabled(true);
                setCountdown(60);
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0]?.current?.focus();
            } else {
                toast.error(data.message || 'Failed to resend OTP');
            }
        } catch (error) {
            toast.error(error.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 items-center w-full">
            <h2 className="text-2xl font-medium text-center">
                {isPasswordReset ? 'Reset Password' : 'Verify Your Email'}
            </h2>

            <p className="text-gray-600 text-center mb-4">
                We've sent a verification code to <span className="font-medium">{email}</span>
            </p>

            <div className="flex gap-2 justify-center w-full mb-4">
                {otp.map((digit, index) => (
                    <input
                        key={index}
                        ref={inputRefs.current[index]}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        className="w-10 h-10 sm:w-12 sm:h-12 text-center text-lg sm:text-xl border border-gray-300 rounded-md focus:outline-primary focus:border-primary"
                    />
                ))}
            </div>

            <button
                onClick={handleVerify}
                disabled={loading || otp.join('').length !== 6}
                className="bg-primary hover:bg-blue-800 transition-all text-white w-full py-3 rounded-md disabled:bg-gray-400"
            >
                {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <div className="flex justify-between w-full mt-2">
                <button onClick={onBack} className="text-primary hover:underline">
                    Back
                </button>

                <button
                    onClick={handleResendOtp}
                    disabled={resendDisabled || loading}
                    className="text-primary hover:underline disabled:text-gray-400"
                >
                    {resendDisabled ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                </button>
            </div>
        </div>
    );
};

export default OtpVerification;
