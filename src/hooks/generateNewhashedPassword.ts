import bcrypt from "bcryptjs";

export function generateRandomChar(length: number) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return { result };
}

export async function generateNewhashedPassword() {
  const { result } = generateRandomChar(8);

  const hashedPassword = await bcrypt.hash(result, 10);

  return hashedPassword;
}
