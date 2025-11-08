import jwt from "jsonwebtoken";

const Authenticated = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const cookieToken = req.cookies?.token;
        // Check if the token is present in the Authorization header or cookies
        const token = authHeader?.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : cookieToken; // Extract token from Authorization header
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token using the secret key
        if (!decoded) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        req.id = decoded.id;; // Attach user information to the request object
        next(); // Call the next middleware or route handler
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized" });
    }
}

export default Authenticated;
// This middleware checks if the user is authenticated by verifying the JWT token.
// If the token is valid, it attaches the decoded user information to the request object and calls the next middleware or route handler.