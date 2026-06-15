import axios, { AxiosInstance } from "axios";
import { AuthUser, ChatMessage } from "./types";

const API_BASE = "http://localhost:5000/api";
const MAX_CONTEXT_MESSAGES = 50;

declare global {
  interface Window {
    puter: any;
  }
}

function extractContentValue(content: unknown): string | null {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    const parts = content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object") {
          const item = part as Record<string, unknown>;
          if (typeof item.text === "string") return item.text;
          if (typeof item.content === "string") return item.content;
        }
        return null;
      })
      .filter((part): part is string => Boolean(part));

    if (parts.length > 0) {
      return parts.join("\n");
    }
  }

  if (content && typeof content === "object" && "toString" in content) {
    const text = (content as { toString: () => string }).toString();
    if (text && text !== "[object Object]") {
      return text;
    }
  }

  return null;
}

function extractPuterText(response: unknown): string {
  if (typeof response === "string") {
    return response;
  }

  if (!response || typeof response !== "object") {
    throw new Error("Unexpected AI response format");
  }

  const data = response as Record<string, unknown>;
  const message = data.message as Record<string, unknown> | undefined;

  if (message?.content != null) {
    const extracted = extractContentValue(message.content);
    if (extracted) return extracted;
  }

  const choiceContent = (
    data.choices as Array<{ message?: { content?: unknown } }> | undefined
  )?.[0]?.message?.content;

  if (choiceContent != null) {
    const extracted = extractContentValue(choiceContent);
    if (extracted) return extracted;
  }

  throw new Error("Could not extract text from Puter AI response");
}

function buildConversationMessages(
  history: ChatMessage[],
  userMessage: string,
): Array<{ role: "user" | "assistant"; content: string }> {
  const recentHistory = history.slice(-MAX_CONTEXT_MESSAGES);

  return [
    ...recentHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
    { role: "user" as const, content: userMessage },
  ];
}

class ChatBotAPI {
  private client: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE,
    });
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  private authHeaders() {
    return this.authToken
      ? { Authorization: `Bearer ${this.authToken}` }
      : undefined;
  }

  async register(username: string, email: string, password: string) {
    const response = await this.client.post("/auth/register", {
      username,
      email,
      password,
    });
    return response.data as { user: AuthUser; token: string };
  }

  async login(email: string, password: string) {
    const response = await this.client.post("/auth/login", { email, password });
    return response.data as { user: AuthUser; token: string };
  }

  async getMe() {
    const response = await this.client.get("/auth/me", {
      headers: this.authHeaders(),
    });
    return response.data as { user: AuthUser };
  }

  async sendMessage(
    chatId: string,
    userMessage: string,
    history: ChatMessage[] = [],
    model: string,
    persistToServer = true,
  ) {
    try {
      const conversation = buildConversationMessages(history, userMessage);

      const aiResponse = await window.puter.ai.chat(conversation, {
        model,
        temperature: 0.7,
        max_tokens: 500,
      });

      const replyText = extractPuterText(aiResponse);

      if (persistToServer) {
        await this.client.post(
          "/chat/message",
          {
            chatId,
            userMessage,
            aiResponse: replyText,
          },
          { headers: this.authHeaders() },
        );
      }

      return { reply: replyText };
    } catch (error: any) {
      console.error("Error:", error);
      throw error;
    }
  }

  async getChats() {
    const response = await this.client.get("/chats", {
      headers: this.authHeaders(),
    });
    return response.data;
  }

  async createChat() {
    const response = await this.client.post(
      "/chats",
      {},
      { headers: this.authHeaders() },
    );
    return response.data;
  }

  async deleteChat(chatId: string) {
    await this.client.delete(`/chats/${chatId}`, {
      headers: this.authHeaders(),
    });
  }

  async getChatMessages(chatId: string) {
    const response = await this.client.get(`/chats/${chatId}/messages`, {
      headers: this.authHeaders(),
    });
    return response.data;
  }
}

export const api = new ChatBotAPI();
