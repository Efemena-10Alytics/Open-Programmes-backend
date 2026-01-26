import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface User {
    id: string;
    email: string;
    role: string;
}


export const isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        console.log("🔍 [isLoggedIn] Checking authentication...");
        console.log("🔍 [isLoggedIn] Authorization header:", authHeader ? "Present" : "Missing");

        if (!authHeader) {
            console.log("❌ [isLoggedIn] No authorization header found");
            return res.status(403).json({ message: "Invalid authentication!" }).end();
        }

        const auth_token = authHeader.split(" ")[1];

        if (!auth_token) {
            console.log("❌ [isLoggedIn] No token found in authorization header");
            return res.status(403).json({ message: "Invalid authentication!" }).end();
        }

        console.log("🔍 [isLoggedIn] Token found, verifying...");

        //@ts-ignore
        jwt.verify(auth_token, process.env.JWT_SECRET as string, (err, user: User) => {
            if (err) {
                console.log("❌ [isLoggedIn] Token verification failed:", err.message);
                return res.status(401).json({ message: "Invalid Token" }).end();
            }

            req.user = user;
            console.log("✅ [isLoggedIn] Authentication successful for user:", user.email, "Role:", user.role);
            next();
        });
    } catch (error) {
        console.error("❌ [isLoggedIn] Error:", error);
        res.status(500).end();
    }
};

export const isAuthorized = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        isLoggedIn(req, res, () => {
            const user = req.user as User;
            const requestedUserId = req.params.userId || req.body.userId;

            if (user?.id === requestedUserId || user?.role === "ADMIN") {
                next();
            } else {
                return res
                    .status(403)
                    .json({ message: "You cannot do that!" })
                    .end();
            }
        });
    } catch (error) {
        console.error("[ISAUTHORIZED]:", error);
        res.status(500).end();
    }
};

export const isCourseAdmin = (req: Request, res: Response, next: NextFunction) => {
    try {
        isLoggedIn(req, res, () => {
            const user = req.user as User;
            console.log("🔍 [isCourseAdmin] Checking course admin access for user:", user?.email, "Role:", user?.role);
            if (user?.role === "COURSE_ADMIN" || user?.role === "ADMIN") {
                console.log("✅ [isCourseAdmin] Access granted");
                next();
            } else {
                console.log("❌ [isCourseAdmin] Access denied - user role:", user?.role);
                return res
                    .status(403)
                    .json({ message: "Not authorized, Admin access only!" })
                    .end();
            }
        });
    } catch (error) {
        console.error("❌ [isCourseAdmin] Error:", error);
        res.status(500).end();
    }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    try {
        isLoggedIn(req, res, () => {
            const user = req.user as User;
            if (user?.role === "ADMIN") {
                next();
            } else {
                return res
                    .status(403)
                    .json({ message: "Not authorized, Admin access only!" })
                    .end();
            }
        });
    } catch (error) {
        console.error("[ISADMIN]:", error);
        res.status(500).end();
    }
};
