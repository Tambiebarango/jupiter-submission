import express, { type Express, type Request, type Response } from "express";
import { login, signup } from "./services/authService.ts";
import "dotenv/config";
import { AuthenticationError } from "./services/util/authenticationError.ts";
import { authenticateUser } from "./middleware/authenticateUser.ts";

const app: Express = express();

app.use(express.json());

app.post("/signup", async (req: Request, res: Response) => {
  const { username, password } = req.body ?? {};

  try {
    await signup(username, password);
    res.status(200).json({ message: "Signup successful!" });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

app.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body ?? {};

  try {
    const accessToken = await login(username, password);
    return res
      .status(200)
      .json({ message: "Logged in!", accessToken: accessToken });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return res.status(401).json({ message: (error as Error).message });
    } else {
      return res.status(500).json({ message: "Something went wrong" });
    }
  }
});

app.get("/foo", authenticateUser, async (req: Request, res: Response) => {
  return res.status(200).json({ message: "bar!" });
});

app.listen(3000);
