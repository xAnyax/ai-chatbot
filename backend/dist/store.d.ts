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
export declare class ChatStore {
    private chats;
    constructor();
    private load;
    private save;
    createChat(userId: string): Chat;
    getChat(id: string, userId: string): Chat | undefined;
    getAllChats(userId: string): Chat[];
    addMessage(chatId: string, userId: string, message: ChatMessage): void;
    deleteChat(id: string, userId: string): boolean;
    updateChatTitle(id: string, userId: string, title: string): void;
}
export declare const chatStore: ChatStore;
//# sourceMappingURL=store.d.ts.map