import "../../App.css";
import { FormEvent, useEffect, useRef, useState } from "react";
import * as api from "../../api";
import { Recipe } from "../../types";
import RecipeCard from "../../components/RecipeCard";
import RecipeModal from "../../components/RecipeModal";
import Navbar from "../../components/Navbar";
import HomeText from "../../components/HomeText";
import { useNavigate } from "react-router-dom";
import { isAuthenticated, getUserId, getUserRole } from "../Auth/authApi";

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
    const [searchClickedByName, setSearchClickedByName] =
        useState<boolean>(false);
    const [searchClickedByIngredients, setSearchClickedByIngredients] =
        useState<boolean>(false);
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
                } else {
                    const favouriteRecipesResponse =
                        await api.getFavouriteRecipes();
                    setFavouriteRecipes(favouriteRecipesResponse.results);
                    if (
                        (searchClickedByName && searchType === "name") ||
                        (searchClickedByIngredients &&
                            searchType === "ingredients")
                    ) {
                        const pageNumberToUse = 1;
                        let fetchedRecipes: Recipe[] = [];
                        if (
                            (searchType === "name" && searchTerm) ||
                            (searchType === "ingredients" &&
                                searchIngredients.length > 0)
                        ) {
                            if (searchType === "name") {
                                const response = await api.searchRecipes(
                                    searchTerm,
                                    pageNumberToUse
                                );
                                fetchedRecipes = response.results;
                            } else {
                                const response =
                                    await api.searchRecipesByIngredients(
                                        searchIngredients,
                                        pageNumberToUse
                                    );
                                if (Array.isArray(response)) {
                                    fetchedRecipes = response;
                                } else {
                                    console.error(
                                        "Unexpected response format from API:",
                                        response
                                    );
                                    return;
                                }
                            }
                            setRecipes(fetchedRecipes);
                            pageNumber.current = pageNumberToUse;
                            setRecipesDisplayed(true);
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, [
        selectedTab,
        searchClickedByName,
        searchClickedByIngredients,
        searchType,
        navigate,
    ]);

    const handleSearchSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (searchType === "name") {
            setSearchClickedByName(true);
        } else if (searchType === "ingredients") {
            setSearchClickedByIngredients(true);
        }
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
                    fetchedRecipes = response.results;
                } else {
                    const response = await api.searchRecipesByIngredients(
                        searchIngredients,
                        pageNumberToUse
                    );
                    if (Array.isArray(response)) {
                        fetchedRecipes = response;
                    } else {
                        console.error(
                            "Unexpected response format from API:",
                            response
                        );
                        return;
                    }
                }
                setRecipes(fetchedRecipes);
                pageNumber.current = pageNumberToUse;
                setRecipesDisplayed(true);
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
                setRecipes((prevRecipes) => [...prevRecipes, ...nextRecipes]);
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
                nextRecipes = nextRecipes.filter(
                    (recipe) =>
                        !recipes.find(
                            (existingRecipe) => existingRecipe.id === recipe.id
                        )
                );
                setRecipes((prevRecipes) => [...prevRecipes, ...nextRecipes]);
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

    const handleCloseModal = () => {
        setSelectedRecipe(undefined);
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
        if (recipesDisplayed) {
            clearDisplayedRecipes();
        }
        setSearchType(newSearchType);
    };

    return (
        <div>
            <Navbar />
            <div className="container">
                <div className="tabs mt-4 d-flex justify-content-between">
                    <h1
                        className={selectedTab === "search" ? "active" : ""}
                        onClick={() => setSelectedTab("search")}
                    >
                        Recipe Search
                    </h1>
                    <h1
                        className={selectedTab === "favourites" ? "active" : ""}
                        onClick={() => setSelectedTab("favourites")}
                    >
                        Favourites
                    </h1>
                </div>
                {selectedTab === "search" && (
                    <>
                        <form
                            onSubmit={(event) => handleSearchSubmit(event)}
                            className="my-3"
                        >
                            <div className="row">
                                <div className="col-sm-8">
                                    {searchType === "name" && (
                                        <input
                                            type="text"
                                            required
                                            placeholder="Enter a recipe name"
                                            value={searchTerm}
                                            onChange={(event) =>
                                                setSearchTerm(
                                                    event.target.value
                                                )
                                            }
                                            className="form-control rounded"
                                        />
                                    )}
                                    {searchType === "ingredients" && (
                                        <input
                                            type="text"
                                            required
                                            placeholder="Enter ingredients"
                                            value={searchIngredient}
                                            onChange={handleIngredientChange}
                                            className="form-control rounded"
                                        />
                                    )}
                                </div>
                                <div className="col-sm-4">
                                    <button
                                        type="submit"
                                        className="btn btn-success btn-block"
                                    >
                                        Submit
                                    </button>
                                </div>
                            </div>
                        </form>

                        <div className="row">
                            <div className="col">
                                <select
                                    value={searchType}
                                    onChange={(event) =>
                                        handleSearchTypeChange(
                                            event.target.value
                                        )
                                    }
                                    className="form-control"
                                >
                                    <option value="name">Search by Name</option>
                                    <option value="ingredients">
                                        Search by Ingredients
                                    </option>
                                </select>
                            </div>
                        </div>

                        {!recipesDisplayed && (
                            <div className="row mt-2">
                                <HomeText />
                            </div>
                        )}

                        {selectedTab === "search" && (
                            <div className="d-flex flex-wrap align-items-stretch justify-content-center mt-4">
                                {recipes.map((recipe, index) => {
                                    const isFavourite = favouriteRecipes.some(
                                        (favRecipe) =>
                                            recipe.id === favRecipe.id
                                    );
                                    const uniqueKey = `${recipe.id}-${index}`;
                                    return (
                                        <div className="row m-0">

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
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        {recipesDisplayed && recipes.length > 0 && (
                            <div className="d-flex justify-content-center">
                                {" "}
                                <button
                                    className="view-more-button btn btn-primary my-4"
                                    onClick={handleViewMoreClick}
                                >
                                    View More
                                </button>
                            </div>
                        )}
                    </>
                )}
                {selectedTab === "favourites" && (
                    <div className="d-flex flex-wrap justify-content-center mt-4">
                        {favouriteRecipes.length > 0 ? (
                            favouriteRecipes.map((recipe) => (
                                <div className="row m-0">
                                    <RecipeCard
                                        key={recipe.id}
                                        recipe={recipe}
                                        onClick={() => setSelectedRecipe(recipe)}
                                        onFavouriteButtonClick={
                                            removeFavouriteRecipe
                                        }
                                        isFavourite={true}
                                        searchType={searchType}
                                        selectedTab={selectedTab}
                                    />
                                </div>
                            ))
                        ) : (
                            <p className="text-muted">No recipes here</p>
                        )}
                    </div>
                )}
                {selectedRecipe && (
                    <RecipeModal
                        recipeId={selectedRecipe.id.toString()}
                        recipe={selectedRecipe}
                        onClose={handleCloseModal}
                    />
                )}
            </div>
        </div>
    );
};

export default Home;
