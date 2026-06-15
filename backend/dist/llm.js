import OpenAI from "openai";
export class LLMService {
    constructor(apiKey) {
        // Using Puter's free unlimited OpenAI API
        this.openai = new OpenAI({
            apiKey: apiKey || "free", // Puter allows 'free' as API key for unlimited access
            baseURL: "https://api.puter.com/v1", // Puter's API endpoint
        });
    }
    async sendMessage(messages) {
        try {
            const response = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: messages,
                temperature: 0.7,
                max_tokens: 500,
            });
            const content = response.choices[0]?.message?.content;
            if (!content) {
                throw new Error("No response from Puter API");
            }
            return content;
        }
        catch (error) {
            console.error("Puter API Error:", error);
            throw new Error(`Failed to get response from Puter API: ${error.message}`);
        }
    }
}
//# sourceMappingURL=llm.js.map