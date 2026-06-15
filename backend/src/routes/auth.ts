import express, { Request, Response } from "express";
import { authenticate, createAuthToken } from "../middleware/auth";
import { userStore } from "../userStore";

const router = express.Router();

router.post("/auth/register", async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Username, email, and password are required" });
    }

    const user = await userStore.createUser(username, email, password);
    const token = createAuthToken(user.id);

    res.status(201).json({ user, token });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/auth/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await userStore.validateCredentials(email, password);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = createAuthToken(user.id);
    res.json({ user, token });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/auth/me", authenticate, (req: Request, res: Response) => {
  const user = userStore.getUserById(req.userId!);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({ user: userStore.toPublicUser(user) });
});

export default router;
