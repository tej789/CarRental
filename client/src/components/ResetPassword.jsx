import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const ResetPassword = ({ email, otp, onSuccess, onBack }) => {
    const { axios } = useAppContext();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleResetPassword = async (e) => {
        e.preventDefault();
        
        if (newPassword.length < 8) {
            toast.error('Password must be at least 8 characters long');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        
        setLoading(true);
        try {
            const { data } = await axios.post('/api/user/reset-password', {
                email,
                otp,
                newPassword
            });
            
            if (data.success) {
                toast.success(data.message || 'Password reset successful');
                onSuccess();
            } else {
                toast.error(data.message || 'Failed to reset password');
            }
        } catch (error) {
            toast.error(error.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            <h2 className="text-2xl font-medium text-center">
                Reset Your Password
            </h2>
            
            <p className="text-gray-600 text-center mb-4 text-sm sm:text-base">
                Create a new password for your account
            </p>
            
            <form onSubmit={handleResetPassword} className="flex flex-col gap-4 w-full">
                <div className="w-full">
                    <p>New Password</p>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Password must be at least 8 characters long
                    </p>
                </div>
                
                <div className="w-full">
                    <p>Confirm Password</p>
                    <input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
                        required
                    />
                </div>
                
                <button
                    type="submit"
                    disabled={loading || !newPassword || !confirmPassword}
                    className="bg-primary hover:bg-blue-800 transition-all text-white w-full py-3 rounded-md cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed mt-2"
                >
                    {loading ? 'Resetting...' : 'Reset Password'}
                </button>
                
                <button
                    type="button"
                    onClick={onBack}
                    className="text-primary hover:underline text-center"
                >
                    Back to OTP Verification
                </button>
            </form>
        </div>
    );
};

export default ResetPassword;