import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { Recipe, Ingredient } from "../types";
import './RecipeCard.css';

interface Props {
    recipe: Recipe;
    isFavourite: boolean;
    onClick: () => void;
    onFavouriteButtonClick: (recipe: Recipe) => void;
    searchType: string;
    selectedTab: string;
}

const RecipeCard = ({ recipe, onClick, onFavouriteButtonClick, isFavourite, searchType, selectedTab }: Props) => {
    return (
        <div className="card recipe-card m-2" onClick={onClick}>
            <img src={recipe.image} className="card-img-top recipe-image" alt="recipe image" />
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                    <h5 className="card-title mr-3">{recipe.title}</h5>
                    <span
                        onClick={(event) => {
                            event.stopPropagation();
                            onFavouriteButtonClick(recipe);
                        }}
                        className="ml-3"
                    >
                        {isFavourite ? <AiFillHeart size={25} color="red" /> : <AiOutlineHeart size={25} />}
                    </span>
                </div>
                {(searchType === "ingredients" && selectedTab === "search") && (
                    <>
                        {recipe.missedIngredients && recipe.missedIngredients.length > 0 && (
                            <div className="ingredients-list mt-2">
                                <p className="text-danger">Missed Ingredients:</p>
                                <ul className="list-unstyled">
                                    {recipe.missedIngredients.map((ingredient: Ingredient, index: number) => (
                                        <li key={`${ingredient.name}-${index}`}>{ingredient.name}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {recipe.unusedIngredients && recipe.unusedIngredients.length > 0 && (
                            <div className="ingredients-list mt-2">
                                <p className="text-warning">Unused Ingredients:</p>
                                <ul className="list-unstyled">
                                    {recipe.unusedIngredients.map((ingredient: Ingredient, index: number) => (
                                        <li key={`${ingredient.name}-${index}`}>{ingredient.name}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {recipe.usedIngredients && recipe.usedIngredients.length > 0 && (
                            <div className="ingredients-list mt-2">
                                <p className="text-success">Used Ingredients:</p>
                                <ul className="list-unstyled">
                                    {recipe.usedIngredients.map((ingredient: Ingredient, index: number) => (
                                        <li key={`${ingredient.name}-${index}`}>{ingredient.name}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default RecipeCard;