import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { readJsonFile, writeJsonFile } from "./persistence";

export interface UserRecord {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface PublicUser {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

type UsersFile = {
  users: UserRecord[];
};

const USERS_FILE = "users.json";

export class UserStore {
  private users: Map<string, UserRecord> = new Map();

  constructor() {
    this.load();
  }

  private load(): void {
    const data = readJsonFile<UsersFile>(USERS_FILE, { users: [] });
    this.users = new Map(data.users.map((user) => [user.id, user]));
  }

  private save(): void {
    writeJsonFile<UsersFile>(USERS_FILE, {
      users: Array.from(this.users.values()),
    });
  }

  toPublicUser(user: UserRecord): PublicUser {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  getUserById(id: string): UserRecord | undefined {
    return this.users.get(id);
  }

  getUserByEmail(email: string): UserRecord | undefined {
    const normalized = email.trim().toLowerCase();
    return Array.from(this.users.values()).find(
      (user) => user.email === normalized,
    );
  }

  getUserByUsername(username: string): UserRecord | undefined {
    const normalized = username.trim().toLowerCase();
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === normalized,
    );
  }

  async createUser(
    username: string,
    email: string,
    password: string,
  ): Promise<PublicUser> {
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedUsername = username.trim();

    if (!trimmedUsername || trimmedUsername.length < 2) {
      throw new Error("Username must be at least 2 characters");
    }

    if (!normalizedEmail.includes("@")) {
      throw new Error("A valid email is required");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    if (this.getUserByEmail(normalizedEmail)) {
      throw new Error("Email is already registered");
    }

    if (this.getUserByUsername(trimmedUsername)) {
      throw new Error("Username is already taken");
    }

    const user: UserRecord = {
      id: uuidv4(),
      username: trimmedUsername,
      email: normalizedEmail,
      passwordHash: await bcrypt.hash(password, 10),
      createdAt: new Date().toISOString(),
    };

    this.users.set(user.id, user);
    this.save();
    return this.toPublicUser(user);
  }

  async validateCredentials(
    email: string,
    password: string,
  ): Promise<PublicUser | null> {
    const user = this.getUserByEmail(email);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return null;

    return this.toPublicUser(user);
  }
}

export const userStore = new UserStore();
