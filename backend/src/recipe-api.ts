/// <reference types="node" />

require("dotenv").config();

const apiKey = process.env.API_KEY;

export const searchRecipes = async (searchTerm: string, page: number) => {
    if (!apiKey) {
        throw new Error("API Key not found");
    }

    const recipesPerPage = 10;

    const url = new URL("https://api.spoonacular.com/recipes/complexSearch");
    const queryParams = {
        apiKey,
        query: searchTerm,
        number: recipesPerPage.toString(),
        offset: ((page - 1) * recipesPerPage).toString(),
    };
    url.search = new URLSearchParams(queryParams).toString();

    try {
        const searchResponse = await fetch(url);
        if (!searchResponse.ok) {
            throw new Error(
                `Failed to fetch recipes. Status: ${searchResponse.status}`
            );
        }
        const resultsJson = await searchResponse.json();
        return resultsJson;
    } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch recipes");
    }
};

export const searchRecipesByIngredients = async (
    ingredients: string[],
    page: number
) => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API Key not found");
    }

    const recipesPerPage = 10; // Number of recipes per page

    const url = new URL(
        "https://api.spoonacular.com/recipes/findByIngredients"
    );
    const queryParams = {
        apiKey,
        ingredients: ingredients.join(",+"),
        number: (page * recipesPerPage).toString(), // Increment number parameter for next 10 recipes
    };
    url.search = new URLSearchParams(queryParams).toString();

    try {
        const searchResponse = await fetch(url);
        if (!searchResponse.ok) {
            throw new Error(
                `Failed to fetch recipes. Status: ${searchResponse.status}`
            );
        }
        const resultsJson = await searchResponse.json();
        return resultsJson;
    } catch (error) {
        console.error("Error searching recipes by ingredients:", error);
        throw error;
    }
};

export const getRecipeSummary = async (recipeId: string) => {
    if (!apiKey) {
        throw new Error("API Key not found");
    }

    const url = new URL(
        `https://api.spoonacular.com/recipes/${recipeId}/summary`
    );
    const params = {
        apiKey: apiKey,
    };
    url.search = new URLSearchParams(params).toString();

    const response = await fetch(url);
    const json = await response.json();

    return json;
};

export const getRecipeInstructions = async (recipeId: string) => {
    if (!apiKey) {
        throw new Error("API Key not found");
    }

    const url = new URL(
        `https://api.spoonacular.com/recipes/${recipeId}/analyzedInstructions`
    );
    const params = {
        apiKey: apiKey,
    };
    url.search = new URLSearchParams(params).toString();

    const response = await fetch(url);
    const json = await response.json();

    return json;
};

export const getRecipeIngredients = async (recipeId: string) => {
    if (!apiKey) {
        throw new Error("API Key not found");
    }

    const url = new URL(
        `https://api.spoonacular.com/recipes/${recipeId}/ingredientWidget.json`
    );
    const params = {
        apiKey: apiKey,
    };
    url.search = new URLSearchParams(params).toString();

    const response = await fetch(url);
    const json = await response.json();

    return json;
};

export const getFavouriteRecipesByIDs = async (ids: string[]) => {
    if (!apiKey) {
        throw new Error("API Key not found");
    }

    const url = new URL("https://api.spoonacular.com/recipes/informationBulk");
    const params = {
        apiKey: apiKey,
        ids: ids.join(","),
    };
    url.search = new URLSearchParams(params).toString();

    const searchResponse = await fetch(url);
    const json = await searchResponse.json();

    return { results: json };
};

export const searchPreferredRecipes = async (
    preferences: {
        cuisine?: string;
        excludeCuisine?: string;
        diet?: string;
        intolerances?: string;
    },
    page: number
) => {
    if (!apiKey) {
        throw new Error("API Key not found");
    }

    const recipesPerPage = 10;

    const url = new URL("https://api.spoonacular.com/recipes/complexSearch");
    const queryParams: Record<string, string> = {
        apiKey,
        number: recipesPerPage.toString(),
        offset: ((page - 1) * recipesPerPage).toString(),
    };

    if (preferences.cuisine) {
        queryParams.cuisine = preferences.cuisine;
    }
    if (preferences.excludeCuisine) {
        queryParams.excludeCuisine = preferences.excludeCuisine;
    }
    if (preferences.diet) {
        queryParams.diet = preferences.diet;
    }
    if (preferences.intolerances) {
        queryParams.intolerances = preferences.intolerances;
    }

    url.search = new URLSearchParams(queryParams).toString();
    try {
        const searchResponse = await fetch(url);
        if (!searchResponse.ok) {
            throw new Error(
                `Failed to fetch recipes. Status: ${searchResponse.status}`
            );
        }
        const resultsJson = await searchResponse.json();
        return resultsJson;
    } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch recipes");
    }
};
