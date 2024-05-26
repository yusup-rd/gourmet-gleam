import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Select from "react-select";
import { getUserRole } from "../Auth/authApi";
import "./profile.css";

const Profile = () => {
    interface UserData {
        id: number;
        name: string;
        email: string;
        preferredCuisine: string[];
        excludedCuisine: string[];
        diet: string[];
        intolerances: string[];
    }

    const [userData, setUserData] = useState<UserData>({
        id: 0,
        name: "",
        email: "",
        preferredCuisine: [],
        excludedCuisine: [],
        diet: [],
        intolerances: [],
    });
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [editableName, setEditableName] = useState(false);
    const [editableEmail, setEditableEmail] = useState(false);
    const [editablePassword, setEditablePassword] = useState(false);
    const [editedName, setEditedName] = useState("");
    const [editedEmail, setEditedEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [nameError, setNameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    useEffect(() => {
        const restrict = async () => {
            const userRoleResponse = await getUserRole();
            const userRole = userRoleResponse?.role;
            if (userRole === "admin") {
                navigate("/admin");
                return;
            }
        };
        restrict();

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
        preferredCuisine?: string[];
        excludedCuisine?: string[];
        diet?: string[];
        intolerances?: string[];
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
            setUserData((prevUserData) => ({
                ...prevUserData,
                ...updatedData,
            }));
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
            if (!currentPassword || !newPassword || !confirmNewPassword) {
                throw new Error("All password fields are required");
            }

            if (newPassword !== confirmNewPassword) {
                throw new Error(
                    "New password and confirm new password do not match"
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
                setNewPassword("");
                setConfirmNewPassword("");
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

    const handleChangeConfirmNewPassword = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        setConfirmNewPassword(event.target.value);
    };

    const handleDeleteAccount = async () => {
        try {
            const confirmed = window.confirm(
                "Are you sure you want to delete your account?"
            );
            if (!confirmed) {
                return;
            } else {
                navigate("/register");
            }

            const response = await fetch(
                "http://localhost:5000/profile/delete",
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );
            if (!response.ok) {
                throw new Error("Failed to delete account");
            }
        } catch (error: any) {
            console.error("Error deleting account:", error);
        }
    };

    // Options for preferences settings
    const cuisineOptions = [
        { value: "african", label: "African" },
        { value: "asian", label: "Asian" },
        { value: "american", label: "American" },
        { value: "british", label: "British" },
        { value: "cajun", label: "Cajun" },
        { value: "caribbean", label: "Caribbean" },
        { value: "chinese", label: "Chinese" },
        { value: "eastern european", label: "Eastern European" },
        { value: "european", label: "European" },
        { value: "french", label: "French" },
        { value: "german", label: "German" },
        { value: "greek", label: "Greek" },
        { value: "indian", label: "Indian" },
        { value: "irish", label: "Irish" },
        { value: "italian", label: "Italian" },
        { value: "japanese", label: "Japanese" },
        { value: "jewish", label: "Jewish" },
        { value: "korean", label: "Korean" },
        { value: "latin american", label: "Latin American" },
        { value: "mediterranean", label: "Mediterranean" },
        { value: "mexican", label: "Mexican" },
        { value: "middle eastern", label: "Middle Eastern" },
        { value: "nordic", label: "Nordic" },
        { value: "southern", label: "Southern" },
        { value: "spanish", label: "Spanish" },
        { value: "thai", label: "Thai" },
        { value: "vietnamese", label: "Vietnamese" },
    ];

    const dietOptions = [
        { value: "gluten free", label: "Gluten Free" },
        { value: "ketogenic", label: "Ketogenic" },
        { value: "vegetarian", label: "Vegetarian" },
        { value: "lacto-vegetarian", label: "Lacto-Vegetarian" },
        { value: "ovo-vegetarian", label: "Ovo-Vegetarian" },
        { value: "vegan", label: "Vegan" },
        { value: "pescetarian", label: "Pescetarian" },
        { value: "paleo", label: "Paleo" },
        { value: "primal", label: "Primal" },
        { value: "low fodmap", label: "Low FODMAP" },
        { value: "whole30", label: "Whole30" },
    ];

    const intolerancesOptions = [
        { value: "dairy", label: "Dairy" },
        { value: "egg", label: "Egg" },
        { value: "gluten", label: "Gluten" },
        { value: "grain", label: "Grain" },
        { value: "peanut", label: "Peanut" },
        { value: "seafood", label: "Seafood" },
        { value: "sesame", label: "Sesame" },
        { value: "shellfish", label: "Shellfish" },
        { value: "soy", label: "Soy" },
        { value: "sulfite", label: "Sulfite" },
        { value: "tree nut", label: "Tree Nut" },
        { value: "wheat", label: "Wheat" },
    ];

    const handlePreferredCuisineChange = (selectedOptions: any) => {
        updateUserData({
            userId: userData.id,
            preferredCuisine: selectedOptions.map(
                (option: any) => option.value
            ),
        });
    };

    const handleExcludedCuisineChange = (selectedOptions: any) => {
        updateUserData({
            userId: userData.id,
            excludedCuisine: selectedOptions.map((option: any) => option.value),
        });
    };

    const handleDietChange = (selectedOptions: any) => {
        updateUserData({
            userId: userData.id,
            diet: selectedOptions.map((option: any) => option.value),
        });
    };

    const handleIntolerancesChange = (selectedOptions: any) => {
        updateUserData({
            userId: userData.id,
            intolerances: selectedOptions.map((option: any) => option.value),
        });
    };

    const customStyles = {
        control: (provided: any) => ({
            ...provided,
            backgroundColor: "#1a1a1a",
            borderColor: "#6c757d",
            borderRadius: "8px",
            minHeight: "40px",
        }),
        menu: (provided: any) => ({
            ...provided,
            backgroundColor: "#1a1a1a", 
            color: "#fff", 
        }),
        menuList: (provided: any) => ({
            ...provided,

            "::-webkit-scrollbar": {
                width: "4px",
                height: "0px",
            },
            "::-webkit-scrollbar-track": {
                background: "#1a1a1a",
            },
            "::-webkit-scrollbar-thumb": {
                background: "#ffc107",
                borderRadius: "5px",
            },
            "::-webkit-scrollbar-thumb:hover": {
                background: "#555",
            },
        }),
        option: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: state.isSelected ? "#000000" : null,
            color: "#fff",
            "&:hover": {
                backgroundColor: "#ffc10750",
            },
        }),
        multiValueLabel: (provided: any) => ({
            ...provided,
            color: "#f5f5f5",
        }),
        multiValue: (provided: any) => ({
            ...provided,
            backgroundColor: "#333333",
            borderRadius: '4px',
        }),
        multiValueRemove: (provided: any) => ({
            ...provided,
            color: "white",
            backgroundColor: "#6c757d",
            borderRadius: "4px",
            ":hover": {
                backgroundColor: "#dc3545",
                color: "white",
            },
        }),
    };

    return (
        <>
            <Navbar />
            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <>
                    <div className="container flex-column align-items-start">
                        <h1 className="mt-5 profile-title">Profile Page</h1>
                        <h3 className="profile-subtitle">
                            Welcome, {userData.name}
                        </h3>
                    </div>
                    <div className="container mb-5 d-flex align-items-center justify-content-between">
                        <div className="card mt-5 mx-3">
                            <h5 className="title">Preferences Settings</h5>
                            <div>
                                <p className="mb-2">Preferred cuisine</p>
                                <Select
                                    isMulti
                                    options={cuisineOptions}
                                    value={(
                                        userData.preferredCuisine || []
                                    ).map((cuisine) => ({
                                        value: cuisine,
                                        label: cuisine,
                                    }))}
                                    styles={customStyles}
                                    onChange={handlePreferredCuisineChange}
                                />
                            </div>

                            <div>
                                <p className="mt-3 mb-2">Exclude cuisine</p>
                                <Select
                                    isMulti
                                    options={cuisineOptions}
                                    value={(userData.excludedCuisine || []).map(
                                        (cuisine) => ({
                                            value: cuisine,
                                            label: cuisine,
                                        })
                                    )}
                                    styles={customStyles}
                                    onChange={handleExcludedCuisineChange}
                                />
                            </div>

                            <div>
                                <p className="mt-3 mb-2">Diet</p>
                                <Select
                                    isMulti
                                    options={dietOptions}
                                    value={(userData.diet || []).map(
                                        (diet) => ({
                                            value: diet,
                                            label: diet,
                                        })
                                    )}
                                    styles={customStyles}
                                    onChange={handleDietChange}
                                />
                            </div>

                            <div>
                                <p className="mt-3 mb-2">Intolerances</p>
                                <Select
                                    isMulti
                                    options={intolerancesOptions}
                                    value={(userData.intolerances || []).map(
                                        (intolerance) => ({
                                            value: intolerance,
                                            label: intolerance,
                                        })
                                    )}
                                    styles={customStyles}
                                    onChange={handleIntolerancesChange}
                                />
                            </div>
                        </div>

                        <div className="card mt-5 mx-3 p-3">
                            <h5 className="title">Account Settings</h5>
                            <div className="mb-3">
                                {editableName ? (
                                    <div className="d-flex flex-column">
                                        <input
                                            type="text"
                                            className="form-control mb-2"
                                            value={editedName}
                                            onChange={handleChangeName}
                                        />
                                        <div className="btn-group d-flex justify-content-center">
                                            <button
                                                className="btn btn-primary"
                                                onClick={handleSaveName}
                                            >
                                                Save Name
                                            </button>
                                            <button
                                                className="btn btn-secondary"
                                                onClick={handleCancelName}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                        {nameError && (
                                            <p className="text-danger mt-2">
                                                {nameError}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="d-flex justify-content-between align-items-center">
                                        <p className="mb-0">
                                            Name:{" "}
                                            {userData.name.length > 15
                                                ? userData.name.substring(
                                                      0,
                                                      15
                                                  ) + "..."
                                                : userData.name}
                                        </p>
                                        <button
                                            className="btn btn-outline-primary"
                                            onClick={handleEditName}
                                        >
                                            Edit Name
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="mb-3">
                                {editableEmail ? (
                                    <div className="d-flex flex-column">
                                        <input
                                            type="email"
                                            className="form-control mb-2"
                                            value={editedEmail}
                                            onChange={handleChangeEmail}
                                        />
                                        <div className="btn-group d-flex justify-content-center">
                                            <button
                                                className="btn btn-primary"
                                                onClick={handleSaveEmail}
                                            >
                                                Save Email
                                            </button>
                                            <button
                                                className="btn btn-secondary"
                                                onClick={handleCancelEmail}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                        {emailError && (
                                            <p className="text-danger mt-2">
                                                {emailError}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="d-flex justify-content-between align-items-center">
                                        <p className="mb-0">
                                            Email:{" "}
                                            {userData.email.length > 15
                                                ? userData.email.substring(
                                                      0,
                                                      15
                                                  ) + "..."
                                                : userData.email}
                                        </p>
                                        <button
                                            className="btn btn-outline-primary"
                                            onClick={handleEditEmail}
                                        >
                                            Edit Email
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="mb-3">
                                {editablePassword ? (
                                    <form
                                        onSubmit={handleSavePassword}
                                        className="d-flex flex-column"
                                    >
                                        <input
                                            type="password"
                                            className="form-control mb-2"
                                            placeholder="Current Password"
                                            value={currentPassword}
                                            onChange={
                                                handleChangeCurrentPassword
                                            }
                                            autoComplete="true"
                                        />
                                        <input
                                            type="password"
                                            className="form-control mb-2"
                                            placeholder="New Password"
                                            value={newPassword}
                                            onChange={handleChangeNewPassword}
                                            autoComplete="true"
                                        />
                                        <input
                                            type="password"
                                            className="form-control mb-2"
                                            placeholder="Confirm New Password"
                                            value={confirmNewPassword}
                                            onChange={
                                                handleChangeConfirmNewPassword
                                            }
                                            autoComplete="true"
                                        />
                                        <div className="btn-group d-flex justify-content-center">
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                            >
                                                Save Password
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={handleCancelPassword}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                        {passwordError && (
                                            <p className="text-danger mt-2">
                                                {passwordError}
                                            </p>
                                        )}
                                    </form>
                                ) : (
                                    <div className="d-flex justify-content-center">
                                        <button
                                            className="btn btn-outline-primary"
                                            onClick={handleEditPassword}
                                        >
                                            Change Password
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="d-flex justify-content-center">
                                <button
                                    className="btn btn-danger"
                                    onClick={handleDeleteAccount}
                                >
                                    Delete My Account
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default Profile;
