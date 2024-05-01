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
      const response = await axios.post("http://localhost:5000/password-reset/verify-otp", {
        email,
        otp,
      });
      if (response.data.message === "OTP verified successfully") {
        setPage("password");
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
      
      const response = await axios.post("http://localhost:5000/password-reset/confirm-password", {
        email,
        otp,
        newPassword,
      });
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
    <div className="modal fade show" style={{ display: "block" }} tabIndex={-1}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {page === "otp" ? "Enter OTP" : "Reset Password"}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            >&times;</button>
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}
            {page === "otp" && (
              <>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <button
                  className="btn btn-primary mt-3"
                  onClick={handleOtpVerification}
                >
                  Verify OTP
                </button>
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
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  className="btn btn-primary mt-3"
                  onClick={handlePasswordReset}
                >
                  Reset Password
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetModal;
