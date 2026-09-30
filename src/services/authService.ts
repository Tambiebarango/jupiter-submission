import bcrypt from "bcrypt";
import { redisClient } from "./redisClient.ts";

export async function signup(username: string, password: string) {
  if (!username || !password) {
    throw new Error("Username and password are required.");
  }

  const userExists = await redisClient.exists(username);

  if (userExists) {
    throw new Error("Username is already taken");
  }

  const passwordIsValid =
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password);

  if (!passwordIsValid) {
    throw new Error(
      "Password must be at least 8 characters and contain an uppercase letter, lowercase letter, and number.",
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await redisClient.hSet(username, "password", hashedPassword, { NX: true });

  return true;
}

export async function login(username: string, password: string) {
  if (!username || !password) {
    throw new Error("Invalid username or password");
  }

  const user = await redisClient.hGetAll(username);
  const passwordIsValid = await bcrypt.compare(password, user.password);

  if (passwordIsValid) {
    return true;
  } else {
    throw new Error("Invalid username or password");
  }
}
