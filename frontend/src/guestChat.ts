import { Chat } from "./types";

export function createGuestChat(): Chat {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title: "New Chat",
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}
