import { useState } from "react";
import axios from "axios";

interface ResetModalProps {
    onClose: () => void;
    email: string;
}

const ResetModal = ({ onClose, email }: ResetModalProps) => {
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [page, setPage] = useState<"otp" | "password">("otp");
    const [error, setError] = useState<string>("");

    const handleOtpVerification = async () => {
        try {
            const response = await axios.post(
                "http://localhost:5000/password-reset/verify-otp",
                {
                    email,
                    otp,
                }
            );
            if (response.data.message === "OTP verified successfully") {
                setPage("password");
                setError("");
            } else {
                setError("Invalid OTP or OTP expired");
            }
        } catch (error) {
            console.error("Error verifying OTP:", error);
            setError("Failed to verify OTP");
        }
    };
    

    const handlePasswordReset = async () => {
        try {
            if (newPassword !== confirmPassword) {
                setError("Passwords do not match");
                return;
            }

            const response = await axios.post(
                "http://localhost:5000/password-reset/confirm-password",
                {
                    email,
                    otp,
                    newPassword,
                }
            );
            if (response.data.message === "Password reset successfully") {
                onClose();
            } else {
                setError("Failed to reset password");
            }
        } catch (error) {
            console.error("Error resetting password:", error);
            setError("Failed to reset password");
        }
    };

    return (
        <div className="modal-wrapper">
            <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title">
                        {page === "otp" ? "Enter OTP" : "Reset Password"}
                    </h5>
                    <button
                        type="button"
                        className="btn-close"
                        onClick={onClose}
                    >
                        &times;
                    </button>
                </div>
                <div className="modal-body">
                    {error && <div className="alert alert-custom">{error}</div>}
                    {page === "otp" && (
                        <>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Enter OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                            <div className="row justify-content-end mt-3">
                                <div className="col-auto">
                                    <button
                                        type="submit"
                                        className="btn btn-verify"
                                        onClick={handleOtpVerification}
                                    >
                                        Verify
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                    {page === "password" && (
                        <>
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Enter New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <input
                                type="password"
                                className="form-control mt-3"
                                placeholder="Confirm New Password"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                            />
                            <div className="row justify-content-end">
                                <div className="col-auto">
                                    <button
                                        className="btn btn-reset mt-3"
                                        onClick={handlePasswordReset}
                                    >
                                        Reset Password
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetModal;
