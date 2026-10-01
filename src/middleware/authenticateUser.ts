import jwt from "jsonwebtoken";
import { type NextFunction, type Request, type Response } from "express";
import { redisClient } from "../services/redisClient.ts";
import { AuthenticationError } from "../services/util/authenticationError.ts";

export async function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.header("Authorization");
  if (!token) throw new AuthenticationError("Access denied");

  try {
    const secret = process.env.JWT_SECRET_KEY ?? "secret";
    const decoded = jwt.verify(token, secret);

    if (typeof decoded === "string" || typeof decoded.username !== "string") {
      throw new AuthenticationError("Invalid token");
    }

    const validUser = await redisClient.exists(decoded.username);

    if (validUser) {
      next();
    } else {
      throw new AuthenticationError("Invalid token");
    }
  } catch (error) {
    if (error instanceof AuthenticationError) {
      res.status(401).json({ error: "Invalid token" });
    } else {
      res
        .status(500)
        .json({ error: `Something went wrong - ${(error as Error).message}` });
    }
  }
}
