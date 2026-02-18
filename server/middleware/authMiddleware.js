import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];
            console.log("Token found:", token); // DEBUG
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
            console.log("Decoded:", decoded); // DEBUG
            req.user = await User.findById(decoded.id).select("-password");
            console.log("User found:", req.user ? req.user._id : "No user"); // DEBUG

            if (!req.user) {
                return res.status(401).json({ error: "Not authorized, user not found" });
            }

            return next();
        } catch (error) {
            console.error("Token verification failed:", error);
            return res.status(401).json({ error: "Not authorized, token failed" });
        }
    }

    if (!token) {
        console.log("No token provided in headers"); // DEBUG
        return res.status(401).json({ error: "Not authorized, no token" });
    }
};

export const optionalProtect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];

            // Skip if token is explicitly "null" or "undefined" string
            if (token && token !== "null" && token !== "undefined") {
                try {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
                    req.user = await User.findById(decoded.id).select("-password");
                } catch (jwtError) {
                    console.error("⚠️ Optional Auth Token Invalid:", jwtError.message);
                    // Proceed as guest - do not block
                }
            }
        }
    } catch (error) {
        console.error("⚠️ Optional Auth Middleware Error:", error.message);
        // Proceed as guest - do not block
    } finally {
        next();
    }
};
