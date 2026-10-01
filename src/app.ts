import express, { type Express, type Request, type Response } from "express";
import { login, signup } from "./services/authService.ts";
import "dotenv/config";
import { AuthenticationError } from "./services/util/authenticationError.ts";

const app: Express = express();

app.use(express.json());

app.post("/signup", async (req: Request, res: Response) => {
  const { username, password } = req.body ?? {};

  try {
    await signup(username, password);
    res.status(200).send({ message: "Signup successful!" });
  } catch (error) {
    res.status(400).send({ message: (error as Error).message });
  }
});

app.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body ?? {};

  try {
    const accessToken = await login(username, password);
    return res
      .status(200)
      .send({ message: "Logged in!", accessToken: accessToken });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return res.status(401).send({ message: (error as Error).message });
    } else {
      return res.status(500).send({ message: "Something went wrong" });
    }
  }
});

app.listen(3000);
