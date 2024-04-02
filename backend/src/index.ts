import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import { PrismaClient } from "@prisma/client";
import * as RecipeAPI from "./recipe-api";

const app = express();
const prismaClient = new PrismaClient();
const jwtSecret = "jwt-secret-key";

app.use(express.json());
app.use(
    cors({
        origin: ["http://localhost:5173"],
        methods: ["POST", "GET", "DELETE", "PUT"],
        credentials: true,
    })
);
app.use(cookieParser());

const verifyUser = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token;
    if (!token) {
        return res.json({ Error: "You are not authorized" });
    } else {
        jwt.verify(token, jwtSecret, (err: any, decoded: any) => {
            if (err) {
                res.clearCookie("token");
                return res.json({ Error: "Token has an issue or expired" });
            } else {
                req.body.email = decoded.email;
                req.body.role = decoded.role;
                req.body.userId = decoded.userId;
                next();
            }
        });
    }
};

app.get("/", verifyUser, (req, res) => {
    return res.json({
        Status: "Success",
        userId: req.body.userId,
        email: req.body.email,
        role: req.body.role,
    });
});

// Authorization
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prismaClient.user.findUnique({
            where: { email: email },
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: "Invalid password" });
        }
        const tokenPayload = {
            email: user.email,
            role: user.role,
            userId: user.id,
        };
        const token = jwt.sign(tokenPayload, jwtSecret, {
            expiresIn: "1d",
        });
        res.cookie("token", token);
        return res.json({ message: "Login successful", role: user.role });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await prismaClient.user.create({
            data: {
                name: name,
                email: email,
                password: hashedPassword,
            },
        });
        return res.json({ message: "User registered successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/logout", (req, res) => {
    res.clearCookie("token");
    return res.json({ message: "Logout successful" });
});

app.get("/user-role", verifyUser, (req, res) => {
    const userRole = req.body.role;
    res.json({ role: userRole });
});

app.get("/user-id", verifyUser, (req, res) => {
    const userId = req.body.id;
    res.json({ userId: userId });
});

// Home page functionality
app.get("/api/recipes/search", async (req, res) => {
    const searchTerm = req.query.searchTerm as string;
    const page = parseInt(req.query.page as string);
    const results = await RecipeAPI.searchRecipes(searchTerm, page);

    return res.json(results);
});
app.get("/api/recipes/findByIngredients", async (req, res) => {
    const ingredients = Array.isArray(req.query.ingredients)
        ? (req.query.ingredients as string[])
        : [req.query.ingredients as string];
    const page = parseInt(req.query.page as string);

    try {
        const results = await RecipeAPI.searchRecipesByIngredients(
            ingredients,
            page
        );
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch recipes" });
    }
});

app.get("/api/recipes/:recipeId/summary", async (req, res) => {
    const recipeId = req.params.recipeId;
    const results = await RecipeAPI.getRecipeSummary(recipeId);

    return res.json(results);
});

app.post("/api/recipes/favourite", verifyUser, async (req, res) => {
    const recipeId = req.body.recipeId;
    const userId = req.body.userId;

    try {
        const favouriteRecipe = await prismaClient.favouriteRecipes.create({
            data: {
                recipeId: recipeId,
                userId: userId,
            },
        });
        return res.status(201).json(favouriteRecipe);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Something went wrong" });
    }
});

app.get("/api/recipes/favourite", verifyUser, async (req, res) => {
    const userId = req.body.userId;

    try {
        const recipes = await prismaClient.favouriteRecipes.findMany({
            where: {
                userId: userId,
            },
        });
        const recipeIds = recipes.map((recipe) => recipe.recipeId.toString());

        const favourites = await RecipeAPI.getFavouriteRecipesByIDs(recipeIds);

        return res.json(favourites);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Something went wrong" });
    }
});

app.delete("/api/recipes/favourite", verifyUser, async (req, res) => {
    const recipeId = req.body.recipeId;
    const userId = req.body.userId;
    try {
        await prismaClient.favouriteRecipes.deleteMany({
            where: {
                recipeId: recipeId,
                userId: userId,
            },
        });
        return res.status(204).send();
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Something went wrong" });
    }
});

app.get("/api/recipes/:recipeId/instructions", async (req, res) => {
    const recipeId = req.params.recipeId;
    try {
        const instructions = await RecipeAPI.getRecipeInstructions(recipeId);
        res.json(instructions);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/api/recipes/:recipeId/ingredients", async (req, res) => {
    const recipeId = req.params.recipeId;
    try {
        const ingredients = await RecipeAPI.getRecipeIngredients(recipeId);
        res.json(ingredients);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Admin page functionality
app.get("/admin/users", verifyUser, async (req, res) => {
    const search = req.query.search as string;
    try {
        let users: any;
        if (search) {
            const searchTerm = `%${search}%`;
            users = await prismaClient.user.findMany({
                where: {
                    role: "client",
                    OR: [
                        { name: { contains: searchTerm, mode: "insensitive" } },
                        {
                            email: {
                                contains: searchTerm,
                                mode: "insensitive",
                            },
                        },
                    ],
                },
            });
        } else {
            users = await prismaClient.user.findMany({
                where: {
                    role: "client",
                },
            });
        }
        return res.json(users);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Something went wrong" });
    }
});

app.put("/admin/users/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const { name, email } = req.body;

    try {
        const updatedUser = await prismaClient.user.update({
            where: { id: userId },
            data: { name, email },
        });

        return res.json(updatedUser);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to update user data" });
    }
});

app.delete("/admin/users/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    try {
        await prismaClient.user.delete({
            where: { id: userId },
        });

        return res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to delete user" });
    }
});

// User Profile Page Functionality
app.get("/profile", verifyUser, async (req, res) => {
    const userId = req.body.userId;

    try {
        const user = await prismaClient.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.json(user);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to fetch user data" });
    }
});

app.put("/profile", async (req, res) => {
    const userId = req.body.userId;
    const { name, email } = req.body;

    try {
        const updatedUser = await prismaClient.user.update({
            where: { id: userId },
            data: { name, email },
        });

        return res.json(updatedUser);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to update user data" });
    }
});

app.post("/profile/change-password", verifyUser, async (req, res) => {
    const userId = req.body.userId;
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await prismaClient.user.findUnique({
            where: { id: userId },
            select: { id: true, password: true },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const isValidPassword = await bcrypt.compare(
            currentPassword,
            user.password
        );
        if (!isValidPassword) {
            return res.status(401).json({ error: "Invalid current password" });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        await prismaClient.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword },
        });

        return res.json({ message: "Password updated successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to update password" });
    }
});

app.listen(5000, () => {
    console.log("Running...");
});
