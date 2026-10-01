import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { redisClient } from "./redisClient.ts";

function passwordIsValid(password: string) {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  );
}

export async function signup(username: string, password: string) {
  if (!username || !password) {
    throw new Error("Username and password are required.");
  }

  if (!passwordIsValid(password)) {
    throw new Error(
      "Password must be at least 8 characters and contain an uppercase letter, lowercase letter, and number.",
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const passwordWasStored = await redisClient.hSetNX(
    username,
    "password",
    hashedPassword,
  );

  if (!passwordWasStored) {
    throw new Error("Username is already taken");
  }

  return true;
}

export async function login(username: string, password: string) {
  if (!username || !password) {
    throw new Error("Invalid username or password");
  }

  const user = await redisClient.hGetAll(username);
  const passwordIsValid = await bcrypt.compare(password, user.password);

  if (passwordIsValid) {
    const payload = { username: username };
    const secret = process.env.JWT_SECRET_KEY ?? "secret";

    return jwt.sign(payload, secret, { expiresIn: "1h" });
  } else {
    throw new Error("Invalid username or password");
  }
}
