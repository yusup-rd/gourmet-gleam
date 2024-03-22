export interface Recipe {
    id: number;
    title: string;
    image: string;
    imageType: string;
    missedIngredients?: Ingredient[];
    unusedIngredients?: Ingredient[];
    usedIngredients?: Ingredient[];
}

export interface RecipeSummary {
    id: number;
    title: string;
    summary: string;
}

export interface Ingredient {
    amount: {
        metric: {
            unit: string;
            value: number;
        };
        us: {
            unit: string;
            value: number;
        };
    };
    image: string;
    name: string;
}

export interface RecipeStep {
    equipment: Equipment[];
    ingredients: Ingredient[];
    length?: Length;
    number: number;
    step: string;
}

export interface RecipeWithSteps {
    name: string;
    steps: RecipeStep[];
}

export interface Equipment {
    id: number;
    image: string;
    name: string;
    temperature?: {
        number: number;
        unit: string;
    };
}

export interface Length {
    number: number;
    unit: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
}