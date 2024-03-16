import { Recipe } from "./types";

export const searchRecipes = async (searchTerm: string, page: number) => {
    const baseUrl = new URL("http://localhost:5000/api/recipes/search");
    baseUrl.searchParams.append("searchTerm", searchTerm);
    baseUrl.searchParams.append("page", String(page));

    const response = await fetch(baseUrl);
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return response.json();
};

export const getRecipeSummary = async (recipeId: string) => {
    const url = new URL(
        `http://localhost:5000/api/recipes/${recipeId}/summary`
    );
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return response.json();
};

export const getRecipeInstructions = async (recipeId: string) => {
    const url = new URL(
        `http://localhost:5000/api/recipes/${recipeId}/instructions`
    );
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return response.json();
};

export const getRecipeIngredients = async (recipeId: string) => {
    const url = new URL(
        `http://localhost:5000/api/recipes/${recipeId}/ingredients`
    );
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return response.json();
};

export const getFavouriteRecipes = async () => {
    const url = new URL("http://localhost:5000/api/recipes/favourite");
    const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return response.json();
};

export const addFavouriteRecipe = async (recipe: Recipe, userId: number) => {
    const url = new URL("http://localhost:5000/api/recipes/favourite");
    const body = {
        recipeId: recipe.id,
        userId: userId,
    };

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
};

export const removeFavouriteRecipe = async (recipe: Recipe, userId: number) => {
    const url = new URL("http://localhost:5000/api/recipes/favourite");
    const body = {
        recipeId: recipe.id,
        userId: userId,
    };

    const response = await fetch(url, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
};
