import { v4 as uuidv4 } from "uuid";
import { readJsonFile, writeJsonFile } from "./persistence";
const CHATS_FILE = "chats.json";
export class ChatStore {
    constructor() {
        this.chats = new Map();
        this.load();
    }
    load() {
        const data = readJsonFile(CHATS_FILE, { chats: [] });
        this.chats = new Map(data.chats.map((chat) => [chat.id, chat]));
    }
    save() {
        writeJsonFile(CHATS_FILE, {
            chats: Array.from(this.chats.values()),
        });
    }
    createChat(userId) {
        const id = uuidv4();
        const now = new Date().toISOString();
        const chat = {
            id,
            userId,
            title: "New Chat",
            messages: [],
            createdAt: now,
            updatedAt: now,
        };
        this.chats.set(id, chat);
        this.save();
        return chat;
    }
    getChat(id, userId) {
        const chat = this.chats.get(id);
        if (!chat || chat.userId !== userId) {
            return undefined;
        }
        return chat;
    }
    getAllChats(userId) {
        return Array.from(this.chats.values())
            .filter((chat) => chat.userId === userId)
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
    addMessage(chatId, userId, message) {
        const chat = this.getChat(chatId, userId);
        if (chat) {
            chat.messages.push(message);
            chat.updatedAt = new Date().toISOString();
            this.save();
        }
    }
    deleteChat(id, userId) {
        const chat = this.getChat(id, userId);
        if (!chat)
            return false;
        this.chats.delete(id);
        this.save();
        return true;
    }
    updateChatTitle(id, userId, title) {
        const chat = this.getChat(id, userId);
        if (chat) {
            chat.title = title;
            chat.updatedAt = new Date().toISOString();
            this.save();
        }
    }
}
export const chatStore = new ChatStore();
//# sourceMappingURL=store.js.map