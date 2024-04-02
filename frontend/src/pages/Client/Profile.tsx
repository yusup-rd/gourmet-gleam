import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import Navbar from "../../components/Navbar";

const Profile = () => {
    interface UserData {
        id: number;
        name: string;
        email: string;
    }

    const [userData, setUserData] = useState<UserData>({
        id: 0,
        name: "",
        email: "",
    });
    const [isLoading, setIsLoading] = useState(true);
    const [editableName, setEditableName] = useState(false);
    const [editableEmail, setEditableEmail] = useState(false);
    const [editablePassword, setEditablePassword] = useState(false);
    const [editedName, setEditedName] = useState("");
    const [editedEmail, setEditedEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [nameError, setNameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetchUserData();
                setUserData(response);
                setIsLoading(false);
            } catch (error: any) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchData();
    }, []);

    const fetchUserData = async () => {
        try {
            const response = await fetch("http://localhost:5000/profile", {
                method: "GET",
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error("Failed to fetch user data");
            }
            const data = await response.json();
            return data;
        } catch (error: any) {
            throw new Error(error.message);
        }
    };

    const updateUserData = async (data: {
        userId: number;
        name?: string;
        email?: string;
        password?: string;
    }) => {
        try {
            const response = await fetch("http://localhost:5000/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error("Failed to update user data");
            }
            const updatedData = await response.json();
            setUserData(updatedData);
        } catch (error: any) {
            throw new Error(error.message);
        }
    };

    const handleEditName = () => {
        setEditableName(true);
        setEditedName(userData.name);
    };

    const handleSaveName = async () => {
        try {
            if (!editedName) {
                throw new Error("Name cannot be empty");
            }
            await updateUserData({ userId: userData.id, name: editedName });
            setEditableName(false);
            setNameError("");
        } catch (error: any) {
            setNameError(error.message);
        }
    };

    const handleCancelName = () => {
        setEditableName(false);
    };

    const handleEditEmail = () => {
        setEditableEmail(true);
        setEditedEmail(userData.email);
    };

    const handleSaveEmail = async () => {
        try {
            if (!editedEmail) {
                throw new Error("Email cannot be empty");
            }
            await updateUserData({ userId: userData.id, email: editedEmail });
            setEditableEmail(false);
            setEmailError("");
        } catch (error: any) {
            setEmailError(error.message);
        }
    };

    const handleCancelEmail = () => {
        setEditableEmail(false);
    };

    const handleChangeName = (event: ChangeEvent<HTMLInputElement>) => {
        setEditedName(event.target.value);
    };

    const handleChangeEmail = (event: ChangeEvent<HTMLInputElement>) => {
        setEditedEmail(event.target.value);
    };

    const handleEditPassword = () => {
        setEditablePassword(true);
        setCurrentPassword("");
        setNewPassword("");
        setPasswordError("");
    };

    const handleSavePassword = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            if (!currentPassword || !newPassword) {
                throw new Error(
                    "Both current password and new password are required"
                );
            }
            const response = await fetch(
                "http://localhost:5000/profile/change-password",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        userId: userData.id,
                        currentPassword: currentPassword,
                        newPassword: newPassword,
                    }),
                    credentials: "include",
                }
            );
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Invalid current password");
                } else {
                    const data = await response.json();
                    setPasswordError(data.error);
                }
            } else {
                setEditablePassword(false);
                setPasswordError("");
            }
        } catch (error: any) {
            if (error.message !== "Invalid current password") {
                console.error("Error changing password:", error);
            }
            setPasswordError(error.message);
        }
    };

    const handleCancelPassword = () => {
        setEditablePassword(false);
    };

    const handleChangeCurrentPassword = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        setCurrentPassword(event.target.value);
    };

    const handleChangeNewPassword = (event: ChangeEvent<HTMLInputElement>) => {
        setNewPassword(event.target.value);
    };

    return (
        <>
            <Navbar />
            <h1>Profile Page</h1>

            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <>
                    <h3>Welcome, {userData.name}</h3>

                    <div>
                        {editableName ? (
                            <>
                                <input
                                    type="text"
                                    value={editedName}
                                    onChange={handleChangeName}
                                />
                                <button onClick={handleSaveName}>
                                    Save Name
                                </button>
                                <button onClick={handleCancelName}>
                                    Cancel
                                </button>
                                {nameError && <p>{nameError}</p>}
                            </>
                        ) : (
                            <>
                                <p>Name: {userData.name}</p>
                                <button onClick={handleEditName}>
                                    Edit Name
                                </button>
                            </>
                        )}
                    </div>

                    <div>
                        {editableEmail ? (
                            <>
                                <input
                                    type="email"
                                    value={editedEmail}
                                    onChange={handleChangeEmail}
                                />
                                <button onClick={handleSaveEmail}>
                                    Save Email
                                </button>
                                <button onClick={handleCancelEmail}>
                                    Cancel
                                </button>
                                {emailError && <p>{emailError}</p>}
                            </>
                        ) : (
                            <>
                                <p>Email: {userData.email}</p>
                                <button onClick={handleEditEmail}>
                                    Edit Email
                                </button>
                            </>
                        )}
                    </div>

                    <div>
                        {editablePassword ? (
                            <form onSubmit={handleSavePassword}>
                                <input type="hidden" value={userData.email} />

                                <input
                                    type="password"
                                    placeholder="Current Password"
                                    value={currentPassword}
                                    onChange={handleChangeCurrentPassword}
                                    autoComplete="true"
                                />
                                <input
                                    type="password"
                                    placeholder="New Password"
                                    value={newPassword}
                                    onChange={handleChangeNewPassword}
                                    autoComplete="true"
                                />
                                <button type="submit">Save Password</button>
                                <button onClick={handleCancelPassword}>
                                    Cancel
                                </button>
                                {passwordError && <p>{passwordError}</p>}
                            </form>
                        ) : (
                            <button onClick={handleEditPassword}>
                                Change Password
                            </button>
                        )}
                    </div>
                </>
            )}
        </>
    );
};

export default Profile;
