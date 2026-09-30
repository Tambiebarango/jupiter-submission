import express, { type Express, type Request, type Response } from "express";
import { login, signup } from "./services/authService.ts";

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
    await login(username, password);
    return res.status(200).send({ message: "Logged in!" });
  } catch {
    return res.status(401).send({ message: "Invalid username or password" });
  }
});

app.listen(3000);
