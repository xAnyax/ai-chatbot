import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { readJsonFile, writeJsonFile } from "./persistence";
const USERS_FILE = "users.json";
export class UserStore {
    constructor() {
        this.users = new Map();
        this.load();
    }
    load() {
        const data = readJsonFile(USERS_FILE, { users: [] });
        this.users = new Map(data.users.map((user) => [user.id, user]));
    }
    save() {
        writeJsonFile(USERS_FILE, {
            users: Array.from(this.users.values()),
        });
    }
    toPublicUser(user) {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt,
        };
    }
    getUserById(id) {
        return this.users.get(id);
    }
    getUserByEmail(email) {
        const normalized = email.trim().toLowerCase();
        return Array.from(this.users.values()).find((user) => user.email === normalized);
    }
    getUserByUsername(username) {
        const normalized = username.trim().toLowerCase();
        return Array.from(this.users.values()).find((user) => user.username.toLowerCase() === normalized);
    }
    async createUser(username, email, password) {
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
        const user = {
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
    async validateCredentials(email, password) {
        const user = this.getUserByEmail(email);
        if (!user)
            return null;
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid)
            return null;
        return this.toPublicUser(user);
    }
}
export const userStore = new UserStore();
//# sourceMappingURL=userStore.js.map