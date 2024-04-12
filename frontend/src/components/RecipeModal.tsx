import { useEffect, useState } from "react";
import {
    RecipeStep,
    RecipeSummary,
    RecipeWithSteps,
    Ingredient,
} from "../types";
import * as RecipeAPI from "../api";
import { Recipe } from "../types";

interface Props {
    recipeId: string;
    recipe: Recipe;
    onClose: () => void;
}

const RecipeModal = ({ recipeId, recipe, onClose }: Props) => {
    const [recipeSummary, setRecipeSummary] = useState<RecipeSummary | null>(
        null
    );
    const [recipeWithSteps, setRecipeWithSteps] =
        useState<RecipeWithSteps | null>(null);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [showSummary, setShowSummary] = useState<boolean>(true);
    const [showIngredients, setShowIngredients] = useState<boolean>(false);

    useEffect(() => {
        const fetchRecipeData = async () => {
            try {
                const summaryRecipe = await RecipeAPI.getRecipeSummary(
                    recipeId
                );
                setRecipeSummary(summaryRecipe);

                const instructions = await RecipeAPI.getRecipeInstructions(
                    recipeId
                );
                if (instructions.length > 0) {
                    const recipeSteps: RecipeStep[] = instructions[0].steps.map(
                        (step: any) => ({
                            equipment: step.equipment,
                            ingredients: step.ingredients,
                            length: step.length,
                            number: step.number,
                            step: step.step,
                        })
                    );
                    setRecipeWithSteps({
                        name: summaryRecipe.title,
                        steps: recipeSteps,
                    });
                }

                const ingredientsResponse =
                    await RecipeAPI.getRecipeIngredients(recipeId);
                setIngredients(ingredientsResponse.ingredients);
            } catch (error) {
                console.error("Error fetching recipe data:", error);
            }
        };

        fetchRecipeData();
    }, [recipeId]);

    if (!recipeSummary || !recipeWithSteps) {
        return null;
    }

    return (
        <div className="recipe-modal-overlay">
            <div className="recipe-modal">
                <div className="recipe-modal-content">
                    <div className="recipe-modal-header">
                        <h2>{recipeSummary.title}</h2>
                        <span className="close-btn" onClick={onClose}>
                            &times;
                        </span>
                    </div>
                    <div className="recipe-modal-body">
                        <img src={recipe.image} alt="Recipe" />
                        <div className="button-group">
                            <button
                                onClick={() => {
                                    setShowSummary(true);
                                    setShowIngredients(false);
                                }}
                            >
                                Summary
                            </button>
                            <button
                                onClick={() => {
                                    setShowSummary(false);
                                    setShowIngredients(false);
                                }}
                            >
                                Instructions
                            </button>
                            <button
                                onClick={() => {
                                    setShowSummary(false);
                                    setShowIngredients(true);
                                }}
                            >
                                Ingredients
                            </button>
                        </div>
                        {showSummary ? (
                            <>
                                <h3>Summary:</h3>
                                <p
                                    dangerouslySetInnerHTML={{
                                        __html: recipeSummary.summary,
                                    }}
                                ></p>
                            </>
                        ) : showIngredients ? (
                            <>
                                <h3>Ingredients:</h3>
                                <ul>
                                    {ingredients.map((ingredient, index) => (
                                        <li key={index}>
                                            {ingredient.amount.metric.value}{" "}
                                            {ingredient.amount.metric.unit} -{" "}
                                            {ingredient.name}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        ) : (
                            <>
                                <h3>Instructions:</h3>
                                <ol>
                                    {recipeWithSteps.steps.map(
                                        (step, index) => (
                                            <li key={index}>
                                                <p
                                                    dangerouslySetInnerHTML={{
                                                        __html: step.step,
                                                    }}
                                                ></p>
                                            </li>
                                        )
                                    )}
                                </ol>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecipeModal;
