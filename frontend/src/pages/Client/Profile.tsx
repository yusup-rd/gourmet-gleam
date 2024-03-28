import Navbar from "../../components/Navbar";

const Profile = () => {
    return (
        <div>
            <Navbar />
            <h1>Profile Page</h1>
            <h3>Welcome, User</h3>

            <div>
                <p>Preference Settings</p>
                <p>Preferred cuisine: ---</p>
                <p>Exclude cuisine: ---</p>
                {/* 
                List of cuisines:
                    African, Asian, American, British, Cajun, Caribbean, Chinese, Eastern European, European, French, German, Greek, Indian, Irish, Italian, Japanese, Jewish, Korean, Latin American, Mediterranean, Mexican, Middle Eastern, Nordic, Southern, Spanish, Thai, Vietnamese

                Usage:
                    One or more, comma separated (will be interpreted as 'AND')
                */}
                <p>Diet: ---</p>
                {/* 
                    List of Diets and explanation:

                        Gluten Free
                        Eliminating gluten means avoiding wheat, barley, rye, and other gluten-containing grains and foods made from them (or that may have been cross contaminated).

                        Ketogenic
                        The keto diet is based more on the ratio of fat, protein, and carbs in the diet rather than specific ingredients. Generally speaking, high fat, protein-rich foods are acceptable and high carbohydrate foods are not. The formula we use is 55-80% fat content, 15-35% protein content, and under 10% of carbohydrates.

                        Vegetarian
                        No ingredients may contain meat or meat by-products, such as bones or gelatin.

                        Lacto-Vegetarian
                        All ingredients must be vegetarian and none of the ingredients can be or contain egg.

                        Ovo-Vegetarian
                        All ingredients must be vegetarian and none of the ingredients can be or contain dairy.

                        Vegan
                        No ingredients may contain meat or meat by-products, such as bones or gelatin, nor may they contain eggs, dairy, or honey.

                        Pescetarian
                        Everything is allowed except meat and meat by-products - some pescetarians eat eggs and dairy, some do not.

                        Paleo
                        Allowed ingredients include meat (especially grass fed), fish, eggs, vegetables, some oils (e.g. coconut and olive oil), and in smaller quantities, fruit, nuts, and sweet potatoes. We also allow honey and maple syrup (popular in Paleo desserts, but strict Paleo followers may disagree). Ingredients not allowed include legumes (e.g. beans and lentils), grains, dairy, refined sugar, and processed foods.

                        Primal
                        Very similar to Paleo, except dairy is allowed - think raw and full fat milk, butter, ghee, etc.

                        Low FODMAP
                        FODMAP stands for "fermentable oligo-, di-, mono-saccharides and polyols". Our ontology knows which foods are considered high in these types of carbohydrates (e.g. legumes, wheat, and dairy products)

                        Whole30
                        Allowed ingredients include meat, fish/seafood, eggs, vegetables, fresh fruit, coconut oil, olive oil, small amounts of dried fruit and nuts/seeds. Ingredients not allowed include added sweeteners (natural and artificial, except small amounts of fruit juice), dairy (except clarified butter or ghee), alcohol, grains, legumes (except green beans, sugar snap peas, and snow peas), and food additives, such as carrageenan, MSG, and sulfites.

                    Usage:

                        You can specify multiple with comma meaning AND connection. You can specify multiple diets separated with a pipe | meaning OR connection. For example diet=gluten free,vegetarian means the recipes must be both, gluten free and vegetarian. If you specify diet=vegan|vegetarian, it means you want recipes that are vegan OR vegetarian.
                */}

                <p>Intolerances: ---</p>
                {/* 
                    List of intolerances:

                        Dairy, Egg, Gluten, Grain, Peanut, Seafood, Sesame, Shellfish, Soy, Sulfite, Tree Nut, Wheat

                    Usage:
                        A comma-separated list of intolerances. All recipes returned must not contain ingredients that are not suitable for people with the intolerances entered.
                */}

                <br />
                <p>Account Settings</p>
                <p>Change Email ---</p>
                <p>Change Password ---</p>
                <br />
                <p>Account Deletion</p>
                <button>Delete account</button>
            </div>
        </div>
    );
};

export default Profile;
