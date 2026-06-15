import { v4 as uuidv4 } from "uuid";
import { readJsonFile, writeJsonFile } from "./persistence";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface Chat {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

type ChatsFile = {
  chats: Chat[];
};

const CHATS_FILE = "chats.json";

export class ChatStore {
  private chats: Map<string, Chat> = new Map();

  constructor() {
    this.load();
  }

  private load(): void {
    const data = readJsonFile<ChatsFile>(CHATS_FILE, { chats: [] });
    this.chats = new Map(data.chats.map((chat) => [chat.id, chat]));
  }

  private save(): void {
    writeJsonFile<ChatsFile>(CHATS_FILE, {
      chats: Array.from(this.chats.values()),
    });
  }

  createChat(userId: string): Chat {
    const id = uuidv4();
    const now = new Date().toISOString();
    const chat: Chat = {
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

  getChat(id: string, userId: string): Chat | undefined {
    const chat = this.chats.get(id);
    if (!chat || chat.userId !== userId) {
      return undefined;
    }
    return chat;
  }

  getAllChats(userId: string): Chat[] {
    return Array.from(this.chats.values())
      .filter((chat) => chat.userId === userId)
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
  }

  addMessage(chatId: string, userId: string, message: ChatMessage): void {
    const chat = this.getChat(chatId, userId);
    if (chat) {
      chat.messages.push(message);
      chat.updatedAt = new Date().toISOString();
      this.save();
    }
  }

  deleteChat(id: string, userId: string): boolean {
    const chat = this.getChat(id, userId);
    if (!chat) return false;
    this.chats.delete(id);
    this.save();
    return true;
  }

  updateChatTitle(id: string, userId: string, title: string): void {
    const chat = this.getChat(id, userId);
    if (chat) {
      chat.title = title;
      chat.updatedAt = new Date().toISOString();
      this.save();
    }
  }
}

export const chatStore = new ChatStore();
