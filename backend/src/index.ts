import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import nodemailer, { TransportOptions } from "nodemailer";
import { authenticator } from "otplib";
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


// Password Reset via Email and OTP
const OTP_EXPIRATION_TIME = 600;

app.post("/password-reset", async (req, res) => {
    const { email } = req.body;

    try {
        // Fetch user's name based on the provided email
        const user = await prismaClient.user.findUnique({
            where: { email: email },
            select: { name: true }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const username = user.name;
        // Generate OTP
        const secret = authenticator.generateSecret();
        const otp = authenticator.generate(secret);

        // Save OTP to database
        const expiration = new Date(Date.now() + OTP_EXPIRATION_TIME * 1000); // Set expiration time
        await prismaClient.passwordResetOTP.create({
            data: {
                user: { connect: { email: email } },
                otp: otp,
                expiresAt: expiration,
            },
        });

        // Send Email
        const transporter = nodemailer.createTransport({
            host: "live.smtp.mailtrap.io",
            port: 587,
            auth: {
                user: "api",
                pass: "c2519fe3f71d5bd4432bf476ffe5e40f",
            },
            secure: false,
            tls: {
                rejectUnauthorized: false,
            },
        });
        const mailOptions = {
            from: "Gourmet Gleam <gourmetgleam@demomailtrap.com>",
            to: email,
            subject: "Password Reset OTP",
            html: `
                <html>
                    <head>
                        <style>
                            /* Add your CSS styles here */
                            body {
                                font-family: Arial, sans-serif;
                            }
                            .container {
                                max-width: 600px;
                                margin: 0 auto;
                                padding: 20px;
                                background-color: #f7f7f7;
                                border-radius: 10px;
                            }
                            .otp {
                                font-size: 20px;
                                font-weight: bold;
                                color: #333;
                            }
                        </style>
                    </head>
                    <body>
                    <div class="container">
                        <h2>Password Reset OTP</h2>
                        <p>Hi ${username}!</p>
                        <p>Here is your OTP for password reset:</p>
                        <p class="otp">${otp}</p>
                    </div>
                    </body>
                </html>
            `,
        };

        await transporter.sendMail(mailOptions);

        return res.json({ message: "OTP sent successfully" });
    } catch (error) {
        console.error("Error generating OTP:", error);
        return res.status(500).json({ error: "Failed to generate OTP" });
    }
});

// OTP verification endpoint
app.post("/password-reset/verify-otp", async (req, res) => {
    const { email, otp } = req.body;

    try {
        // Retrieve stored OTP from the database
        const storedOTP = await prismaClient.passwordResetOTP.findFirst({
            where: {
                user: { email: email },
                otp: otp,
                expiresAt: { gte: new Date() }, // Check if OTP is not expired
            },
        });

        if (!storedOTP) {
            return res
                .status(400)
                .json({ error: "Invalid OTP or OTP expired" });
        }

        // Proceed with OTP verification logic

        return res.json({ message: "OTP verified successfully" });
    } catch (error) {
        console.error("Error verifying OTP:", error);
        return res.status(500).json({ error: "Failed to verify OTP" });
    }
});

// Password reset after verification of OTP
app.post("/password-reset/confirm-password", async (req, res) => {
    const { email, otp, newPassword } = req.body;

    try {
        // Retrieve stored OTP from the database
        const storedOTP = await prismaClient.passwordResetOTP.findFirst({
            where: {
                user: { email: email },
                otp: otp,
                expiresAt: { gte: new Date() }, // Check if OTP is not expired
            },
        });

        if (!storedOTP) {
            return res
                .status(400)
                .json({ error: "Invalid OTP or OTP expired" });
        }

        // Reset Password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await prismaClient.user.update({
            where: { email: email },
            data: { password: hashedNewPassword },
        });

        // Delete the stored OTP from the database
        await prismaClient.passwordResetOTP.delete({
            where: { id: storedOTP.id },
        });

        return res.json({ message: "Password reset successfully" });
    } catch (error) {
        console.error("Error resetting password:", error);
        return res.status(500).json({ error: "Failed to reset password" });
    }
});

// Function to delete expired OTPs from the database
async function deleteExpiredOTP() {
    try {
        // Query expired OTPs
        const expiredOTPs = await prismaClient.passwordResetOTP.findMany({
            where: {
                expiresAt: { lt: new Date() }, // Find OTPs that have expired
            },
        });

        // Delete expired OTPs from the database
        await prismaClient.passwordResetOTP.deleteMany({
            where: {
                id: { in: expiredOTPs.map((otp) => otp.id) },
            },
        });

        console.log(`Deleted ${expiredOTPs.length} expired OTPs.`);
    } catch (error) {
        console.error("Error deleting expired OTPs:", error);
    }
}

// Background task to delete expired OTPs periodically
setInterval(deleteExpiredOTP, 1 * 60 * 1000); // Run every 15 mins

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

// User Profile page functionality
app.get("/profile", verifyUser, async (req, res) => {
    const userId = req.body.userId;

    try {
        const user = await prismaClient.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                preferredCuisine: true,
                excludedCuisine: true,
                diet: true,
                intolerances: true,
            },
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
    const {
        name,
        email,
        preferredCuisine,
        excludedCuisine,
        diet,
        intolerances,
    } = req.body;

    try {
        const updatedUser = await prismaClient.user.update({
            where: { id: userId },
            data: {
                name,
                email,
                preferredCuisine,
                excludedCuisine,
                diet,
                intolerances,
            },
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

app.delete("/profile/delete", verifyUser, async (req, res) => {
    const userId = req.body.userId;
    try {
        await prismaClient.user.delete({
            where: { id: userId },
        });
        res.clearCookie("token");
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to delete user account" });
    }
});

// Recommendation page functionality
app.get("/recommendations", verifyUser, async (req, res) => {
    const userId = req.body.userId;

    try {
        const user: {
            preferredCuisine: string[];
            excludedCuisine: string[];
            diet: string[];
            intolerances: string[];
        } | null = await prismaClient.user.findUnique({
            where: { id: userId },
            select: {
                preferredCuisine: true,
                excludedCuisine: true,
                diet: true,
                intolerances: true,
            },
        });

        if (!user) {
            return res.json({
                message:
                    "Set your preferences first to use the recommendation system.",
            });
        }

        return res.json(user);
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ error: "Failed to fetch user preferences" });
    }
});

app.get("/recommendations/recipes", async (req: Request, res: Response) => {
    const { preferredCuisine, excludedCuisine, diet, intolerances } = req.query;
    const page = parseInt(req.query.page as string);

    const preferences = {
        cuisine: preferredCuisine as string | undefined,
        excludeCuisine: excludedCuisine as string | undefined,
        diet: diet as string | undefined,
        intolerances: intolerances as string | undefined,
    };
    try {
        const results = await RecipeAPI.searchPreferredRecipes(
            preferences,
            page
        );
        res.json(results);
    } catch (error) {
        console.error("Error fetching recipes:", error);
        res.status(500).json({ message: "Failed to fetch recipes" });
    }
});

app.get("/recommendations/favourites", verifyUser, async (req, res) => {
    const userId = req.body.userId;

    try {
        const user = await prismaClient.user.findUnique({
            where: { id: userId },
            include: {
                favouriteRecipes: true,
            },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.json(user.favouriteRecipes);
    } catch (error) {
        console.error("Error fetching favourite recipes:", error);
        return res
            .status(500)
            .json({ error: "Failed to fetch favourite recipes" });
    }
});

// Run backend port
app.listen(5000, () => {
    console.log("Running...");
});
