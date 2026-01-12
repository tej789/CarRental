import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const OtpVerification = ({ email, isPasswordReset = false, onSuccess, onBack }) => {
    const { axios } = useAppContext();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resendDisabled, setResendDisabled] = useState(true);
    const [countdown, setCountdown] = useState(60);
    const inputRefs = Array(6).fill(0).map(() => React.createRef());

    useEffect(() => {
        // Focus on first input when component mounts
        if (inputRefs[0].current) {
            inputRefs[0].current.focus();
        }

        // Start countdown for resend button
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

        return () => {
            clearInterval(timer);
        };
    }, [resendDisabled]);

    const handleChange = (index, value) => {
        // Only allow numbers
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus to next input if current input is filled
        if (value && index < 5) {
            inputRefs[index + 1].current.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Move to previous input on backspace if current input is empty
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs[index - 1].current.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();
        
        // Check if pasted content is a 6-digit number
        if (/^\d{6}$/.test(pastedData)) {
            const newOtp = pastedData.split('');
            setOtp(newOtp);
            
            // Focus on the last input
            inputRefs[5].current.focus();
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
            let endpoint = '/api/user/verify-otp';
            let payload = { email, otp: otpString };

            if (isPasswordReset) {
                // For password reset flow, we'll handle this in the parent component
                onSuccess(otpString);
                setLoading(false);
                return;
            }

            const { data } = await axios.post(endpoint, payload);
            
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
            const endpoint = isPasswordReset ? '/api/user/forgot-password' : '/api/user/resend-otp';
            const payload = { email, isPasswordReset };
            
            const { data } = await axios.post(endpoint, payload);
            
            if (data.success) {
                toast.success(data.message || 'OTP resent successfully');
                setResendDisabled(true);
                setCountdown(60);
                setOtp(['', '', '', '', '', '']);
                inputRefs[0].current.focus();
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
                        ref={inputRefs[index]}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : null}
                        className="w-10 h-10 sm:w-12 sm:h-12 text-center text-lg sm:text-xl border border-gray-300 rounded-md focus:outline-primary focus:border-primary"
                    />
                ))}
            </div>
            
            <button
                onClick={handleVerify}
                disabled={loading || otp.join('').length !== 6}
                className="bg-primary hover:bg-blue-800 transition-all text-white w-full py-3 rounded-md cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            
            <div className="flex justify-between w-full mt-2">
                <button 
                    onClick={onBack}
                    className="text-primary hover:underline"
                >
                    Back
                </button>
                
                <button
                    onClick={handleResendOtp}
                    disabled={resendDisabled || loading}
                    className="text-primary hover:underline disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                    {resendDisabled ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                </button>
            </div>
        </div>
    );
};

export default OtpVerification;