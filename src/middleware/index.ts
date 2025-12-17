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

    if (!authHeader) {
      return res.status(403).json({ message: "Invalid authentication!" }).end();
    }

    const auth_token = authHeader.split(" ")[1];
    //@ts-ignore
    jwt.verify(auth_token, process.env.JWT_SECRET as string, (err, user: User) => {
      if (err) {
        return res.status(401).json({ message: "Invalid Token" }).end();
      }

      req.user = user;
      // console.log("[USER_MIDDLEWARE]:", req.user);
      next();
    });
  } catch (error) {
    console.error("[isLoggedIn]:", error);
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
      if (user?.role === "COURSE_ADMIN" || user?.role === "ADMIN") {
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
