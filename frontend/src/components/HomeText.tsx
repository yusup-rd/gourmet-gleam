import Taco from "../assets/bg/taco.svg";
import Steak from "../assets/bg/steak.svg";
import Pizza from "../assets/bg/pizza.svg";
import "./HomeText.css";

const HomeText = () => {
    return (
        <div className="my-5 p-5">
            <div className="row d-flex justify-content-between align-items-center">
                <div className="col-md-6">
                    <div className="home-title">Welcome to Gourmet Gleam</div>
                    <div className="home-description">
                        Your go-to destination for a delightful culinary
                        experience! <br />
                        <br />
                        At Gourmet Gleam, we're passionate about making cooking
                        a joyous and stress-free activity. <br />
                        <br />
                        Whether you're a seasoned chef or a kitchen novice, our
                        platform is designed to inspire and simplify your
                        cooking journey.
                    </div>
                </div>
                <div className="col-md-6 d-flex align-items-center justify-content-end">
                    <img src={Taco} alt="Taco" className="home-image" />
                </div>
            </div>

            <div className="row mt-5">
                <div className="col-md-6 order-md-2 text-right">
                    <div className="home-title">What Sets Us Apart</div>
                    <div className="home-subtitle">Recipe Recommendations</div>
                    <div className="home-description">
                        We analyze your preferences and trending recipes to
                        suggest personalized recommendations tailored just for
                        you.
                    </div>
                    <div className="home-subtitle">
                        Effortless Ingredient Management
                    </div>
                    <div className="home-description">
                        Gourmet Gleam helps you make the most out of the
                        ingredients you have. Our intuitive system allows you to
                        input your pantry items, and we'll provide you with
                        creative recipe ideas.
                    </div>
                    <div className="home-subtitle">
                        Comprehensive Recipe Database
                    </div>
                    <div className="home-description">
                        Explore a vast collection of recipes ranging from quick
                        and easy meals to gourmet delights. Each recipe comes
                        with detailed instruction and ingredients.
                    </div>
                </div>
                <div className="col-md-6 order-md-1 d-flex align-items-center justify-content-center mt-md-0 mt-5">
                    <img src={Steak} alt="Steak" className="home-image" />
                </div>
            </div>

            <div className="row mt-5">
                <div className="col-md-6">
                    <div className="home-title">
                        Your Culinary Adventure Begins Here
                    </div>
                    <div className="home-description">
                        Discover the joy of cooking with Gourmet Gleam. Join our
                        community of food enthusiasts, embark on a culinary
                        adventure, and elevate your home cooking to new heights.
                        Ready to dive in? Explore our featured recipes, try out
                        our AI-driven suggestions, and make every meal a
                        memorable experience with Gourmet Gleam!
                    </div>
                </div>
                <div className="col-md-6 d-flex align-items-center justify-content-end mt-md-0 mt-5">
                    <img src={Pizza} alt="Pizza" className="home-image" />
                </div>
            </div>
        </div>
    );
};

export default HomeText;
