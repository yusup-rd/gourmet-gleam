import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";

interface UserPreferences {
    preferredCuisine: string[];
    excludedCuisine: string[];
    diet: string[];
    intolerances: string[];
}

const Recommend = () => {
    const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const fetchUserPreferences = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:5000/recommendations",
                    {
                        withCredentials: true,
                    }
                );

                if (response.data.message) {
                    setErrorMessage(response.data.message);
                } else {
                    setUserPreferences(response.data);
                }
            } catch (error) {
                console.error("Error fetching user preferences:", error);
                setErrorMessage("Failed to fetch user preferences");
            }
        };

        fetchUserPreferences();
    }, []);

    return (
        <>
            <Navbar />
            <div>
                {errorMessage ? (
                    <p>{errorMessage}</p>
                ) : userPreferences ? (
                    <div>
                        <h2>User Preferences</h2>
                        {userPreferences.preferredCuisine.length > 0 ||
                        userPreferences.excludedCuisine.length > 0 ||
                        userPreferences.diet.length > 0 ||
                        userPreferences.intolerances.length > 0 ? (
                            <p>
                                Here are some recommendations based on your
                                preferences: <br />
                                {userPreferences.preferredCuisine.length > 0 && (
                                    <>Preferred Cuisine:{" "}
                                    {userPreferences.preferredCuisine.map((cuisine, index) => (
                                        <span key={index}>
                                            {index === userPreferences.preferredCuisine.length - 1 ? (
                                                cuisine.charAt(0).toUpperCase() + cuisine.slice(1)
                                            ) : (
                                                cuisine.charAt(0).toUpperCase() + cuisine.slice(1) + ", "
                                            )}
                                        </span>
                                    ))}
                                    <br /></>
                                )}
                                {userPreferences.excludedCuisine.length > 0 && (
                                    <>Excluded Cuisine:{" "}
                                    {userPreferences.excludedCuisine.map((cuisine, index) => (
                                        <span key={index}>
                                            {index === userPreferences.excludedCuisine.length - 1 ? (
                                                cuisine.charAt(0).toUpperCase() + cuisine.slice(1)
                                            ) : (
                                                cuisine.charAt(0).toUpperCase() + cuisine.slice(1) + ", "
                                            )}
                                        </span>
                                    ))}
                                    <br /></>
                                )}
                                {userPreferences.diet.length > 0 && (
                                    <>Diet:{" "}
                                    {userPreferences.diet.map((diet, index) => (
                                        <span key={index}>
                                            {index === userPreferences.diet.length - 1 ? (
                                                diet.charAt(0).toUpperCase() + diet.slice(1)
                                            ) : (
                                                diet.charAt(0).toUpperCase() + diet.slice(1) + ", "
                                            )}
                                        </span>
                                    ))}
                                    <br /></>
                                )}
                                {userPreferences.intolerances.length > 0 && (
                                    <>Intolerances:{" "}
                                    {userPreferences.intolerances.map((intolerance, index) => (
                                        <span key={index}>
                                            {index === userPreferences.intolerances.length - 1 ? (
                                                intolerance.charAt(0).toUpperCase() + intolerance.slice(1)
                                            ) : (
                                                intolerance.charAt(0).toUpperCase() + intolerance.slice(1) + ", "
                                            )}
                                        </span>
                                    ))}
                                    <br /></>
                                )}
                            </p>
                        ) : (
                            <p>You haven't set any preferences in your account yet. Please take a moment to personalize your preferences to enhance your experience.</p>
                        )}
                        <p>
                            Go to <Link to="/profile">Profile Page</Link> to
                            edit preferences.
                        </p>
                    </div>
                ) : (
                    <p>Loading...</p>
                )}
            </div>
        </>
    );
};

export default Recommend;