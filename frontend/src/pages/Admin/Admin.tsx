import React, { useEffect, useState } from "react";
import { getUserRole, isAuthenticated, logout } from "../Auth/authApi";
import { useNavigate } from "react-router-dom";
import { User } from "../../types";
import { FaUserEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";

const Admin = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [editableUserId, setEditableUserId] = useState<number | null>(null);
    const [editedName, setEditedName] = useState<string>("");
    const [editedEmail, setEditedEmail] = useState<string>("");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc"); // Initialize to "asc"
    const [sortBy, setSortBy] = useState<"id" | "name" | "email">("id");

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
                    )}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
                    {
                        method: "GET",
                        credentials: "include",
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch users");
                }

                const data = await response.json();
                const sortedUsers = data.sort((a: any, b: any) => {
                    if (sortBy === "id") {
                        return sortOrder === "asc" ? a.id - b.id : b.id - a.id;
                    } else if (sortBy === "name") {
                        return sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
                    } else {
                        return sortOrder === "asc" ? a.email.localeCompare(b.email) : b.email.localeCompare(a.email);
                    }
                });
                setUsers(sortedUsers);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [navigate, searchQuery, sortBy, sortOrder]);

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

    const handleDelete = async (userId: number, userName: string) => {
        const confirmation = window.confirm(`Are you sure you want to delete user "${userName}"?`);
        if (confirmation) {
            try {
                // Perform the DELETE request to delete the user
                const response = await fetch(
                    `http://localhost:5000/admin/users/${userId}`,
                    {
                        method: "DELETE",
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to delete user");
                }

                // If deletion is successful, update local state by removing the deleted user
                setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
            } catch (error) {
                console.error("Error deleting user:", error);
            }
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

    const handleSort = (field: "id" | "name" | "email") => {
        setSortBy(field);
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
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
            <p>Sort:</p>
            <span onClick={() => handleSort("id")}>
                By ID {sortBy === "id" && (sortOrder === "asc" ? <FaChevronUp /> : <FaChevronDown />)}
            </span>
            <span onClick={() => handleSort("name")}>
                By Name {sortBy === "name" && (sortOrder === "asc" ? <FaChevronUp /> : <FaChevronDown />)}
            </span>
            <span onClick={() => handleSort("email")}>
                By Email {sortBy === "email" && (sortOrder === "asc" ? <FaChevronUp /> : <FaChevronDown />)}
            </span>
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
                                    onChange
                                    ={handleChangeEmail}
                                    />
                                    <button onClick={() => handleSave(user.id)}>Save</button>
                                    <button onClick={handleCancelEdit}>Cancel</button>
                                </>
                            ) : (
                                <>
                                    <p>Name: {user.name}</p>
                                    <p>Email: {user.email}</p>
                                    <FaUserEdit onClick={() => handleEdit(user.id)} />
                                    <MdDeleteForever onClick={() => handleDelete(user.id, user.name)} />
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        );
    };
    
    export default Admin;
    