import { useState, useEffect, ChangeEvent } from "react";
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
    const [editableName, setEditableName] = useState(false);
    const [editableEmail, setEditableEmail] = useState(false);
    const [editedName, setEditedName] = useState("");
    const [editedEmail, setEditedEmail] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch user data from backend
                const response = await fetchUserData();
                setUserData(response);
            } catch (error) {
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
            await updateUserData({ userId: userData.id, name: editedName });
            setEditableName(false);
        } catch (error) {
            console.error("Error updating name:", error);
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
            await updateUserData({ userId: userData.id, email: editedEmail });
            setEditableEmail(false);
        } catch (error) {
            console.error("Error updating email:", error);
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

    return (
        <>
            <Navbar />
            <h1>Profile Page</h1>
            <h3>Welcome, {userData.name}</h3>

            <div>
                {editableName ? (
                    <>
                        <input
                            type="text"
                            value={editedName}
                            onChange={handleChangeName}
                        />
                        <button onClick={handleSaveName}>Save Name</button>
                        <button onClick={handleCancelName}>Cancel</button>
                    </>
                ) : (
                    <>
                        <p>Name: {userData.name}</p>
                        <button onClick={handleEditName}>Edit Name</button>
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
                        <button onClick={handleSaveEmail}>Save Email</button>
                        <button onClick={handleCancelEmail}>Cancel</button>
                    </>
                ) : (
                    <>
                        <p>Email: {userData.email}</p>
                        <button onClick={handleEditEmail}>Edit Email</button>
                    </>
                )}
            </div>
        </>
    );
};

export default Profile;
