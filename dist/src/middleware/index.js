"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = exports.isCourseAdmin = exports.isAuthorized = exports.isLoggedIn = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const isLoggedIn = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(403).json({ message: "Invalid authentication!" }).end();
        }
        const auth_token = authHeader.split(" ")[1];
        //@ts-ignore
        jsonwebtoken_1.default.verify(auth_token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(401).json({ message: "Invalid Token" }).end();
            }
            req.user = user;
            // console.log("[USER_MIDDLEWARE]:", req.user);
            next();
        });
    }
    catch (error) {
        console.error("[isLoggedIn]:", error);
        res.status(500).end();
    }
};
exports.isLoggedIn = isLoggedIn;
const isAuthorized = (req, res, next) => {
    try {
        (0, exports.isLoggedIn)(req, res, () => {
            const user = req.user;
            const requestedUserId = req.params.userId || req.body.userId;
            if (user?.id === requestedUserId || user?.role === "ADMIN") {
                next();
            }
            else {
                return res
                    .status(403)
                    .json({ message: "You cannot do that!" })
                    .end();
            }
        });
    }
    catch (error) {
        console.error("[ISAUTHORIZED]:", error);
        res.status(500).end();
    }
};
exports.isAuthorized = isAuthorized;
const isCourseAdmin = (req, res, next) => {
    try {
        (0, exports.isLoggedIn)(req, res, () => {
            const user = req.user;
            if (user?.role === "COURSE_ADMIN" || user?.role === "ADMIN") {
                next();
            }
            else {
                return res
                    .status(403)
                    .json({ message: "Not authorized, Admin access only!" })
                    .end();
            }
        });
    }
    catch (error) {
        console.error("[ISADMIN]:", error);
        res.status(500).end();
    }
};
exports.isCourseAdmin = isCourseAdmin;
const isAdmin = (req, res, next) => {
    try {
        (0, exports.isLoggedIn)(req, res, () => {
            const user = req.user;
            if (user?.role === "ADMIN") {
                next();
            }
            else {
                return res
                    .status(403)
                    .json({ message: "Not authorized, Admin access only!" })
                    .end();
            }
        });
    }
    catch (error) {
        console.error("[ISADMIN]:", error);
        res.status(500).end();
    }
};
exports.isAdmin = isAdmin;
//# sourceMappingURL=index.js.map