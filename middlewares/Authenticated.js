import jwt from "jsonwebtoken";

const Authenticated = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const cookieToken = req.cookies?.token;

        const token = authHeader?.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : cookieToken;

        if (!token) {
            return res.status(401).end();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).end();
        }

        req.id = decoded.id;
        next();
    } catch {
        return res.status(401).end();
    }
};

export default Authenticated;
