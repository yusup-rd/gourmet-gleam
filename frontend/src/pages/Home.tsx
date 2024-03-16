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
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | undefined>(
        undefined
    );
    const [selectedTab, setSelectedTab] = useState<Tabs>("search");
    const [favouriteRecipes, setFavouriteRecipes] = useState<Recipe[]>([]);
    const pageNumber = useRef(1);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!isAuthenticated()) {
                    navigate("/login");
                    return; // Stop further execution if not authenticated
                }

                const userRoleResponse = await getUserRole(); // Fetch user role
                const userRole = userRoleResponse?.role;

                if (userRole === "admin") {
                    navigate("/admin"); // Redirect to the Admin page if the user is an admin
                } else {
                    const favouriteRecipes = await api.getFavouriteRecipes(); // Fetch favorite recipes for the user
                    setFavouriteRecipes(favouriteRecipes.results);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            console.log(error);
        }
    };

    const handleSearchSubmit = async (event: FormEvent) => {
        event.preventDefault();
        try {
            const recipes = await api.searchRecipes(searchTerm, 1);
            setRecipes(recipes.results);
            pageNumber.current = 1;
        } catch (e) {
            console.log(e);
        }
    };

    const handleViewMoreClick = async () => {
        const nextPage = pageNumber.current + 1;
        try {
            const nextRecipes = await api.searchRecipes(searchTerm, nextPage);
            setRecipes([...recipes, ...nextRecipes.results]);
            pageNumber.current = nextPage;
        } catch (error) {
            console.log(error);
        }
    };

    const addFavouriteRecipe = async (recipe: Recipe) => {
        try {
            const userId = await getUserId(); // Get user ID
            await api.addFavouriteRecipe(recipe, userId); // Add favorite recipe for the user
            setFavouriteRecipes([...favouriteRecipes, recipe]);
        } catch (error) {
            console.log(error);
        }
    };

    const removeFavouriteRecipe = async (recipe: Recipe) => {
        try {
            const userId = await getUserId(); // Get user ID
            await api.removeFavouriteRecipe(recipe, userId); // Remove favorite recipe for the user
            const updatedRecipes = favouriteRecipes.filter(
                (favRecipe) => recipe.id !== favRecipe.id
            );
            setFavouriteRecipes(updatedRecipes);
        } catch (error) {
            console.log(error);
        }
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
                        <input
                            type="text"
                            required
                            placeholder="Enter a search term..."
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(event.target.value)
                            }
                        ></input>
                        <button type="submit">Submit</button>
                    </form>

                    {recipes.map((recipe) => {
                        const isFavourite = favouriteRecipes.some(
                            (favRecipe) => recipe.id === favRecipe.id
                        );

                        return (
                            <RecipeCard
                                key={recipe.id}
                                recipe={recipe}
                                onClick={() => setSelectedRecipe(recipe)}
                                onFavouriteButtonClick={
                                    isFavourite
                                        ? removeFavouriteRecipe
                                        : addFavouriteRecipe
                                }
                                isFavourite={isFavourite}
                            />
                        );
                    })}

                    <button
                        className="view-more-button"
                        onClick={handleViewMoreClick}
                    >
                        View More
                    </button>
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
                        />
                    ))}
                </>
            )}

            {selectedRecipe ? (
                <RecipeModal
                    recipeId={selectedRecipe.id.toString()}
                    recipe={selectedRecipe}
                    onClose={() => setSelectedRecipe(undefined)}
                />
            ) : null}
        </div>
    );
};

export default Home;
