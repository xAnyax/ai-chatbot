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
export declare class UserStore {
    private users;
    constructor();
    private load;
    private save;
    toPublicUser(user: UserRecord): PublicUser;
    getUserById(id: string): UserRecord | undefined;
    getUserByEmail(email: string): UserRecord | undefined;
    getUserByUsername(username: string): UserRecord | undefined;
    createUser(username: string, email: string, password: string): Promise<PublicUser>;
    validateCredentials(email: string, password: string): Promise<PublicUser | null>;
}
export declare const userStore: UserStore;
//# sourceMappingURL=userStore.d.ts.map