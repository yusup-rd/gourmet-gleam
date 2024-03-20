import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { Recipe, Ingredient } from "../types";

interface Props {
    recipe: Recipe;
    isFavourite: boolean;
    onClick: () => void;
    onFavouriteButtonClick: (recipe: Recipe) => void;
    searchType: string; // Add searchType prop
    selectedTab: string; // Add selectedTab prop
}

const RecipeCard = ({ recipe, onClick, onFavouriteButtonClick, isFavourite, searchType, selectedTab }: Props) => {
    return (
        <div className="recipe-card" onClick={onClick}>
            <img src={recipe.image} alt="recipe image" />
            <div className="recipe-card-title">
                <h3>{recipe.title}</h3>
                <span
                    onClick={(event) => {
                        event.stopPropagation();
                        onFavouriteButtonClick(recipe);
                    }}
                >
                    {isFavourite ? <AiFillHeart size={25} color="red" /> : <AiOutlineHeart size={25} />}
                </span>
            </div>
            {(searchType === "ingredients" && selectedTab === "search") && ( // Conditionally render ingredient lists based on searchType and selectedTab
                <>
                    {recipe.missedIngredients && recipe.missedIngredients.length > 0 && (
                        <div className="ingredients-list">
                            <h4>Missed Ingredients:</h4>
                            <ul>
                                {recipe.missedIngredients.map((ingredient: Ingredient, index: number) => (
                                    <li key={`${ingredient.name}-${index}`}>{ingredient.name}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {recipe.unusedIngredients && recipe.unusedIngredients.length > 0 && (
                        <div className="ingredients-list">
                            <h4>Unused Ingredients:</h4>
                            <ul>
                                {recipe.unusedIngredients.map((ingredient: Ingredient, index: number) => (
                                    <li key={`${ingredient.name}-${index}`}>{ingredient.name}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {recipe.usedIngredients && recipe.usedIngredients.length > 0 && (
                        <div className="ingredients-list">
                            <h4>Used Ingredients:</h4>
                            <ul>
                                {recipe.usedIngredients.map((ingredient: Ingredient, index: number) => (
                                    <li key={`${ingredient.name}-${index}`}>{ingredient.name}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default RecipeCard;
