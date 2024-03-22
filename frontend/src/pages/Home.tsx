import "../App.css";
import { FormEvent, useEffect, useRef, useState } from "react";
import * as api from "../api";
import { Recipe } from "../types";
import RecipeCard from "../components/RecipeCard";
import RecipeModal from "../components/RecipeModal";
import { useNavigate } from "react-router-dom";
import { logout, isAuthenticated, getUserId, getUserRole } from "../authApi";

type Tabs = "search" | "favourites";

const Home = () => {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [searchIngredient, setSearchIngredient] = useState<string>("");
    const [searchIngredients, setSearchIngredients] = useState<string[]>([]);
    const [searchType, setSearchType] = useState<string>("name");
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | undefined>(
        undefined
    );
    const [selectedTab, setSelectedTab] = useState<Tabs>("search");
    const [favouriteRecipes, setFavouriteRecipes] = useState<Recipe[]>([]);
    const [recipesDisplayed, setRecipesDisplayed] = useState<boolean>(false);
    const pageNumber = useRef(1);
    const [searchClicked, setSearchClicked] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!isAuthenticated()) {
                    navigate("/login");
                    return;
                }
                const userRoleResponse = await getUserRole();
                const userRole = userRoleResponse?.role;
                if (userRole === "admin") {
                    navigate("/admin");
                    return;
                } else if (searchClicked) {
                    const favouriteRecipesResponse =
                        await api.getFavouriteRecipes();
                    setFavouriteRecipes(favouriteRecipesResponse.results);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [searchClicked, navigate]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            console.error(error);
        }
    };

    const handleSearchSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setSearchClicked(true);
        try {
            let fetchedRecipes: Recipe[] = [];
            const pageNumberToUse = 1;
            if (
                (searchType === "name" && searchTerm) ||
                (searchType === "ingredients" && searchIngredients.length > 0)
            ) {
                if (searchType === "name") {
                    const response = await api.searchRecipes(
                        searchTerm,
                        pageNumberToUse
                    );
                    fetchedRecipes = response.results; // Extract results array
                } else {
                    const response = await api.searchRecipesByIngredients(
                        searchIngredients,
                        pageNumberToUse
                    );
                    if (Array.isArray(response)) {
                        fetchedRecipes = response; // Use response directly if it's an array
                    } else {
                        console.error(
                            "Unexpected response format from API:",
                            response
                        );
                        return; // Exit early if response is not an array
                    }
                }
                setRecipes(fetchedRecipes);
                pageNumber.current = pageNumberToUse;
                setRecipesDisplayed(true); // Set to true when recipes are displayed
            }
        } catch (error) {
            console.error("Error searching recipes:", error);
        }
    };

    const handleViewMoreClick = async () => {
        const nextPage = pageNumber.current + 1;
        try {
            let nextRecipes: Recipe[] = [];
            let response;

            if (searchType === "name" && searchTerm) {
                response = await api.searchRecipes(searchTerm, nextPage);
                nextRecipes = response.results;
                setRecipes((prevRecipes) => [...prevRecipes, ...nextRecipes]); // Update state with new recipes
            } else if (
                searchType === "ingredients" &&
                searchIngredients.length > 0
            ) {
                response = await api.searchRecipesByIngredients(
                    searchIngredients,
                    nextPage
                );
                if (Array.isArray(response)) {
                    nextRecipes = response;
                } else if (response && Array.isArray(response.results)) {
                    nextRecipes = response.results;
                }
                // Filter out recipes that are already displayed
                nextRecipes = nextRecipes.filter(
                    (recipe) =>
                        !recipes.find(
                            (existingRecipe) => existingRecipe.id === recipe.id
                        )
                );
                setRecipes((prevRecipes) => [...prevRecipes, ...nextRecipes]); // Update state with new recipes
            }

            if (nextRecipes.length > 0) {
                pageNumber.current = nextPage;
            } else {
                console.error("No more recipes found");
            }
        } catch (error) {
            console.error("Error loading more recipes:", error);
        }
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
                (favRecipe) => recipe.id !== favRecipe.id
            );
            setFavouriteRecipes(updatedRecipes);
        } catch (error) {
            console.error(error);
        }
    };

    const handleIngredientChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = event.target.value;
        const ingredientsArray = value.split(/[,\s]+/).filter(Boolean);
        setSearchIngredients(ingredientsArray);
        setSearchIngredient(value);
    };

    const clearDisplayedRecipes = () => {
        setRecipes([]);
        setRecipesDisplayed(false);
        pageNumber.current = 1;
    };

    const handleSearchTypeChange = (newSearchType: string) => {
        // Clear displayed recipes when search type changes
        if (recipesDisplayed) {
            clearDisplayedRecipes();
        }
        setSearchType(newSearchType);
    };

    return (
        <div>
            <button onClick={handleLogout}>Logout</button>
            <div className="tabs">
                <h1 onClick={() => setSelectedTab("search")}>Recipe Search</h1>
                <h1 onClick={() => setSelectedTab("favourites")}>Favourites</h1>
            </div>
            {selectedTab === "search" && (
                <>
                    <form onSubmit={(event) => handleSearchSubmit(event)}>
                        {searchType === "name" && (
                            <input
                                type="text"
                                required
                                placeholder="Enter a recipe name"
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(event.target.value)
                                }
                            />
                        )}
                        {searchType === "ingredients" && (
                            <input
                                type="text"
                                required
                                placeholder="Enter ingredients"
                                value={searchIngredient}
                                onChange={handleIngredientChange}
                            />
                        )}
                        <button type="submit">Submit</button>
                    </form>
                    <div>
                        <select
                            value={searchType}
                            onChange={(event) =>
                                handleSearchTypeChange(event.target.value)
                            }
                        >
                            <option value="name">Search by Name</option>
                            <option value="ingredients">
                                Search by Ingredients
                            </option>
                        </select>
                    </div>
                    {selectedTab === "search" && (
                        <>
                            {recipes.map((recipe, index) => {
                                const isFavourite = favouriteRecipes.some(
                                    (favRecipe) => recipe.id === favRecipe.id
                                );
                                const uniqueKey = `${recipe.id}-${index}`;
                                // Conditionally render RecipeCard based on searchType
                                if (searchType === "name") {
                                    return (
                                        <RecipeCard
                                            key={uniqueKey}
                                            recipe={recipe}
                                            onClick={() =>
                                                setSelectedRecipe(recipe)
                                            }
                                            onFavouriteButtonClick={
                                                isFavourite
                                                    ? removeFavouriteRecipe
                                                    : addFavouriteRecipe
                                            }
                                            isFavourite={isFavourite}
                                            searchType={searchType}
                                            selectedTab={selectedTab}
                                        />
                                    );
                                } else {
                                    // If searchType is ingredients, only render RecipeCard if it's not a favourite
                                    if (!isFavourite) {
                                        return (
                                            <RecipeCard
                                                key={uniqueKey}
                                                recipe={recipe}
                                                onClick={() =>
                                                    setSelectedRecipe(recipe)
                                                }
                                                onFavouriteButtonClick={
                                                    isFavourite
                                                        ? removeFavouriteRecipe
                                                        : addFavouriteRecipe
                                                }
                                                isFavourite={isFavourite}
                                                searchType={searchType}
                                                selectedTab={selectedTab}
                                            />
                                        );
                                    } else {
                                        return null; // Skip rendering if it's a favourite recipe
                                    }
                                }
                            })}
                        </>
                    )}
                    {recipesDisplayed && recipes.length > 0 && (
                        <button
                            className="view-more-button"
                            onClick={handleViewMoreClick}
                        >
                            View More
                        </button>
                    )}
                </>
            )}
            {selectedTab === "favourites" && (
                <>
                    {favouriteRecipes.map((recipe) => (
                        <RecipeCard
                            key={recipe.id}
                            recipe={recipe}
                            onClick={() => setSelectedRecipe(recipe)}
                            onFavouriteButtonClick={removeFavouriteRecipe}
                            isFavourite={true}
                            searchType={searchType}
                            selectedTab={selectedTab}
                        />
                    ))}
                </>
            )}
            {selectedRecipe && (
                <RecipeModal
                    recipeId={selectedRecipe.id.toString()}
                    recipe={selectedRecipe}
                    onClose={() => setSelectedRecipe(undefined)}
                />
            )}
        </div>
    );
};

export default Home;
