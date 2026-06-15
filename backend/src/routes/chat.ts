import express, { Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import { chatStore } from "../store";
import { ChatMessage } from "../store";

const router = express.Router();

router.post("/chats", authenticate, (req: Request, res: Response) => {
  try {
    const chat = chatStore.createChat(req.userId!);
    res.json(chat);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/chats", authenticate, (req: Request, res: Response) => {
  try {
    const chats = chatStore.getAllChats(req.userId!);
    res.json(chats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get(
  "/chats/:id/messages",
  authenticate,
  (req: Request, res: Response) => {
    try {
      const chat = chatStore.getChat(req.params.id, req.userId!);
      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }
      res.json({ messages: chat.messages });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

router.delete("/chats/:id", authenticate, (req: Request, res: Response) => {
  try {
    const deleted = chatStore.deleteChat(req.params.id, req.userId!);
    if (!deleted) {
      return res.status(404).json({ error: "Chat not found" });
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/chat/message", authenticate, (req: Request, res: Response) => {
  try {
    const { chatId, userMessage, aiResponse } = req.body;

    if (!chatId || !userMessage || !aiResponse) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const chat = chatStore.getChat(chatId, req.userId!);
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const isFirstMessage = chat.messages.length === 0;

    const userMsg: ChatMessage = {
      role: "user",
      content: userMessage,
      timestamp: new Date().toISOString(),
    };
    chatStore.addMessage(chatId, req.userId!, userMsg);

    if (isFirstMessage) {
      const title =
        userMessage.substring(0, 30) + (userMessage.length > 30 ? "..." : "");
      chatStore.updateChatTitle(chatId, req.userId!, title);
    }

    const assistantMsg: ChatMessage = {
      role: "assistant",
      content: aiResponse,
      timestamp: new Date().toISOString(),
    };
    chatStore.addMessage(chatId, req.userId!, assistantMsg);

    res.json({ success: true });
  } catch (error: any) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
