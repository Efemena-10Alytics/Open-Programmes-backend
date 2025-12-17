import { Response } from "express";

export const validatePassword = (password: string, res: Response) => {

    let isValid = false;

  const uppercaseRegex = /[A-Z]/;
  const lowercaseRegex = /[a-z]/;
  const specialCharRegex = /[!@#$%^&*(),_.?":{}|<>]/;

  const hasUppercase = uppercaseRegex.test(password);
  const hasLowercase = lowercaseRegex.test(password);
  const hasSpecialChar = specialCharRegex.test(password);

  if (!hasUppercase) {
      res.status(400).json({ message: "Password must contain uppercase" });
    return; 
  }

  if (!hasLowercase) {
    res.status(400).json({ message: "Password must contain lowercase" });
    return;
  }

  if (!hasSpecialChar) {
      res
      .status(400)
      .json({ message: "Password must contain special character" });
      return; 
  }

  if (password.length < 7) {
      res
      .status(400)
      .json({ message: "Password should be at least 8 characters" });
      return; 
  }

  if(hasLowercase || hasUppercase || hasSpecialChar || password.length < 7) {
    isValid = true;
  } else {
    isValid = false;
  }

  return isValid;
};
