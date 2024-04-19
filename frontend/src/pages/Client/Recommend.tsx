import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { Recipe } from "../../types";
import RecipeCard from "../../components/RecipeCard";
import RecipeModal from "../../components/RecipeModal";
import * as api from "../../api";
import { getUserId } from "../Auth/authApi";

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
    const [page, setPage] = useState(1);
    const [recipesFetched, setRecipesFetched] = useState(true);
    const [moreRecipesAvailable, setMoreRecipesAvailable] = useState(true);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | undefined>(
        undefined
    );
    const [favouriteRecipes, setFavouriteRecipes] = useState<Recipe[]>([]);
    const [favouriteRecipeIds, setFavouriteRecipeIds] = useState<number[]>([]);

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
        if (userPreferences && recipesFetched) {
            fetchRecipes(userPreferences, page);
            setRecipesFetched(false);
        }
    }, [userPreferences, recipesFetched, page]);

    useEffect(() => {
        const fetchFavourites = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:5000/recommendations/favourites",
                    {
                        withCredentials: true,
                    }
                );

                if (response.data) {
                    const recipeIds = response.data.map(
                        (fav: any) => fav.recipeId
                    );
                    setFavouriteRecipeIds(recipeIds);
                } else {
                    console.log("Unable to fetch favs");
                }
            } catch (error) {
                console.error("Error fetching favourites:", error);
            }
        };

        fetchFavourites();
    }, []);

    const fetchRecipes = async (
        userPreferences: UserPreferences,
        page: number
    ) => {
        const { preferredCuisine, excludedCuisine, diet, intolerances } =
            userPreferences;

        try {
            const preferences = [
                ...preferredCuisine.map(
                    (cuisine) => `preferredCuisine=${cuisine}`
                ),
                ...excludedCuisine.map(
                    (cuisine) => `excludedCuisine=${cuisine}`
                ),
                ...diet.map((d) => `diet=${d}`),
                ...intolerances.map(
                    (intolerance) => `intolerances=${intolerance}`
                ),
            ].join("&");

            const response = await axios.get(
                `http://localhost:5000/recommendations/recipes?${preferences}&page=${page}`
            );

            if (response.data.results.length === 0) {
                setMoreRecipesAvailable(false);
            } else {
                setRecipes((prevRecipes) => [
                    ...prevRecipes,
                    ...response.data.results,
                ]);
            }
        } catch (error) {
            console.error("Error fetching recipes:", error);
            setErrorMessage("Failed to fetch recipes");
        }
    };

    const handleViewMoreClick = () => {
        setPage((prevPage) => prevPage + 1);
        setRecipesFetched(true);
    };

    const addFavouriteRecipe = async (recipe: Recipe) => {
        try {
            const userId = await getUserId();
            await api.addFavouriteRecipe(recipe, userId);
            setFavouriteRecipes([...favouriteRecipes, recipe]);
        } catch (error) {
            console.error(error);
        }
    };

    const removeFavouriteRecipe = async (recipe: Recipe) => {
        try {
            const userId = await getUserId();
            await api.removeFavouriteRecipe(recipe, userId);
            const updatedRecipes = favouriteRecipes.filter(
                (favRecipe) => favRecipe.id !== recipe.id
            );
            setFavouriteRecipes(updatedRecipes);
        } catch (error) {
            console.error(error);
        }
    };

    const toggleFavourite = async (recipeId: number) => {
        try {
            const recipe = recipes.find((recipe) => recipe.id === recipeId);

            if (!recipe) {
                console.error("Recipe not found");
                return;
            }

            if (favouriteRecipeIds.includes(recipeId)) {
                await removeFavouriteRecipe(recipe);
                const updatedRecipeIds = favouriteRecipeIds.filter(
                    (id) => id !== recipeId
                );
                setFavouriteRecipeIds(updatedRecipeIds);
            } else {
                await addFavouriteRecipe(recipe);
                const updatedRecipeIds = [...favouriteRecipeIds, recipeId];
                setFavouriteRecipeIds(updatedRecipeIds);
            }
        } catch (error) {
            console.error(error);
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
                                    {recipes.map((recipe, index) => {
                                        const isFavourite =
                                            favouriteRecipeIds.includes(
                                                recipe.id
                                            );
                                        const uniqueKey = `${recipe.id}-${index}`;
                                        return (
                                            <li key={uniqueKey}>
                                                <RecipeCard
                                                    recipe={recipe}
                                                    onClick={() =>
                                                        setSelectedRecipe(
                                                            recipe
                                                        )
                                                    }
                                                    onFavouriteButtonClick={() =>
                                                        toggleFavourite(
                                                            recipe.id
                                                        )
                                                    }
                                                    isFavourite={isFavourite}
                                                    searchType="name"
                                                    selectedTab="search"
                                                />
                                            </li>
                                        );
                                    })}
                                </ul>
                                {moreRecipesAvailable ? (
                                    <button onClick={handleViewMoreClick}>
                                        View More
                                    </button>
                                ) : (
                                    <p>That's all recommendations available.</p>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <p>Loading...</p>
                )}
            </div>
            {selectedRecipe && (
                <RecipeModal
                    recipeId={selectedRecipe.id.toString()}
                    recipe={selectedRecipe}
                    onClose={() => setSelectedRecipe(undefined)}
                />
            )}
        </>
    );
};

export default Recommend;
