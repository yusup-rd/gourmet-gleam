import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { Recipe } from "../../types";

interface UserPreferences {
    preferredCuisine: string[];
    excludedCuisine: string[];
    diet: string[];
    intolerances: string[];
}

const Recommend = () => {
    const [userPreferences, setUserPreferences] =
        useState<UserPreferences | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [recipes, setRecipes] = useState<Recipe[]>([]);

    const [recipesFetched, setRecipesFetched] = useState(false);

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

    useEffect(() => {
        if (userPreferences && !recipesFetched) {
            fetchRecipes(userPreferences);
            setRecipesFetched(true);
        }
    }, [userPreferences, recipesFetched]);

    const fetchRecipes = async (userPreferences: UserPreferences) => {
        const { preferredCuisine, excludedCuisine, diet, intolerances } =
            userPreferences;
        const page = 1;

        const preferences = [
            ...preferredCuisine.map((cuisine) => `preferredCuisine=${cuisine}`),
            ...excludedCuisine.map((cuisine) => `excludedCuisine=${cuisine}`),
            ...diet.map((d) => `diet=${d}`),
            ...intolerances.map((intolerance) => `intolerances=${intolerance}`),
        ].join("&");

        try {
            console.log("Preferences passed from Front end: ", preferences);
            const response = await axios.get(
                `http://localhost:5000/recommendations/recipes?${preferences}&page=${page}`
            );

            setRecipes(response.data.results);
        } catch (error) {
            console.error("Error fetching recipes:", error);
            setErrorMessage("Failed to fetch recipes");
        }
    };

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
                                {userPreferences.preferredCuisine.length >
                                    0 && (
                                    <>
                                        Preferred Cuisine:{" "}
                                        {userPreferences.preferredCuisine.map(
                                            (cuisine, index) => (
                                                <span key={index}>
                                                    {index ===
                                                    userPreferences
                                                        .preferredCuisine
                                                        .length -
                                                        1
                                                        ? cuisine
                                                              .charAt(0)
                                                              .toUpperCase() +
                                                          cuisine.slice(1)
                                                        : cuisine
                                                              .charAt(0)
                                                              .toUpperCase() +
                                                          cuisine.slice(1) +
                                                          ", "}
                                                </span>
                                            )
                                        )}
                                        <br />
                                    </>
                                )}
                                {userPreferences.excludedCuisine.length > 0 && (
                                    <>
                                        Excluded Cuisine:{" "}
                                        {userPreferences.excludedCuisine.map(
                                            (cuisine, index) => (
                                                <span key={index}>
                                                    {index ===
                                                    userPreferences
                                                        .excludedCuisine
                                                        .length -
                                                        1
                                                        ? cuisine
                                                              .charAt(0)
                                                              .toUpperCase() +
                                                          cuisine.slice(1)
                                                        : cuisine
                                                              .charAt(0)
                                                              .toUpperCase() +
                                                          cuisine.slice(1) +
                                                          ", "}
                                                </span>
                                            )
                                        )}
                                        <br />
                                    </>
                                )}
                                {userPreferences.diet.length > 0 && (
                                    <>
                                        Diet:{" "}
                                        {userPreferences.diet.map(
                                            (diet, index) => (
                                                <span key={index}>
                                                    {index ===
                                                    userPreferences.diet
                                                        .length -
                                                        1
                                                        ? diet
                                                              .charAt(0)
                                                              .toUpperCase() +
                                                          diet.slice(1)
                                                        : diet
                                                              .charAt(0)
                                                              .toUpperCase() +
                                                          diet.slice(1) +
                                                          ", "}
                                                </span>
                                            )
                                        )}
                                        <br />
                                    </>
                                )}
                                {userPreferences.intolerances.length > 0 && (
                                    <>
                                        Intolerances:{" "}
                                        {userPreferences.intolerances.map(
                                            (intolerance, index) => (
                                                <span key={index}>
                                                    {index ===
                                                    userPreferences.intolerances
                                                        .length -
                                                        1
                                                        ? intolerance
                                                              .charAt(0)
                                                              .toUpperCase() +
                                                          intolerance.slice(1)
                                                        : intolerance
                                                              .charAt(0)
                                                              .toUpperCase() +
                                                          intolerance.slice(1) +
                                                          ", "}
                                                </span>
                                            )
                                        )}
                                        <br />
                                    </>
                                )}
                            </p>
                        ) : (
                            <p>
                                You haven't set any preferences in your account
                                yet. Please take a moment to personalize your
                                preferences to enhance your experience.
                            </p>
                        )}
                        <p>
                            Go to <Link to="/profile">Profile Page</Link> to
                            edit preferences.
                        </p>
                        {recipes.length > 0 && (
                            <div>
                                <h2>Recommended Recipes</h2>
                                <ul>
                                    {recipes.map((recipe, index) => (
                                        <li key={index}>{recipe.title}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ) : (
                    <p>Loading...</p>
                )}
            </div>
        </>
    );
};

export default Recommend;
