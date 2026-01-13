import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const OtpVerification = ({ email, isPasswordReset = false, onSuccess, onBack }) => {
    const { axios } = useAppContext();

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resendDisabled, setResendDisabled] = useState(true);
    const [countdown, setCountdown] = useState(60);

    useEffect(() => {
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
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();

        if (/^\d{6}$/.test(pastedData)) {
            setOtp(pastedData.split(''));
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
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        className="w-10 h-10 sm:w-12 sm:h-12 text-center text-lg border border-gray-300 rounded-md"
                    />
                ))}
            </div>

            <button
                onClick={handleVerify}
                disabled={loading || otp.join('').length !== 6}
                className="bg-primary text-white w-full py-3 rounded-md disabled:bg-gray-400"
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
