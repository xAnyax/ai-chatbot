const CHAT_CACHE_KEYS = ["apiKey", "activeChatId", "chat-messages-cache"] as const;
export const AUTH_TOKEN_KEY = "authToken";
export const AUTH_USER_KEY = "authUser";

export function clearChatCache(): void {
  CHAT_CACHE_KEYS.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
}

export function loadStoredAuth(): { token: string | null; userJson: string | null } {
  return {
    token: sessionStorage.getItem(AUTH_TOKEN_KEY),
    userJson: sessionStorage.getItem(AUTH_USER_KEY),
  };
}

export function saveStoredAuth(token: string, userJson: string): void {
  sessionStorage.setItem(AUTH_TOKEN_KEY, token);
  sessionStorage.setItem(AUTH_USER_KEY, userJson);
}

export function clearStoredAuth(): void {
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
  sessionStorage.removeItem(AUTH_USER_KEY);
}

/** @deprecated Use clearChatCache or clearStoredAuth instead */
export function clearSessionCache(): void {
  clearChatCache();
}
