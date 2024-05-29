import React, { useEffect, useState } from "react";
import { getUserRole, isAuthenticated, logout } from "../Auth/authApi";
import { useNavigate } from "react-router-dom";
import { User } from "../../types";
import { FaUserEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import "./admin.css";

const Admin = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [editableUserId, setEditableUserId] = useState<number | null>(null);
    const [editedName, setEditedName] = useState<string>("");
    const [editedEmail, setEditedEmail] = useState<string>("");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
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
                        return sortOrder === "asc"
                            ? a.name.localeCompare(b.name)
                            : b.name.localeCompare(a.name);
                    } else {
                        return sortOrder === "asc"
                            ? a.email.localeCompare(b.email)
                            : b.email.localeCompare(a.email);
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

            setEditableUserId(null);
        } catch (error) {
            console.error("Error saving user data:", error);
        }
    };

    const handleDelete = async (userId: number, userName: string) => {
        const confirmation = window.confirm(
            `Are you sure you want to delete user "${userName}"?`
        );
        if (confirmation) {
            try {
                const response = await fetch(
                    `http://localhost:5000/admin/users/${userId}`,
                    {
                        method: "DELETE",
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to delete user");
                }

                setUsers((prevUsers) =>
                    prevUsers.filter((user) => user.id !== userId)
                );
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
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center">
                <h1 className="mb-4">Admin Page</h1>
                <button className="btn btn-danger mb-3" onClick={handleLogout}>
                    Logout
                </button>
            </div>
            <div className="mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search by name or email"
                    value={searchQuery}
                    onChange={handleSearch}
                />
            </div>
            <p>Sort By:</p>
            <span className="mr-3 sort-button" onClick={() => handleSort("id")}>
                <span>ID</span>
                {sortBy === "id" &&
                    (sortOrder === "asc" ? (
                        <FaChevronUp className="chevron" />
                    ) : (
                        <FaChevronDown className="chevron" />
                    ))}
            </span>
            <span
                className="mr-3 sort-button"
                onClick={() => handleSort("name")}
            >
                <span>Name</span>
                {sortBy === "name" &&
                    (sortOrder === "asc" ? (
                        <FaChevronUp className="chevron" />
                    ) : (
                        <FaChevronDown className="chevron" />
                    ))}
            </span>
            <span
                className="mr-3 sort-button"
                onClick={() => handleSort("email")}
            >
                <span>Email</span>
                {sortBy === "email" &&
                    (sortOrder === "asc" ? (
                        <FaChevronUp className="chevron" />
                    ) : (
                        <FaChevronDown className="chevron" />
                    ))}
            </span>
            <h2 className="my-4">List of Registered Users</h2>
            <ul className="list-group my-4">
                {users.map((user) => (
                    <li
                        key={user.id}
                        className="list-group-item my-1 d-flex justify-content-between align-items-center"
                        style={{
                            backgroundColor: "#333333",
                            borderRadius: "10px",
                        }}
                    >
                        <div>
                            <p>ID: {user.id}</p>
                            {editableUserId === user.id ? (
                                <div className="input-group mb-3">
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editedName}
                                        onChange={handleChangeName}
                                    />
                                    <input
                                        type="email"
                                        className="form-control rounded-right"
                                        value={editedEmail}
                                        onChange={handleChangeEmail}
                                    />
                                    <div className="input-group-append">
                                        <button
                                            className="btn btn-success ml-2 rounded-left"
                                            onClick={() => handleSave(user.id)}
                                        >
                                            Save
                                        </button>
                                        <button
                                            className="btn btn-secondary"
                                            onClick={handleCancelEdit}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p>Name: {user.name}</p>
                                    <p>Email: {user.email}</p>
                                </>
                            )}
                        </div>
                        {!editableUserId && (
                            <div className="d-flex flex-column">
                                <button
                                    className="btn btn-primary text-left d-flex align-items-center justify-content-between rounded my-1"
                                    style={{ width: "200px", height: "45px" }}
                                    onClick={() => handleEdit(user.id)}
                                >
                                    <span>Edit</span>
                                    <FaUserEdit />
                                </button>
                                <button
                                    className="btn btn-danger text-left d-flex align-items-center justify-content-between rounded my-1"
                                    style={{ width: "200px", height: "45px" }}
                                    onClick={() =>
                                        handleDelete(user.id, user.name)
                                    }
                                >
                                    <span>Delete</span>
                                    <MdDeleteForever />
                                </button>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Admin;
