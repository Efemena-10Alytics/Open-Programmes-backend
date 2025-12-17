import express from "express";
import {
  login,
  register,
  resendEmailVerification,
  verifyEmail,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
  account,
  googleAuth,
} from "../controllers/authentication";

export default (router: express.Router) => {
  router.post("/auth/signin", login);
  router.post("/auth/register", register);
  router.post("/auth/google", googleAuth);
  router.post("/auth/verify-otp", verifyEmail);
  router.post("/auth/resend-otp", resendEmailVerification);
  router.post("/auth/forgot-password", forgotPassword);
  router.post("/auth/reset-password", resetPassword);
  router.post("/auth/refresh-access-token", refreshAccessToken);
  router.post("/auth/accounts", account);
};
