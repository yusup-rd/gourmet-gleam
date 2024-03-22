import React, { useEffect, useState } from "react";
import { getUserRole, isAuthenticated, logout } from "../Auth/authApi";
import { useNavigate } from "react-router-dom";
import { User } from "../../types";
import { FaUserEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";

const Admin = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [editableUserId, setEditableUserId] = useState<number | null>(null);
    const [editedName, setEditedName] = useState<string>("");
    const [editedEmail, setEditedEmail] = useState<string>("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!isAuthenticated()) {
                    navigate("/login");
                    return;
                }
                const userRoleResponse = await getUserRole();
                const userRole = userRoleResponse?.role;
                if (userRole !== "admin") {
                    navigate("/");
                    return;
                }

                const response = await fetch(
                    `http://localhost:5000/admin/users?search=${encodeURIComponent(
                        searchQuery
                    )}`,
                    {
                        method: "GET",
                        credentials: "include",
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch users");
                }

                const data = await response.json();
                const sortedUsers = data.sort((a: any, b: any) => a.id - b.id);
                setUsers(sortedUsers);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [navigate, searchQuery]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            console.log(error);
        }
    };

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    const handleEdit = (userId: number) => {
        const userToEdit = users.find((user) => user.id === userId);
        if (userToEdit) {
            setEditableUserId(userId);
            setEditedName(userToEdit.name);
            setEditedEmail(userToEdit.email);
        }
    };

    const handleSave = async (userId: number) => {
        try {
            // Perform the PUT request to update user data
            const response = await fetch(
                `http://localhost:5000/admin/users/${userId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: editedName,
                        email: editedEmail,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to save user data");
            }

            // If the save is successful, update local state with edited values
            setUsers((prevUsers) =>
                prevUsers.map((user) => {
                    if (user.id === userId) {
                        return {
                            ...user,
                            name: editedName,
                            email: editedEmail,
                        };
                    }
                    return user;
                })
            );

            // Reset editable state
            setEditableUserId(null);
        } catch (error) {
            console.error("Error saving user data:", error);
        }
    };

    const handleCancelEdit = () => {
        setEditableUserId(null);
    };

    const handleChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEditedName(event.target.value);
    };

    const handleChangeEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEditedEmail(event.target.value);
    };

    return (
        <div>
            <h1>Admin Page</h1>
            <button onClick={handleLogout}>Logout</button>
            <br />
            <input
                type="text"
                placeholder="Search by name or email"
                value={searchQuery}
                onChange={handleSearch}
            />

            <h2>List of Registered Users</h2>
            <ul>
                {users.map((user) => (
                    <li key={user.id}>
                        <p>ID: {user.id}</p>
                        {editableUserId === user.id ? (
                            <>
                                <input
                                    type="text"
                                    value={editedName}
                                    onChange={handleChangeName}
                                />
                                <input
                                    type="email"
                                    value={editedEmail}
                                    onChange={handleChangeEmail}
                                />
                                <button onClick={() => handleSave(user.id)}>
                                    Save
                                </button>
                                <button onClick={handleCancelEdit}>
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <p>Name: {user.name}</p>
                                <p>Email: {user.email}</p>
                                <FaUserEdit
                                    onClick={() => handleEdit(user.id)}
                                />
                                <MdDeleteForever />
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Admin;
