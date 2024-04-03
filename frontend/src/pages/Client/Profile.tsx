import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import Navbar from "../../components/Navbar";
import Select from "react-select";

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

    return (
        <>
            <Navbar />
            <h1>Profile Page</h1>

            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <>
                    <h3>Welcome, {userData.name}</h3>

                    <h5>Account Settings</h5>
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
                                <input
                                    type="password"
                                    placeholder="Confirm New Password"
                                    value={confirmNewPassword}
                                    onChange={handleChangeConfirmNewPassword}
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

                    <h5>Preferences Settings</h5>
                    {userData && (
                        <>
                            <div>
                                <p>Preferred cuisine</p>
                                <Select
                                    isMulti
                                    options={cuisineOptions}
                                    value={(
                                        userData.preferredCuisine || []
                                    ).map((cuisine) => ({
                                        value: cuisine,
                                        label: cuisine,
                                    }))}
                                    onChange={handlePreferredCuisineChange}
                                />
                            </div>

                            <div>
                                <p>Exclude cuisine</p>
                                <Select
                                    isMulti
                                    options={cuisineOptions}
                                    value={(userData.excludedCuisine || []).map(
                                        (cuisine) => ({
                                            value: cuisine,
                                            label: cuisine,
                                        })
                                    )}
                                    onChange={handleExcludedCuisineChange}
                                />
                            </div>

                            <div>
                                <p>Diet</p>
                                <Select
                                    isMulti
                                    options={dietOptions}
                                    value={(userData.diet || []).map(
                                        (diet) => ({
                                            value: diet,
                                            label: diet,
                                        })
                                    )}
                                    onChange={handleDietChange}
                                />
                            </div>

                            <div>
                                <p>Intolerances</p>
                                <Select
                                    isMulti
                                    options={intolerancesOptions}
                                    value={(userData.intolerances || []).map(
                                        (intolerance) => ({
                                            value: intolerance,
                                            label: intolerance,
                                        })
                                    )}
                                    onChange={handleIntolerancesChange}
                                />
                            </div>
                        </>
                    )}
                </>
            )}
        </>
    );
};

export default Profile;
